/**
 * SoloCorp POS — PWA Manifest
 * =============================
 * Web App Manifest สำหรับ Project Bangkok Phase 1
 *
 * Design System: Industrial Modern
 * Theme color: #1A56DB (primary-600)
 * Background: #F9FAFB (steel-50)
 *
 * @phase 1
 */

const manifest = {
  name: "SoloCorp POS",
  short_name: "SoloCorp",
  description: "ระบบรับซื้อของเก่า — สำหรับร้านรับซื้อของเก่าและคนขายของเก่า",
  start_url: "/",
  display: "standalone",
  background_color: "#F9FAFB",
  theme_color: "#1A56DB",
  orientation: "portrait-primary",
  scope: "/",
  lang: "th-TH",
  dir: "ltr",
  categories: ["business", "finance", "retail"],
  prefer_related_applications: false,
  icons: [
    {
      src: "/icons/icon-72x72.png",
      sizes: "72x72",
      type: "image/png",
    },
    {
      src: "/icons/icon-96x96.png",
      sizes: "96x96",
      type: "image/png",
    },
    {
      src: "/icons/icon-128x128.png",
      sizes: "128x128",
      type: "image/png",
    },
    {
      src: "/icons/icon-144x144.png",
      sizes: "144x144",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-152x152.png",
      sizes: "152x152",
      type: "image/png",
    },
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable",
    },
    {
      src: "/icons/icon-384x384.png",
      sizes: "384x384",
      type: "image/png",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
  screenshots: [],
  shortcuts: [
    {
      name: "รับซื้อใหม่",
      short_name: "รับซื้อ",
      description: "สร้างใบรับซื้อใหม่",
      url: "/purchases/new",
      icons: [
        {
          src: "/icons/shortcut-purchase.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
    },
    {
      name: "ขาย Lot",
      short_name: "ขาย",
      description: "สร้าง Sale Lot ใหม่",
      url: "/sale-lots/new",
      icons: [
        {
          src: "/icons/shortcut-sale.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
    },
  ],
} as const;

export default manifest;
