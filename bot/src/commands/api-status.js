import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('api-status')
  .setDescription('เช็กสถานะ API Server และ Database');

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const start = Date.now();
  let apiOk = false;
  let dbOk = false;
  let latency = 0;
  let error = null;
  let health = null;

  try {
    const res = await fetch(`${config.apiUrl}/health`, {
      headers: config.apiSecret ? { 'x-api-secret': config.apiSecret } : {},
      signal: AbortSignal.timeout(5000),
    });
    latency = Date.now() - start;
    if (res.ok) {
      health = await res.json();
      apiOk = true;
      dbOk = health?.db !== false;
    }
  } catch (err) {
    latency = Date.now() - start;
    error = err.message;
  }

  const statusEmoji = apiOk ? '🟢' : '🔴';
  const dbEmoji = dbOk ? '🟢' : '🔴';
  const latencyEmoji = latency < 300 ? '⚡' : latency < 1000 ? '🟡' : '🔴';

  const embed = new EmbedBuilder()
    .setTitle('🔌 API Server Status')
    .setColor(apiOk ? 0x57f287 : 0xed4245)
    .addFields(
      { name: 'API', value: `${statusEmoji} ${apiOk ? 'Online' : 'Offline'}`, inline: true },
      { name: 'Database', value: `${dbEmoji} ${dbOk ? 'OK' : 'Error'}`, inline: true },
      { name: 'Latency', value: `${latencyEmoji} ${latency}ms`, inline: true },
      { name: 'API URL', value: `\`${config.apiUrl}\`` },
    )
    .setTimestamp();

  if (error) embed.addFields({ name: '❌ Error', value: `\`${error}\`` });
  if (health?.version) embed.addFields({ name: 'Version', value: health.version, inline: true });

  await interaction.editReply({ embeds: [embed] });
}
