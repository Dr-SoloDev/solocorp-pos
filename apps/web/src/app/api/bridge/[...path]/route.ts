/**
 * SoloCorp POS — Bridge API Proxy Route
 * =========================================
 * Single entry-point for all Bridge API requests.
 * Forwards client requests to the PHP backend (NEXT_PUBLIC_PHP_API_URL).
 *
 * Flow:
 *   Client → /api/bridge/sale-lots/list
 *         → this handler → PHP_API_URL/sale-lots/list
 *         → response back to client
 *
 * Environment:
 *   NEXT_PUBLIC_PHP_API_URL — target PHP backend URL (e.g. http://php-backend:8080/api)
 *   Falls back to PHP_API_URL if NEXT_PUBLIC_PHP_API_URL is not set.
 *
 * @phase 1
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Config ────────────────────────────────────────────────────────────────

const PHP_API_URL =
  process.env.NEXT_PUBLIC_PHP_API_URL ?? process.env.PHP_API_URL ?? "";

// ─── Forbidden headers (must not be forwarded) ────────────────────────────

const FORBIDDEN_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "upgrade",
  "proxy-",
  "sec-websocket-",
  "origin", // Let the backend see origin? Keep for now, remove if needed
]);

function shouldForwardHeader(name: string): boolean {
  const lower = name.toLowerCase();
  for (const forbidden of FORBIDDEN_HEADERS) {
    if (lower === forbidden || lower.startsWith(forbidden.replace(/\/$/, ""))) {
      return false;
    }
  }
  return true;
}

// ─── Proxy handler ────────────────────────────────────────────────────────

async function handleProxy(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Return 502 if PHP API URL is not configured
  if (!PHP_API_URL) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Bridge API is not configured. Set NEXT_PUBLIC_PHP_API_URL or PHP_API_URL environment variable.",
      },
      { status: 502 },
    );
  }

  // Build target URL
  const pathSegments = params.path?.join("/") ?? "";
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `${PHP_API_URL}/${pathSegments}${searchParams ? `?${searchParams}` : ""}`;

  // Prepare forwarding headers
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (shouldForwardHeader(key)) {
      forwardHeaders.set(key, value);
    }
  });

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
    // Forward cookies for PHP session auth
    credentials: "include",
  };

  // Forward body for non-GET/HEAD requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    } catch {
      // No body to forward
    }
  }

  try {
    // Forward the request to PHP backend
    const upstreamResponse = await fetch(targetUrl, {
      ...fetchOptions,
      // Signal timeout — 30 seconds
      signal: AbortSignal.timeout(30_000),
    });

    // Read response body
    const responseBody = await upstreamResponse.text();

    // Build response headers
    const responseHeaders: Record<string, string> = {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    // Forward Content-Type from upstream if present
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      responseHeaders["Content-Type"] = contentType;
    }

    // Forward Set-Cookie headers (for PHP session cookies)
    // getSetCookie() returns all values (multiple cookies) — supported in Node.js 19+
    try {
      const setCookies = upstreamResponse.headers.getSetCookie();
      if (setCookies.length > 0) {
        responseHeaders["Set-Cookie"] = setCookies.join(", ");
      }
    } catch {
      // Fallback: get() returns only the first Set-Cookie header
      const setCookie = upstreamResponse.headers.get("set-cookie");
      if (setCookie) {
        responseHeaders["Set-Cookie"] = setCookie;
      }
    }

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Bridge Proxy] Upstream request failed:", error);

    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";

    return NextResponse.json(
      {
        status: "error",
        message: isTimeout
          ? "Bridge API timeout — upstream server did not respond in time"
          : "Bridge API error — upstream server unreachable",
      },
      { status: 502 },
    );
  }
}

// ─── Export handlers for all HTTP methods ─────────────────────────────────

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
