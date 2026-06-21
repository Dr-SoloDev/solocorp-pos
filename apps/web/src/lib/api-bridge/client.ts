/**
 * SoloCorp POS — Bridge API HTTP Client
 * ==========================================
 * HTTP client wrapper สำหรับเชื่อมต่อ PHP Backend ผ่าน Strangler Fig Bridge Layer
 *
 * Features:
 * - Cookie forwarding (JWT token)
 * - Retry with exponential backoff
 * - Error normalization (APIError type)
 * - Request/response interceptors
 * - Timeout handling
 *
 * @phase 1
 * @module api-bridge/client
 */

// ─── Error Types ────────────────────────────────────────────────────────────

export class BridgeApiError extends Error {
  public readonly code: string;
  public readonly fieldErrors?: Record<string, string[]>;
  public readonly timestamp: string;

  constructor(
    public readonly status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "BridgeApiError";
    this.code = BridgeApiError.normalizeCode(status, code);
    this.fieldErrors = fieldErrors;
    this.timestamp = new Date().toISOString();
  }

  private static normalizeCode(status: number, code: string): string {
    if (code && code !== "UNKNOWN") return code;
    const codes: Record<number, string> = {
      400: "BAD_REQUEST",
      401: "UNAUTHORIZED",
      403: "FORBIDDEN",
      404: "NOT_FOUND",
      409: "CONFLICT",
      422: "VALIDATION_ERROR",
      429: "RATE_LIMITED",
      500: "SERVER_ERROR",
      502: "BAD_GATEWAY",
      503: "SERVICE_UNAVAILABLE",
    };
    return codes[status] || "UNKNOWN_ERROR";
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Static factory — สร้าง BridgeApiError จาก HTTP response
   */
  static fromHttpError(
    status: number,
    body: { code?: string; message?: string; fieldErrors?: Record<string, string[]> }
  ): BridgeApiError {
    return new BridgeApiError(
      status,
      body?.code || "UNKNOWN",
      body?.message || `HTTP ${status}`,
      body?.fieldErrors
    );
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** สำหรับแสดง toast notification */
  get userMessage(): string {
    const messages: Record<string, string> = {
      UNAUTHORIZED: "กรุณาเข้าสู่ระบบอีกครั้ง",
      FORBIDDEN: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      NOT_FOUND: "ไม่พบข้อมูลที่ต้องการ",
      VALIDATION_ERROR: "กรุณาตรวจสอบข้อมูลอีกครั้ง",
      RATE_LIMITED: "ดำเนินการเร็วเกินไป กรุณารอสักครู่",
      SERVER_ERROR: "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่ภายหลัง",
      BAD_GATEWAY: "ระบบไม่พร้อมใช้งาน กรุณาลองภายหลัง",
      SERVICE_UNAVAILABLE: "ระบบกำลังปิดปรับปรุง กรุณาลองภายหลัง",
      CONFLICT: "ข้อมูลซ้ำซ้อน กรุณาตรวจสอบ",
    };
    return messages[this.code] || this.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
  }
}

// ─── Bridge Config ──────────────────────────────────────────────────────────

interface BridgeConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  maxDelay: number;
  headers: Record<string, string>;
}

const defaultConfig: BridgeConfig = {
  baseUrl: (typeof process !== "undefined" && process.env.PHP_API_URL) || "/api",
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000,
  maxDelay: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

let bridgeConfig: BridgeConfig = { ...defaultConfig };

export function configureBridge(config: Partial<BridgeConfig>): void {
  bridgeConfig = { ...bridgeConfig, ...config };
}

export function getBridgeConfig(): Readonly<BridgeConfig> {
  return bridgeConfig;
}

// ─── Cookie Helpers ─────────────────────────────────────────────────────────

/**
 * ดึงค่า cookie จาก document.cookie
 * ทำงานเฉพาะ client-side
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  const value = match?.[2];
  return value !== undefined ? decodeURIComponent(value) : null;
}

/**
 * สร้าง Cookie header string สำหรับ server-side request
 */
function buildCookieHeader(): string {
  if (typeof document === "undefined") return "";
  return document.cookie;
}

// ─── Response Types ─────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  status: "success";
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiPaginatedResponse<T> {
  status: "success";
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Retry Logic ────────────────────────────────────────────────────────────

interface RetryOptions {
  attempt: number;
  maxRetries: number;
  delay: number;
  maxDelay: number;
}

function shouldRetry(error: BridgeApiError, options: RetryOptions): boolean {
  if (options.attempt >= options.maxRetries) return false;
  if (error.isAuthError) return false;
  if (error.isForbidden) return false;
  if (error.isRateLimited) return options.attempt < 1; // retry once for 429
  if (error.isServerError) return true;
  if (error.isNetworkError) return true;
  return false;
}

function calculateDelay(options: RetryOptions): number {
  const delay = Math.min(
    options.delay * Math.pow(2, options.attempt),
    options.maxDelay
  );
  // Add jitter (±20%)
  return delay * (0.8 + Math.random() * 0.4);
}

// ─── Core HTTP Methods ──────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  customConfig?: Partial<BridgeConfig>
): Promise<T> {
  const config = { ...bridgeConfig, ...customConfig };
  const url = `${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  let lastError: BridgeApiError | null = null;

  for (let attempt = 0; attempt <= config.retryCount; attempt++) {
    try {
      const headers: Record<string, string> = {
        ...config.headers,
      };

      // Forward cookies for auth token
      const cookieStr = buildCookieHeader();
      if (cookieStr) {
        headers["Cookie"] = cookieStr;
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        credentials: "include",
      };

      if (body !== undefined && method !== "GET") {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw BridgeApiError.fromHttpError(response.status, errorBody);
      }

      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BridgeApiError) {
        lastError = error;
        if (!shouldRetry(error, {
          attempt,
          maxRetries: config.retryCount,
          delay: config.retryDelay,
          maxDelay: config.maxDelay,
        })) {
          throw error;
        }
      } else if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new BridgeApiError(0, "TIMEOUT", "Request timeout");
        // Retry on timeout
      } else if (error instanceof TypeError) {
        // Network error (fetch failed)
        lastError = new BridgeApiError(0, "NETWORK_ERROR", "Network error");
        // Retry on network error
      } else {
        throw error; // Unknown error, don't retry
      }

      // Wait before retry
      if (attempt < config.retryCount) {
        const delay = calculateDelay({
          attempt,
          maxRetries: config.retryCount,
          delay: config.retryDelay,
          maxDelay: config.maxDelay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new BridgeApiError(0, "UNKNOWN", "Unknown error");
}

// ─── Public HTTP Methods ────────────────────────────────────────────────────

export async function get<T>(
  path: string,
  params?: Record<string, unknown>,
  config?: Partial<BridgeConfig>
): Promise<T> {
  let fullPath = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) fullPath += `?${qs}`;
  }
  return request<T>("GET", fullPath, undefined, config);
}

export async function post<T>(
  path: string,
  body?: unknown,
  config?: Partial<BridgeConfig>
): Promise<T> {
  return request<T>("POST", path, body, config);
}

export async function put<T>(
  path: string,
  body?: unknown,
  config?: Partial<BridgeConfig>
): Promise<T> {
  return request<T>("PUT", path, body, config);
}

export async function del<T>(
  path: string,
  body?: unknown,
  config?: Partial<BridgeConfig>
): Promise<T> {
  return request<T>("DELETE", path, body, config);
}

/**
 * HTTP Client object — ใช้งานสะดวกใน module files
 */
export const client = {
  get,
  post,
  put,
  delete: del,
};
