/**
 * SoloCorp POS — PWA Manifest Route
 * =====================================
 * Serves the Web App Manifest JSON at /manifest.json
 *
 * @phase 1
 */

import { NextResponse } from "next/server";
import manifest from "@/lib/pwa/manifest";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
