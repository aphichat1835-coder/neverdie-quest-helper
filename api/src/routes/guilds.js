import { Router } from 'express';
import * as db from '../db.js';

const router = Router();

router.get('/:guildId/settings', (req, res) => {
  const row = db.getGuildSettings(req.params.guildId);
  res.json(row ?? { guild_id: req.params.guildId });
});

router.patch('/:guildId/settings', (req, res) => {
  const { log_channel_id, panel_channel_id, manager_role_id, timezone } = req.body;
  const updated = db.upsertGuildSettings(req.params.guildId, { log_channel_id, panel_channel_id, manager_role_id, timezone });
  res.json(updated);
});

router.get('/:guildId/logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '50'), 200);
  res.json(db.getQuestLogs(req.params.guildId, limit));
});

router.post('/:guildId/logs', (req, res) => {
  const { quest_id, user_id, action, details } = req.body;
  if (!action) return res.status(400).json({ error: '`action` is required' });
  const info = db.addQuestLog({ quest_id, guild_id: req.params.guildId, user_id, action, details });
  res.status(201).json({ id: info.lastInsertRowid });
});

export default router;
