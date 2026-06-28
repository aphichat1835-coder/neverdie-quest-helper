import { config } from './config.js';

export function isOwner(interaction) {
  return interaction.user.id === config.ownerId;
}

export function isAdmin(interaction) {
  if (isOwner(interaction)) return true;
  return interaction.member?.permissions?.has('Administrator') ?? false;
}

export function isManager(interaction) {
  if (isAdmin(interaction)) return true;
  if (!config.managerRoleId) return false;
  return interaction.member?.roles?.cache?.has(config.managerRoleId) ?? false;
}

export async function requireOwner(interaction) {
  if (!isOwner(interaction)) {
    await interaction.reply({ content: '🔒 คำสั่งนี้ใช้ได้เฉพาะเจ้าของบอทเท่านั้น', ephemeral: true });
    return false;
  }
  return true;
}

export async function requireAdmin(interaction) {
  if (!isAdmin(interaction)) {
    await interaction.reply({ content: '🔒 คำสั่งนี้ต้องการสิทธิ์ **Administrator**', ephemeral: true });
    return false;
  }
  return true;
}

export async function requireManager(interaction) {
  if (!isManager(interaction)) {
    await interaction.reply({ content: '🔒 คำสั่งนี้ต้องการสิทธิ์ **Manager** หรือสูงกว่า', ephemeral: true });
    return false;
  }
  return true;
}
