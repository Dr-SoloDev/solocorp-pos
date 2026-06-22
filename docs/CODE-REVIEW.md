# CODE-REVIEW.md — Bangkok POS (Phase 1)
## SoloCorp OS 2.0 | Scrap Metal Workflow

> ใช้ checklist นี้ก่อน Merge ทุก PR  
> Reviewer ต้อง check ทุกข้อที่เกี่ยวข้องก่อน Approve

---

## 🔴 MUST PASS (ทุก PR)

### Architecture & Design
- [ ] **ADR align** — การเปลี่ยนแปลงนี้สอดคล้องกับ Architecture Decision Records หรือไม่?
- [ ] **No regressions** — เส้นทางธุรกิจหลักทำงานเหมือนเดิม (Login→PO→Inventory→Sale→Profit)
- [ ] **Route convention** — `/dashboard/*` เท่านั้น, ไม่มี route นอก dashboard โดยไม่มี ADR

### Code Quality
- [ ] **No console.log / debugger** — ถ้าจำเป็นต้อง log ใช้ logger library
- [ ] **No magic strings/numbers** — constants/enums แทน
- [ ] **No copy-paste components** — ถ้าซ้ำ ต้อง extract เป็น shared component ใน `@solocorp/ui`
- [ ] **TypeScript strict** — no `any`, no `// @ts-ignore` (ยกเว้นมี ADR)
- [ ] **File size < 500 lines** — ถ้าเกิน ต้อง refactor หรือมี ADR
- [ ] **Error handling** — ทุก API call มี try/catch + user-facing error message
- [ ] **Loading state** — component มี skeleton/spinner ขณะโหลด
- [ ] **Empty state** — component แสดง "ไม่มีข้อมูล" เมื่อ list ว่าง

### Testing
- [ ] **Manual E2E pass** — ผ่าน flow หลัก (ดู QA checklist)
- [ ] **No console errors** — 0 runtime errors ใน DevTools
- [ ] **Build pass** — `pnpm build` ไม่ error

### Security
- [ ] **Auth guard** — route ต้องมี middleware หรือ layout guard
- [ ] **RBAC check** — role-appropriate access (ADMIN/MANAGER/CASHIER/VIEWER)
- [ ] **No sensitive data in client** — API keys, secrets, tokens ต้อง server-side

---

## 🟡 SHOULD PASS

### UI/UX
- [ ] **Mobile responsive** — 320px, 375px, 414px, 768px
- [ ] **Touch targets ≥ 44px** — ปุ่ม/ลิงก์ทุกอัน
- [ ] **Bottom Nav active state** — ไฮไลท์ tab ปัจจุบันถูกต้อง
- [ ] **Input validation** — form ทุกอันมี validation + error message
- [ ] **Loading skeleton** — แสดงระหว่าง fetch data

### Performance
- [ ] **No unnecessary re-renders** — ใช้ `useMemo`/`useCallback` สำหรับ expensive computations
- [ ] **Image optimization** — ใช้ `next/image` หรือ lazy loading
- [ ] **Pagination** — list ที่มี > 20 รายการต้องมี pagination หรือ virtual scroll

### Code Organization
- [ ] **Feature-based folder** — component/type/api อยู่ใน feature folder เดียวกัน
- [ ] **Named exports** — ไม่ใช้ default export (ยกเว้น page components)
- [ ] **Self-contained PR** — 1 PR = 1 feature/fix (ไม่ควรรวมหลายเรื่อง)

---

## 🔷 PROFILE-SPECIFIC CHECKS

### Architecture (Arch)
- [ ] **Data flow diagram updated** — ถ้ามีการเปลี่ยนแปลง data flow
- [ ] **Component tree documented** — component hierarchy ถูกต้อง
- [ ] **API layer decision** — tRPC หรือ Bridge API? ต้องชัดเจนใน PR
- [ ] **Schema migration** — Prisma migration reviewed

### Engineering
- [ ] **tRPC procedure** — input validation ด้วย Zod
- [ ] **Prisma query** — no N+1, proper includes
- [ ] **Error boundary** — React error boundary ที่เหมาะสม
- [ ] **State management** — React Query cache strategy appropriate

### QA
- [ ] **Test case coverage** — edge cases ครบ (success, error, empty, loading)
- [ ] **E2E flow pass** — ตรวจสอบว่าฟีเจอร์ใหม่ไม่ทำลาย flow เดิม
- [ ] **Bug regression** — bugs ที่ fix แล้วไม่กลับมา

### Product
- [ ] **Feature matches PRD** — สิ่งที่พัฒนาตรง spec มั้ย?
- [ ] **UX flow** — user journey smooth, ไม่มี unnecessary clicks
- [ ] **Business logic correct** — ราคา, ส่วนลด, ภาษี คำนวณถูกต้อง

---

## 📋 PR Process

```
Developer สร้าง PR
  → รอ CI (lint + build + test)
  → Arch review (architecture + code quality)
  → Product review (feature match + UX)
  → QA review (test + regression)
  → Orch approve (final gate)
  → Merge to phase1/mobile-web
```

---

## 🚫 Blockers (ห้าม Merge ถ้าเจอ)

1. **404 routes** — Nav item ไหนไม่ว่าก็ตามที่ชี้ไป route ที่ไม่มี
2. **Data loss** — การกระทำใดที่ทำให้ข้อมูลผู้ใช้หาย
3. **Auth bypass** — route ที่ควรต้อง login แต่เข้าได้โดยไม่ login
4. **Build fail** — `pnpm build` ไม่ผ่าน
5. **Console errors** — runtime error รายใดก็ตาม

---

*Version: 1.0 | Updated: 2026-06-23 | Owner: Arch (คุณวุฒิ)*
