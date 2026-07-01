# แนวทางการมีส่วนร่วมพัฒนา

ขอบคุณที่สนใจเข้าร่วมพัฒนา **NeverDie Quest Bot** ทุก Contribution ไม่ว่าจะเป็นการรายงานข้อผิดพลาด การเสนอฟีเจอร์ หรือการส่ง Pull Request ล้วนมีคุณค่าและได้รับการต้อนรับเสมอ

---

## ข้อกำหนดเบื้องต้น

- **Node.js** 20 ขึ้นไป
- **npm** 10 ขึ้นไป
- บัญชี Discord และ Bot Token สำหรับทดสอบ

---

## การเริ่มต้นพัฒนา

```bash
# 1. Fork และ Clone repository
git clone https://github.com/aphichat1835-coder/neverdie-quest-helper.git
cd neverdie-quest-helper/bot

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า environment
cp .env.example .env
# กรอกค่าทดสอบใน .env

# 4. ลงทะเบียน Slash Commands
npm run register

# 5. รันในโหมด Development
npm run dev
```

---

## โครงสร้างโปรเจกต์

```
bot/src/
├── commands/       # Slash Commands แต่ละคำสั่ง (1 ไฟล์ต่อ 1 คำสั่ง)
├── config.js       # โหลดค่า Environment Variables
├── db.js           # Schema ฐานข้อมูลและ Query functions
├── storage.js      # Data access layer (wrapper ของ db.js)
├── discord-runner.js  # Quest automation engine
├── worker.js       # Background tasks (deadline check, daily summary)
├── permissions.js  # ระบบตรวจสอบสิทธิ์
├── index.js        # Entry point — เริ่มต้น Bot
└── register-commands.js  # ลงทะเบียน Slash Commands กับ Discord
```

---

## แนวทางการเขียนโค้ด

- ใช้ **ES Modules** (`import/export`) ทั้งหมด — ห้ามใช้ `require()`
- ตั้งชื่อไฟล์ด้วย kebab-case (เช่น `quest-add.js`)
- ทุก Slash Command ต้อง export `data` และ `execute` เป็นอย่างน้อย
- จัดการ Error ทุกจุดและแจ้งผู้ใช้ผ่าน `ephemeral: true` reply เสมอ
- ข้อมูลที่อยู่ใน memory ชั่วคราวต้องไม่ถูก persist ลงฐานข้อมูล

---

## การเพิ่ม Slash Command ใหม่

1. สร้างไฟล์ใหม่ใน `bot/src/commands/`
2. Export `data` (SlashCommandBuilder) และ `execute` (async function)
3. Import และเพิ่มลงใน `client.commands` ใน `index.js`
4. รัน `npm run register` เพื่ออัปเดตคำสั่งกับ Discord

---

## การส่ง Pull Request

1. สร้าง branch ใหม่จาก `main`
   ```bash
   git checkout -b feature/ชื่อฟีเจอร์
   ```
2. เขียนโค้ดและทดสอบให้แน่ใจว่าทำงานได้ถูกต้อง
3. Commit ด้วยข้อความที่ชัดเจน
   ```bash
   git commit -m "feat: อธิบายสิ่งที่เพิ่ม/แก้ไข"
   ```
4. Push และเปิด Pull Request พร้อมอธิบายการเปลี่ยนแปลง

---

## การรายงานปัญหา

หากพบข้อผิดพลาดหรือต้องการเสนอฟีเจอร์ใหม่ กรุณาเปิด [GitHub Issue](../../issues) พร้อมข้อมูล:

- ขั้นตอนการทำให้เกิดปัญหา (สำหรับ Bug)
- ผลลัพธ์ที่คาดหวัง vs ผลลัพธ์จริง
- เวอร์ชัน Node.js และ OS ที่ใช้

---

## License

การมีส่วนร่วมทั้งหมดอยู่ภายใต้ [MIT License](LICENSE)
