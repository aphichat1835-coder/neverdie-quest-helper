import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} from 'discord.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('run')
  .setDescription('เริ่มทำ Discord Quest อัตโนมัติด้วย user token ของคุณ');

export async function execute(interaction) {
  const modal = new ModalBuilder()
    .setCustomId(`run_modal:${interaction.channelId}`)
    .setTitle('🎮 NeverDie Quest Runner');

  const tokenInput = new TextInputBuilder()
    .setCustomId('user_token')
    .setLabel('Discord User Token')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('วาง token ของคุณที่นี่ (จะไม่ถูกบันทึกถาวร)')
    .setRequired(true)
    .setMinLength(50);

  modal.addComponents(new ActionRowBuilder().addComponents(tokenInput));
  await interaction.showModal(modal);
}

export async function handleModal(interaction) {
  const channelId = interaction.customId.split(':')[1];
  const userToken = interaction.fields.getTextInputValue('user_token').trim();

  await interaction.deferReply({ ephemeral: true });

  try {
    const res = await fetch(`${config.apiUrl}/runner/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiSecret ? { 'x-api-secret': config.apiSecret } : {}),
      },
      body: JSON.stringify({
        userToken,
        userId: interaction.user.id,
        channelId,
      }),
    });

    const data_res = await res.json();

    if (!res.ok) {
      return interaction.editReply(`❌ ${data_res.error ?? 'เกิดข้อผิดพลาด'}`);
    }

    const { user, questCount, quests } = data_res;

    if (questCount === 0) {
      return interaction.editReply(`✅ ไม่มี quest ที่ต้องทำสำหรับ **${user.username}**`);
    }

    const questLines = quests
      .map((q) => `• **${q.name}** — ${q.progress.toFixed(1)}%`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('⚡ Quest Runner เริ่มต้นแล้ว')
      .setColor(0x57f287)
      .setDescription(`ล็อกอินเป็น **${user.username}** สำเร็จ`)
      .addFields({
        name: `📋 Quest ที่จะทำ (${questCount} รายการ)`,
        value: questLines,
      })
      .addFields({
        name: '📢 อัปเดตจะส่งมาที่',
        value: `<#${channelId}>`,
        inline: true,
      })
      .setFooter({ text: 'ใช้ /stop เพื่อหยุด' });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply(`❌ ไม่สามารถเชื่อมต่อ API ได้: ${err.message}`);
  }
}
