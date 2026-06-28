import {
  SlashCommandBuilder, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
} from 'discord.js';
import { getAllQuests, getStats, addQuest, markDone, removeQuest } from '../storage.js';
import { config } from '../config.js';
import { isAdmin, isManager } from '../permissions.js';

export const data = new SlashCommandBuilder()
  .setName('panel')
  .setDescription('เปิดแผงควบคุม NeverDie Quest');

export async function execute(interaction) {
  await sendPanel(interaction, false);
}

export async function sendPanel(interaction, isUpdate = false) {
  let stats = { total: 0, done: 0, pending: 0, overdue: 0 };
  try { stats = await getStats(); } catch {}

  const embed = new EmbedBuilder()
    .setTitle('🎮 NeverDie Quest — แผงควบคุม')
    .setColor(0x5865f2)
    .addFields(
      { name: '📦 ทั้งหมด', value: `${stats.total}`, inline: true },
      { name: '✅ เสร็จ',   value: `${stats.done}`,  inline: true },
      { name: '🔴 ค้างอยู่', value: `${stats.pending}`, inline: true },
      { name: '⚠️ เกิน deadline', value: `${stats.overdue}`, inline: true },
    )
    .setFooter({ text: 'กดปุ่มด้านล่างเพื่อจัดการ quest' })
    .setTimestamp();

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('panel:list').setLabel('📋 รายการ').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('panel:add').setLabel('➕ เพิ่ม').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('panel:done').setLabel('✅ Done').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('panel:edit').setLabel('✏️ แก้ไข').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('panel:delete').setLabel('🗑️ ลบ').setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('panel:status').setLabel('📊 สถิติ').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('panel:run').setLabel('⚡ Start Runner').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('panel:stop').setLabel('🛑 Stop').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('panel:refresh').setLabel('🔄 Refresh').setStyle(ButtonStyle.Secondary),
  );

  const payload = { embeds: [embed], components: [row1, row2] };
  if (isUpdate) await interaction.update(payload);
  else await interaction.reply(payload);
}

export async function handleButton(interaction) {
  const action = interaction.customId.split(':')[1];

  if (action === 'refresh') return sendPanel(interaction, true);

  if (action === 'list') {
    await interaction.deferReply({ ephemeral: true });
    try {
      const quests = await getAllQuests();
      if (!quests.length) return interaction.editReply('📭 ยังไม่มีเควสเลย');

      const LIMIT = 20;
      const pending = quests.filter((q) => !q.done).slice(0, LIMIT);
      const done = quests.filter((q) => q.done).slice(0, LIMIT);
      const fmt = (q) => `\`#${q.id}\` **${q.name}**${q.deadline ? ` · 📅 ${q.deadline}` : ''}${q.note ? ` · ${q.note}` : ''}`;

      const embed = new EmbedBuilder().setTitle('📋 รายการเควส').setColor(0x5865f2);
      if (pending.length) embed.addFields({ name: `🔴 ค้างอยู่ (${pending.length})`, value: pending.map(fmt).join('\n') });
      if (done.length) embed.addFields({ name: `✅ เสร็จแล้ว (${done.length})`, value: done.map(fmt).join('\n') });
      if (quests.length > LIMIT * 2) embed.setFooter({ text: `แสดง ${LIMIT * 2} รายการแรก จากทั้งหมด ${quests.length}` });

      return interaction.editReply({ embeds: [embed] });
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }

  if (action === 'status') {
    await interaction.deferReply({ ephemeral: true });
    try {
      const { total, done, pending, overdue } = await getStats();
      const embed = new EmbedBuilder()
        .setTitle('📊 สถิติเควส').setColor(0xfee75c)
        .addFields(
          { name: '📦 ทั้งหมด', value: `${total}`, inline: true },
          { name: '✅ เสร็จ', value: `${done}`, inline: true },
          { name: '🔴 ค้าง', value: `${pending}`, inline: true },
          { name: '⚠️ เกิน deadline', value: `${overdue}`, inline: true },
        );
      return interaction.editReply({ embeds: [embed] });
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }

  if (action === 'add') {
    if (!isManager(interaction)) {
      return interaction.reply({ content: '🔒 ต้องการสิทธิ์ Manager ขึ้นไป', ephemeral: true });
    }
    return interaction.showModal(
      new ModalBuilder().setCustomId('panel_add_modal').setTitle('➕ เพิ่ม Quest ใหม่')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('name').setLabel('ชื่อ Quest').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('deadline').setLabel('Deadline (YYYY-MM-DD)').setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('เช่น 2026-07-01')
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('note').setLabel('โน้ต').setStyle(TextInputStyle.Paragraph).setRequired(false)
          ),
        )
    );
  }

  if (action === 'done') {
    return interaction.showModal(
      new ModalBuilder().setCustomId('panel_done_modal').setTitle('✅ Mark Quest Done')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('id').setLabel('Quest ID').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('เช่น 1')
          ),
        )
    );
  }

  if (action === 'edit') {
    if (!isManager(interaction)) {
      return interaction.reply({ content: '🔒 ต้องการสิทธิ์ Manager ขึ้นไป', ephemeral: true });
    }
    return interaction.showModal(
      new ModalBuilder().setCustomId('panel_edit_modal').setTitle('✏️ แก้ไข Quest')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('id').setLabel('Quest ID ที่จะแก้ไข').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('name').setLabel('ชื่อใหม่ (เว้นว่างไว้ถ้าไม่แก้)').setStyle(TextInputStyle.Short).setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('deadline').setLabel('Deadline ใหม่ (YYYY-MM-DD)').setStyle(TextInputStyle.Short).setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('note').setLabel('โน้ตใหม่').setStyle(TextInputStyle.Paragraph).setRequired(false)
          ),
        )
    );
  }

  if (action === 'delete') {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '🔒 ต้องการสิทธิ์ Administrator', ephemeral: true });
    }
    return interaction.showModal(
      new ModalBuilder().setCustomId('panel_delete_modal').setTitle('🗑️ ลบ Quest')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('id').setLabel('Quest ID ที่จะลบ').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('เช่น 1')
          ),
        )
    );
  }

  if (action === 'run') {
    return interaction.showModal(
      new ModalBuilder().setCustomId(`run_modal:${interaction.channelId}`).setTitle('⚡ Quest Runner')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('user_token').setLabel('Discord User Token').setStyle(TextInputStyle.Paragraph).setRequired(true).setMinLength(50).setPlaceholder('วาง token ของคุณที่นี่')
          ),
        )
    );
  }

  if (action === 'stop') {
    await interaction.deferReply({ ephemeral: true });
    try {
      const res = await fetch(`${config.apiUrl}/runner/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(config.apiSecret ? { 'x-api-secret': config.apiSecret } : {}) },
        body: JSON.stringify({ userId: interaction.user.id }),
      });
      const data = await res.json();
      return interaction.editReply(data.stopped ? '🛑 หยุด Runner แล้ว' : 'ℹ️ ไม่มี Runner กำลังทำงาน');
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }
}

export async function handlePanelModal(interaction) {
  if (interaction.customId === 'panel_add_modal') {
    const name = interaction.fields.getTextInputValue('name').trim();
    const deadline = interaction.fields.getTextInputValue('deadline').trim() || null;
    const note = interaction.fields.getTextInputValue('note').trim() || null;
    await interaction.deferReply({ ephemeral: true });
    try {
      if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return interaction.editReply('❌ deadline ต้องเป็น YYYY-MM-DD');
      const quest = await addQuest({ name, deadline, note });
      return interaction.editReply(`✅ เพิ่ม **${quest.name}** (ID #${quest.id}) แล้ว`);
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }

  if (interaction.customId === 'panel_done_modal') {
    const id = parseInt(interaction.fields.getTextInputValue('id').trim(), 10);
    await interaction.deferReply({ ephemeral: true });
    try {
      const quest = await markDone(id);
      if (!quest) return interaction.editReply(`❌ ไม่พบเควส ID #${id}`);
      return interaction.editReply(`🎉 มาร์ค **${quest.name}** ว่าเสร็จแล้ว`);
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }

  if (interaction.customId === 'panel_edit_modal') {
    const id = parseInt(interaction.fields.getTextInputValue('id').trim(), 10);
    const name = interaction.fields.getTextInputValue('name').trim() || undefined;
    const deadline = interaction.fields.getTextInputValue('deadline').trim() || undefined;
    const note = interaction.fields.getTextInputValue('note').trim() || undefined;
    await interaction.deferReply({ ephemeral: true });
    try {
      if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return interaction.editReply('❌ deadline ต้องเป็น YYYY-MM-DD');
      const res = await fetch(`${config.apiUrl}/quests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(config.apiSecret ? { 'x-api-secret': config.apiSecret } : {}) },
        body: JSON.stringify({ name, deadline, note }),
      });
      const quest = await res.json();
      if (!res.ok) return interaction.editReply(`❌ ${quest.error}`);
      return interaction.editReply(`✏️ แก้ไข **${quest.name}** (ID #${quest.id}) แล้ว`);
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }

  if (interaction.customId === 'panel_delete_modal') {
    const id = parseInt(interaction.fields.getTextInputValue('id').trim(), 10);
    await interaction.deferReply({ ephemeral: true });
    try {
      const quest = await removeQuest(id);
      if (!quest) return interaction.editReply(`❌ ไม่พบเควส ID #${id}`);
      return interaction.editReply(`🗑️ ลบ **${quest.name}** (ID #${quest.id}) แล้ว`);
    } catch (err) { return interaction.editReply(`❌ ${err.message}`); }
  }
}
