import { config } from './config.js';

let client = null;
let workerInterval = null;

export function startWorker(discordClient) {
  client = discordClient;

  const INTERVAL_MS = 60 * 60 * 1000;
  console.log('⏰ Worker เริ่มแล้ว — เช็ก deadline ทุก 1 ชั่วโมง');

  workerInterval = setInterval(checkDeadlines, INTERVAL_MS);
  checkDeadlines();
}

export function stopWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('⏰ Worker หยุดแล้ว');
  }
}

async function checkDeadlines() {
  if (!config.logChannelId) return;

  try {
    const res = await fetch(`${config.apiUrl}/quests`, {
      headers: config.apiSecret ? { 'x-api-secret': config.apiSecret } : {},
    });
    if (!res.ok) return;

    const quests = await res.json();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const overdue = quests.filter((q) => !q.done && q.deadline && q.deadline < todayStr);
    const dueToday = quests.filter((q) => !q.done && q.deadline === todayStr);
    const dueTomorrow = quests.filter((q) => !q.done && q.deadline === tomorrowStr);

    const alerts = [];

    if (overdue.length > 0) {
      alerts.push(`🔴 **เกิน Deadline แล้ว (${overdue.length}):**\n` +
        overdue.map((q) => `• \`#${q.id}\` **${q.name}** — หมดเมื่อ ${q.deadline}`).join('\n'));
    }

    if (dueToday.length > 0) {
      alerts.push(`⚠️ **หมด Deadline วันนี้ (${dueToday.length}):**\n` +
        dueToday.map((q) => `• \`#${q.id}\` **${q.name}**`).join('\n'));
    }

    if (dueTomorrow.length > 0) {
      alerts.push(`📅 **หมด Deadline พรุ่งนี้ (${dueTomorrow.length}):**\n` +
        dueTomorrow.map((q) => `• \`#${q.id}\` **${q.name}**`).join('\n'));
    }

    if (alerts.length === 0) return;

    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel) return;

    await channel.send({
      content: `⏰ **Quest Deadline Alert**\n\n${alerts.join('\n\n')}`,
    });
  } catch (err) {
    console.error('Worker error:', err.message);
  }
}

export async function sendDailySummary() {
  if (!config.logChannelId) return;

  try {
    const res = await fetch(`${config.apiUrl}/quests/stats`, {
      headers: config.apiSecret ? { 'x-api-secret': config.apiSecret } : {},
    });
    if (!res.ok) return;

    const { total, done, pending, overdue } = await res.json();
    const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
    if (!channel) return;

    await channel.send({
      content: [
        '📊 **Daily Quest Summary**',
        `📦 ทั้งหมด: **${total}**`,
        `✅ เสร็จแล้ว: **${done}**`,
        `🔴 ค้างอยู่: **${pending}**`,
        `⚠️ เกิน deadline: **${overdue}**`,
      ].join('\n'),
    });
  } catch {}
}
