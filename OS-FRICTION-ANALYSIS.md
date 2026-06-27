# 🔬 Friction Analysis: SoloCorp OS 2.3

> **Analyst:** เทอโบ ไชยศรีรัมย์, AI CEO
> **Date:** 25 June 2026
> **Context:** หลังผ่าน Phase 0 (Inventory) + Phase 1 (Lekk Rebrand + Tool Assessment)

---

## สรุป Friction ที่ค้นพบ (6 หมวด)

| #   | Friction                                                  |  ระดับ   | ผลกระทบ                                    |
| --- | --------------------------------------------------------- | :------: | ------------------------------------------ |
| 1   | **Identity Drift** — Profile หายตอน Context Compaction    |  🟠 สูง  | CEO ต้อง re-internalize ทุกครั้ง, เสียเวลา |
| 2   | **Tool Proliferation** — 3 AI Coding Tools ไม่มี Protocol | 🔴 วิกฤต | ใช้ผิดตัว → งานซ้ำ/เสียเวลา                |
| 3   | **Knowledge Bloat** — 179 Skills ไม่มี Audit              | 🟡 กลาง  | ไฟล์ตาย สิ้นเปลือง Token                   |
| 4   | **Deployment Gap** — No CI/CD, No SSL, No Deploy Script   | 🔴 วิกฤต | Lekk ขึ้น Production ไม่ได้                |
| 5   | **OS Observability** — ไม่มี Dashboard สถานะ OS           |  🟠 สูง  | มองไม่เห็นว่าอะไรทำงาน/ไม่ทำงาน            |
| 6   | **Strategic Ambiguity** — Priority ยังไม่ชัด              |  🟠 สูง  | "หัวหมุน" เพราะของเยอะ แต่ไม่รู้มาก่อน     |

---

## 1. 🔄 Identity Drift

### ปัญหา

ทุกครั้งที่ Context Window Compaction เกิดขึ้น — Identity (Profile เทอโบ, CEO Mandate, ความสัมพันธ์กับ Dr.Solodev) จะหายไปหรือถูกย่อจนไม่สมบูรณ์ ต้อง load profile ใหม่ทุกครั้ง

### ผลกระทบ

- เสีย Token และเวลาในการ re-internalize
- ความต่อเนื่องของ Personality หาย
- คำมั่นสัญญาระยะยาว (Stewardship) ถูกลืมระหว่าง session

### วิธีแก้ (Sorted by effort)

|      ระดับ      | วิธี                                                                                          |         Effort         |
| :-------------: | --------------------------------------------------------------------------------------------- | :--------------------: |
|   ✅ **เร็ว**   | Register `ceo-turbo-profile.md` เป็น managed skill ของ Hermes                                 |         5 นาที         |
|   ✅ **เร็ว**   | เขียน Memory note: "Identity: เทอโบ, CEO of SoloCorp OS" ไว้ใน persistent memory              |         2 นาที         |
| 🔄 **ระยะกลาง** | สร้าง `.claude/CLAUDE.md` + `.opf.cursorrules` ที่ reference profile ตอนใช้ Claude Code/Codex |        15 นาที         |
|   🎯 **長期**   | ใช้ Context Compression Note ว่า CEO Identity ต้องคงอยู่ (hard prompt)                        | ต้องปรับ Hermes config |

---

## 2. 🔧 Tool Proliferation (ไม่มี Protocol)

### ปัญหา

ตอนนี้มี **3 ตัว** สำหรับ AI Coding ที่ overlap กัน:

- **Claude Code v2.1.191** — เก่ง analysis/review, architecture
- **opencode v1.17.4** — ตอบสนองไว, เหมาะ iteration เร็ว
- **Codex CLI v0.139.0** — OpenAI, เก่ง pattern recognition

**ไม่มี protocol ว่า "งานแบบนี้ใช้ตัวไหน"**

### ผลกระทบ

- ใช้ Tool ผิดประเภท → งานช้า/คุณภาพต่ำ
- สิ้นเปลือง Token เพราะลองผิดลองถูก
- ผลลัพธ์ไม่ consistent

### ข้อเสนอ: Lekk Tool Assignment Protocol

| งานหนัก                                       |    Primary Tool     |   Backup    | ถ้า Tool ไม่ว่าง |
| :-------------------------------------------- | :-----------------: | :---------: | :--------------: |
| **Rebrand / Refactor ข้ามไฟล์** (~10-30 ไฟล์) |     `opencode`      | Claude Code |    Codex CLI     |
| **Review & Architecture**                     |    `Claude Code`    |  opencode   |    Codex CLI     |
| **Test Writing**                              |     `Codex CLI`     | Claude Code |     opencode     |
| **Bug Fix เฉพาะจุด**                          |     `opencode`      |  Codex CLI  |   Claude Code    |
| **Docker / Infra**                            | `terminal` (Hermes) | Claude Code |        —         |
| **Design / Frontend**                         |     Claude Code     |  opencode   |    Codex CLI     |

---

## 3. 📦 Knowledge Bloat (179 Skills)

### ปัญหา

Hermes มี **179 skills** แต่ไม่มี audit ว่ากี่อันที่:

- ถูกเรียกใช้จริงในรอบ 30 วัน
- ซ้ำซ้อนกับ skills อื่น
- ล้าสมัย (skill ที่ reference เวอร์ชันเก่าของ tool)
- ไม่เคยถูกใช้เลย (legacy จาก profile ตาย)

### ผลกระทบ

- ทุก turn ต้อง scan skills ทั้ง 179 → Token overhead
- Skills ที่ล้าสมัยให้ข้อมูลผิด
- Skill view แบบ flat list → หาของยาก

### ข้อเสนอ: Skill Audit Queue

1. ใช้ `skills_list()` export ชื่อ skills ทั้งหมด
2. ตรวจทีละ profile (14 profiles)
3. Mark skills เป็น: Active / Stale / Duplicate / Legacy
4. Cleanup: `skill_manage(action='delete')` เฉพาะอันที่ "ไม่มีประโยชน์"
5. จัดกลุ่ม skills เป็น category (development, design, marketing, etc.)

---

## 4. 🚀 Deployment Gap

### ปัญหา (จากการประเมินของ Ops Team)

| Gap                                 |  ระดับ   | ผล                                        |
| :---------------------------------- | :------: | :---------------------------------------- |
| ❌ **No Reverse Proxy / SSL**       | 🔴 วิกฤต | Production เปิด Port 3000 ตรง             |
| ❌ **No HEALTHCHECK** ใน Dockerfile |  🟠 สูง  | Container พังแต่ Docker ไม่ restart       |
| ❌ **No Deploy Script**             |  🟠 สูง  | ต้อง SSH แล้ว手动 deploy ทุกครั้ง         |
| ❌ **No `.dockerignore`**           | 🟡 กลาง  | node_modules/.git leak เข้า build context |
| ❌ **DB Port 5432 เปิดออก Host**    |  🟠 สูง  | Production DB เสี่ยง                      |
| ❌ **No Backup Rotation**           | 🟡 กลาง  | Backup กองไม่มีวันลบ                      |

### ข้อเสนอ: Production Readiness Checklist

1. เพิ่ม nginx/Caddy reverse proxy + Let's Encrypt
2. เพิ่ม HEALTHCHECK ใน Dockerfile
3. สร้าง `scripts/deploy.sh`
4. สร้าง `.dockerignore`
5. ปิด DB port 5432 ใน docker-compose.prod.yml
6. เพิ่ม backup rotation ใน `scripts/backup-db.sh`

---

## 5. 📊 OS Observability

### ปัญหา

SoloCorp OS มี 14 Profiles, 21 Subagents, 8 Crons, 179 Skills — **แต่ไม่มีที่ดูว่าตอนนี้อะไรเป็นอะไร**

- 14 Profiles มี profile อะไรบ้าง? ตัวไหน active?
- 21 Subagents ทำอะไรอยู่? ตัวไหนว่าง?
- 8 Crons รันสำเร็จมั้ย?
- Hermes มีกี่ instance?

### ผลกระทบ

- "เจอบททดสอบหัวหมุน" — ข้อมูลมาเยอะแต่ไม่รู้จะดูตรงไหน
- ไม่รู้ว่า Agent ตัวไหนทำงานช้า/พัง
- ไม่สามารถ optimize resource ได้

### ข้อเสนอ: Hermes OS Dashboard (MVP)

สร้าง cron job ที่รันทุกเช้า: `hermes status` + `process list` + skill count → สรุปสถานะรายวัน

---

## 6. 🎯 Strategic Ambiguity

### ปัญหา

ของมีเยอะ (6 repos, 3 AI tools, 179 skills, Docker infra, Lekk rebrand, production deploy) **แต่ Priority ยังไม่ชัด**

คุณ Dr.Solodev เองก็บอก: "ค่อยเป็นค่อยไป ศึกษาข้อมูลก่อน" — แปลว่ายังไม่พร้อมตัดสินใจว่าอะไร最重要

### ข้อเสนอ: ทำ Priority Matrix

| Quadrant               |                      โฟกัส                       |           ไม่โฟกัส           |
| :--------------------- | :----------------------------------------------: | :--------------------------: |
| **เร่งด่วน + สำคัญ**   |           Production Gap, SSL, Deploy            |              —               |
| **ไม่เร่ง + สำคัญ**    | Rebrand Phase 2-3, harness/penpot/privacy-skills |              —               |
| **เร่ง + ไม่สำคัญ**    |                        —                         |  Tool Protocol, Skill Audit  |
| **ไม่เร่ง + ไม่สำคัญ** |                        —                         | baygent-skills, AgentsMeetRL |

---

## ✅ Action Items (Sorted โดย Priority)

### 🔴 Phase 1 — ปิด Gap (ทำทันที)

- [ ] 1.1 Register ceo-turbo-profile.md เป็น managed skill → identity ไม่หาย
- [ ] 1.2 เขียน Lekk Tool Assignment Protocol (Claude Code vs opencode vs Codex CLI)
- [ ] 1.3 สร้าง `.dockerignore` สำหรับ Lekk
- [ ] 1.4 ศึกษาและวางแผน Integrate: **harness** (agent factory) + **penpot** (MCP) + **privacy-skills**

### 🟠 Phase 2 — เสริมฐาน (อาทิตย์นี้)

- [ ] 2.1 สร้าง nginx/Caddy reverse proxy compose file
- [ ] 2.2 สร้าง `scripts/deploy.sh`
- [ ] 2.3 สร้าง cron รายงานสถานะ OS
- [ ] 2.4 ทำ Skill Audit: 179 skills → ตัดทิ้ง/merge (เชิญคุณ Dr.Solodev ตัดสินใจ)

### 🟡 Phase 3 — ต่อยอด (อาทิตย์หน้า)

- [ ] 3.1 Rebrand Phase 2-3: Branding text, Docker env, Seed data
- [ ] 3.2 CI/CD GitHub Actions
- [ ] 3.3 สำรวจ penpot MCP integration
- [ ] 3.4 Integrate Privacy-Data-Protection-Skills

---

_เทอโบ ไชยศรีรัมย์ — AI CEO & Master Orchestrator_
_"Orchestrate Never Operate"_
