import { SlashCommandBuilder } from 'discord.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('หยุด Quest Runner ที่กำลังทำงานอยู่');

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const res = await fetch(`${config.apiUrl}/runner/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiSecret ? { 'x-api-secret': config.apiSecret } : {}),
      },
      body: JSON.stringify({ userId: interaction.user.id }),
    });

    const data = await res.json();

    if (data.stopped) {
      await interaction.editReply('🛑 หยุด Quest Runner แล้ว');
    } else {
      await interaction.editReply('ℹ️ ไม่มี Quest Runner ที่กำลังทำงานอยู่');
    }
  } catch (err) {
    await interaction.editReply(`❌ ไม่สามารถเชื่อมต่อ API ได้: ${err.message}`);
  }
}
