<div align="center">

# NeverDie Quest Bot

**ระบบบริหารจัดการ Discord Quest อัตโนมัติ ผ่าน Discord Bot**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-20-green.svg)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-14-5865f2.svg)](https://discord.js.org/)
[![SQLite](https://img.shields.io/badge/sqlite-better--sqlite3-lightgrey.svg)](https://github.com/WiseLibs/better-sqlite3)

</div>

---

## ภาพรวม

**NeverDie Quest Bot** คือ Discord Bot ที่รวมระบบ Quest Runner และ Quest Tracker ไว้ในกระบวนการเดียว ควบคุมทุกอย่างได้จาก Discord Server โดยไม่ต้องติดตั้งซอฟต์แวร์เพิ่มเติม

```
Discord Server
      │
      ▼  Slash Commands
  ┌─────────────┐
  │  Discord Bot │  ← discord.js 14 · Node.js
  └──────┬──────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Quest    Quest
  Runner   Tracker
 (Auto)   (SQLite)
```

---

## การติดตั้ง

### ข้อกำหนดเบื้องต้น

- Node.js 20 ขึ้นไป
- npm หรือ yarn

### ขั้นตอน

```bash
# 1. เข้าไปที่โฟลเดอร์บอท
cd bot

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า environment
cp .env.example .env
# แก้ไขไฟล์ .env ให้ครบถ้วน

# 4. ลงทะเบียน Slash Commands (ทำครั้งแรกหรือเมื่อแก้คำสั่ง)
npm run register

# 5. เริ่มใช้งาน
npm start
```

---

## การตั้งค่า Environment

แก้ไขไฟล์ `bot/.env` ด้วยค่าต่อไปนี้:

| ตัวแปร | คำอธิบาย | จำเป็น |
|--------|----------|--------|
| `DISCORD_BOT_TOKEN` | Token ของ Bot จาก Discord Developer Portal | ✅ |
| `DISCORD_CLIENT_ID` | Application ID ของ Bot | ✅ |
| `DISCORD_GUILD_ID` | ID ของ Discord Server ที่ใช้งาน | ✅ |
| `OWNER_ID` | Discord User ID ของเจ้าของ Bot | ✅ |
| `TIMEZONE` | Timezone (ค่าเริ่มต้น: `Asia/Bangkok`) | ➖ |
| `LOG_CHANNEL_ID` | ID ของห้องสำหรับรับการแจ้งเตือน | ➖ |
| `MANAGER_ROLE_ID` | ID ของ Role ที่ได้รับสิทธิ์จัดการ | ➖ |
| `DATABASE_PATH` | ที่อยู่ไฟล์ฐานข้อมูล (ค่าเริ่มต้น: `./data/quests.db`) | ➖ |

---

## คำสั่งทั้งหมด

### แผงควบคุมหลัก

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `/panel` | เปิดแผงควบคุมพร้อมปุ่มกดครบชุด |
| `/ping` | ตรวจสอบสถานะ Bot |
| `/help` | แสดงรายการคำสั่งทั้งหมด |
| `/api-status` | ตรวจสอบสถานะฐานข้อมูลและ Runner |

### Quest Runner

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `/run` | เริ่มต้น Quest Runner |
| `/stop` | หยุด Quest Runner ที่กำลังทำงาน |

### Quest Tracker

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `/quest-add` | เพิ่ม Quest พร้อมกำหนด Deadline และบันทึก |
| `/quest-list` | แสดงรายการ Quest ทั้งหมด |
| `/quest-done` | บันทึก Quest ว่าเสร็จสิ้น |
| `/quest-remove` | ลบ Quest ออกจากรายการ |
| `/quest-status` | แสดงสรุปสถิติ Quest |

---

## แผงควบคุม `/panel`

แผงควบคุมแสดงข้อมูลแบบ real-time และมีปุ่มดำเนินการครบชุด:

```
┌─────────────────────────────────────────────┐
│  🎮 NeverDie Quest — Control Panel           │
│  📦 ทั้งหมด: 5  ✅ เสร็จสิ้น: 3  🔴 ค้าง: 2 │
├─────────────────────────────────────────────┤
│  [📋 รายการ]  [➕ เพิ่ม]  [✅ Done]  [📊 สถิติ]  │
│  [⚡ Start Runner]  [🛑 Stop]  [🔄 Refresh]  │
└─────────────────────────────────────────────┘
```

Bot จะแสดงสถานะความคืบหน้าแบบ real-time ผ่าน embed message เดียว โดยอัปเดตต่อเนื่องแทนการส่งข้อความใหม่

---

## ระบบแจ้งเตือนอัตโนมัติ

หากตั้งค่า `LOG_CHANNEL_ID` ไว้ ระบบจะส่งการแจ้งเตือนอัตโนมัติ:

- **ทุก 1 ชั่วโมง** — ตรวจสอบ Quest ที่ใกล้ถึง Deadline
- **ทุกวัน เวลา 08:00 น.** — สรุปสถานะ Quest ประจำวัน

---

## โครงสร้างโปรเจกต์

```
bot/
├── src/
│   ├── commands/          # Slash Commands ทั้งหมด
│   │   ├── panel.js       # แผงควบคุมหลัก
│   │   ├── run.js         # Quest Runner
│   │   ├── stop.js        # หยุด Runner
│   │   ├── quest-add.js
│   │   ├── quest-list.js
│   │   ├── quest-done.js
│   │   ├── quest-remove.js
│   │   ├── quest-status.js
│   │   ├── api-status.js
│   │   ├── ping.js
│   │   └── help.js
│   ├── config.js          # ค่าตั้งต้นจาก .env
│   ├── db.js              # ฐานข้อมูล SQLite + schema
│   ├── storage.js         # Data access layer
│   ├── discord-runner.js  # Quest automation engine
│   ├── worker.js          # Background jobs (deadline check, daily summary)
│   ├── permissions.js     # ระบบสิทธิ์
│   ├── index.js           # Entry point
│   └── register-commands.js
├── data/                  # ไฟล์ฐานข้อมูล SQLite (auto-generated)
├── .env.example
└── package.json
```

---

## สิทธิ์การใช้งาน

ระบบแบ่งสิทธิ์เป็น 3 ระดับ:

| ระดับ | คำอธิบาย |
|-------|----------|
| **Owner** | เจ้าของ Bot — สิทธิ์สูงสุด |
| **Admin** | ผู้ดูแล Server — สิทธิ์จัดการทุกอย่าง |
| **Manager** | Role ที่กำหนดผ่าน `MANAGER_ROLE_ID` |

---

## การพัฒนา

```bash
# Development mode (auto-restart เมื่อแก้ไขไฟล์)
npm run dev

# ลงทะเบียนคำสั่งใหม่หลังแก้ไข
npm run register
```

---

## License

MIT License — ดูรายละเอียดที่ [LICENSE](LICENSE)
