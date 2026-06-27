/**
 * Lekk POS — Service Worker
 * ===============================
 * PWA Service Worker สำหรับ Project Bangkok Phase 1
 *
 * Strategy: Network-first with cache fallback
 * - API calls: network-first (forward credentials)
 * - Static assets: cache-first
 * - Shell pages: network-first (update cache on load)
 *
 * Phase 1: แบบ basic offline support
 * Phase 2 (future): Full offline with IndexedDB sync queue
 *
 * @phase 1
 */

/// <reference lib="webworker" />

// Prevent TypeScript strict errors on self
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "lekk-pos-v1";
const STATIC_CACHE = `${CACHE_NAME}-static`;
const SHELL_CACHE = `${CACHE_NAME}-shell`;

// ─── Static Assets to Pre-cache ──────────────────────────────────────────────

const PRECACHE_URLS: string[] = [
  "/",
  "/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ─── API Pattern (for network-first routing) ─────────────────────────────────

const API_PATTERN = /\/api\//;
const SHELL_PATTERN = /^\/($|purchases|inventory|reports|sale-lots|catalog|sellers)/;

// ═══════════════════════════════════════════════════════════════════════════════
// Install Event
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })()
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// Activate Event — Clean Old Caches
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== SHELL_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// Fetch Event — Routing Strategy
// ═══════════════════════════════════════════════════════════════════════════════

self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // ─── API Requests: Network-first ─────────────────
  if (API_PATTERN.test(url.pathname)) {
    event.respondWith(networkFirstWithAuth(request));
    return;
  }

  // ─── Shell Pages: Network-first (stale-while-revalidate) ───
  if (SHELL_PATTERN.test(url.pathname)) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ─── Static Assets: Cache-first ──────────────────
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ─── Default: Network-only ───────────────────────
  event.respondWith(fetch(request));
});

// ═══════════════════════════════════════════════════════════════════════════════
// Strategy Implementations
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cache-first: ใช้ cache ถ้ามี ถ้าไม่มีไปขอ network
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Clone because response can only be consumed once
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network-first with auth: พยายาม fetch จาก network ก่อน
 * ถ้า network ล้มเหลว (offline) → ใช้ cache fallback
 * ส่ง credentials แบบ include เพื่อส่ง cookies
 */
async function networkFirstWithAuth(request: Request): Promise<Response> {
  try {
    const fetchOptions: RequestInit = {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    };

    const response = await fetch(request, fetchOptions);

    // Cache successful API responses (GET only)
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // When offline, try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // No cache available — return offline response
    return new Response(
      JSON.stringify({
        status: "error",
        message: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        offline: true,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Network-first with fallback: สำหรับ shell pages
 * ถ้า network ได้ → cache แล้ว return
 * ถ้า offline → ใช้ cache + offline page
 */
async function networkFirstWithFallback(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Ultimate fallback: offline page
    const offlineResponse = await caches.match("/offline");
    if (offlineResponse) return offlineResponse;

    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network-only: ไม่มี cache
 */
async function networkOnly(request: Request): Promise<Response> {
  return fetch(request);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service Worker Registration Helper (ใช้ใน client component)
// ═══════════════════════════════════════════════════════════════════════════════

export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator && "Notification" in window) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        console.log(
          `[SW] Registered: ${registration.scope} (${registration.active?.state || "installing"})`
        );

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New version available — show update prompt
                showUpdatePrompt(registration);
              }
            });
          }
        });
      } catch (error) {
        console.error("[SW] Registration failed:", error);
      }
    });
  }
}

/**
 * แสดง prompt อัปเดตเมื่อมี service worker version ใหม่
 */
function showUpdatePrompt(registration: ServiceWorkerRegistration): void {
  // Dispatch custom event for the app to handle
  window.dispatchEvent(
    new CustomEvent("sw-update-available", {
      detail: { registration },
    })
  );

  // Auto-update after 24 hours
  const lastPrompted = localStorage.getItem("sw-update-prompted");
  if (!lastPrompted || Date.now() - Number(lastPrompted) > 24 * 60 * 60 * 1000) {
    localStorage.setItem("sw-update-prompted", String(Date.now()));

    if (
      window.confirm(
        "มีเวอร์ชันใหม่พร้อมใช้งานแล้ว กด 'ตกลง' เพื่ออัปเดต"
      )
    ) {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  }
}
