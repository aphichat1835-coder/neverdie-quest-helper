import { Router } from 'express';
import { startRunner, stopRunner, getJob, listJobs, fetchMe, fetchQuests } from '../discord-runner.js';

const router = Router();

router.post('/start', async (req, res) => {
  const { userToken, userId, channelId, speedMultiplier, heartbeatInterval } = req.body;

  if (!userToken || !userId || !channelId) {
    return res.status(400).json({ error: '`userToken`, `userId`, `channelId` จำเป็น' });
  }

  try {
    const me = await fetchMe(userToken);
    if (!me?.id) return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });

    const quests = await fetchQuests(userToken);
    const active = quests.filter((q) => !q.completed);

    const botToken = process.env.DISCORD_BOT_TOKEN;

    startRunner({ userId, userToken, channelId, botToken, speedMultiplier, heartbeatInterval });

    return res.json({
      user: { id: me.id, username: me.username },
      questCount: active.length,
      quests: active.map((q) => ({ id: q.id, name: q.name, progress: q.progress })),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/stop', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: '`userId` จำเป็น' });

  const stopped = stopRunner(userId);
  res.json({ stopped });
});

router.get('/status/:userId', (req, res) => {
  const job = getJob(req.params.userId);
  if (!job) return res.json({ running: false });
  res.json({ running: true, ...job.summary() });
});

router.get('/jobs', (_req, res) => {
  res.json(listJobs());
});

export default router;
