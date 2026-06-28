import { config } from './config.js';

const base = config.apiUrl?.replace(/\/$/, '');

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (config.apiSecret) h['x-api-secret'] = config.apiSecret;
  return h;
}

async function call(path, options = {}) {
  const res = await fetch(`${base}${path}`, { headers: headers(), ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`);
  return data;
}

export function getAllQuests() {
  return call('/quests');
}

export function addQuest({ name, deadline, note }) {
  return call('/quests', {
    method: 'POST',
    body: JSON.stringify({ name, deadline, note }),
  });
}

export function editQuest(id, { name, deadline, note }) {
  const body = {};
  if (name !== undefined)     body.name     = name;
  if (deadline !== undefined) body.deadline = deadline;
  if (note !== undefined)     body.note     = note;
  return call(`/quests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function markDone(id) {
  return call(`/quests/${id}/done`, { method: 'PATCH' });
}

export function removeQuest(id) {
  return call(`/quests/${id}`, { method: 'DELETE' });
}

export function getStats() {
  return call('/quests/stats');
}

export function getGuildSettings(guildId) {
  return call(`/guilds/${guildId}/settings`);
}

export function updateGuildSettings(guildId, settings) {
  return call(`/guilds/${guildId}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

export function getGuildLogs(guildId, limit = 50) {
  return call(`/guilds/${guildId}/logs?limit=${limit}`);
}
