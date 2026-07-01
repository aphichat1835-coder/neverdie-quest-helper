# NeverDie Quest Bot — คู่มือการใช้งาน

Bot สำหรับบริหารจัดการ Discord Quest อัตโนมัติ ควบคุมผ่าน Slash Commands ใน Discord Server

---

## การติดตั้ง

```bash
npm install
cp .env.example .env
# กรอกค่าใน .env ให้ครบถ้วน
npm run register   # ลงทะเบียน Slash Commands (ทำครั้งแรก)
npm start          # เริ่มใช้งาน
```

---

## ตัวแปร Environment

| ตัวแปร | คำอธิบาย | จำเป็น |
|--------|----------|--------|
| `DISCORD_BOT_TOKEN` | Token ของ Bot | ✅ |
| `DISCORD_CLIENT_ID` | Application ID ของ Bot | ✅ |
| `DISCORD_GUILD_ID` | Server ID | ✅ |
| `OWNER_ID` | Discord User ID ของเจ้าของ | ✅ |
| `TIMEZONE` | Timezone (ค่าเริ่มต้น: `Asia/Bangkok`) | ➖ |
| `LOG_CHANNEL_ID` | ห้องรับการแจ้งเตือน | ➖ |
| `MANAGER_ROLE_ID` | Role สำหรับผู้จัดการ | ➖ |
| `DATABASE_PATH` | ที่อยู่ไฟล์ DB (ค่าเริ่มต้น: `./data/quests.db`) | ➖ |

---

## คำสั่งทั้งหมด

### ทั่วไป
- `/ping` — ตรวจสอบสถานะ Bot
- `/help` — แสดงรายการคำสั่ง
- `/api-status` — ตรวจสอบสถานะฐานข้อมูลและ Runner

### Quest Runner
- `/panel` — แผงควบคุมหลัก พร้อมปุ่ม Start / Stop / Refresh และจัดการ Quest ครบชุด
- `/run` — เริ่มต้น Quest Runner
- `/stop` — หยุด Quest Runner

### Quest Tracker
- `/quest-add` — เพิ่ม Quest พร้อม Deadline
- `/quest-list` — ดูรายการ Quest ทั้งหมด
- `/quest-done` — มาร์ค Quest ว่าเสร็จสิ้น
- `/quest-remove` — ลบ Quest ออกจากรายการ
- `/quest-status` — ดูสถิติสรุป

---

## สถานะ Runner (Real-time)

ขณะที่ Runner ทำงาน Bot จะแสดงสถานะผ่าน embed message เดียว และอัปเดตต่อเนื่อง แสดงข้อมูล:

- จำนวน Quest ที่พบและดำเนินการอยู่
- ลำดับ Quest ปัจจุบัน (เช่น 2 / 5)
- Progress bar ความคืบหน้า
- เวลาที่ใช้ไปทั้งหมด

---

## ระบบแจ้งเตือน

เมื่อตั้งค่า `LOG_CHANNEL_ID` ระบบจะแจ้งเตือนอัตโนมัติ:

- **ทุก 1 ชั่วโมง** — Quest ที่เกิน Deadline หรือใกล้ถึงกำหนด
- **ทุกวัน 08:00 น.** — Daily Summary สรุปสถานะ Quest ประจำวัน

---

## ฐานข้อมูล

ใช้ `better-sqlite3` เก็บข้อมูลที่ `DATABASE_PATH`

> **หมายเหตุ:** หากระบบ Host มี ephemeral filesystem ควร mount persistent disk เพื่อป้องกันข้อมูลสูญหายเมื่อ redeploy
