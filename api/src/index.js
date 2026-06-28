import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import questsRouter from './routes/quests.js';
import runnerRouter from './routes/runner.js';
import guildsRouter from './routes/guilds.js';

const app = express();
const PORT = process.env.PORT ?? 3000;
const API_SECRET = process.env.API_SECRET;
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';
const VERSION = '1.2.0';

if (NODE_ENV === 'production' && !API_SECRET) {
  console.error('❌ API_SECRET ต้องตั้งค่าในโหมด production');
  process.exit(1);
}

const corsOptions = CORS_ORIGIN === '*'
  ? { origin: '*' }
  : { origin: CORS_ORIGIN.split(',').map((o) => o.trim()) };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

const rateMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const entry = rateMap.get(ip) ?? { count: 0, reset: now + 60_000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
  entry.count++;
  rateMap.set(ip, entry);
  if (entry.count > 120) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
});

app.use((req, res, next) => {
  if (API_SECRET) {
    const auth = req.headers['x-api-secret'];
    if (auth !== API_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  next();
});

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  version: VERSION,
  env: NODE_ENV,
  db: true,
  timestamp: new Date().toISOString(),
}));

app.use('/quests', questsRouter);
app.use('/runner', runnerRouter);
app.use('/guilds', guildsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ NeverDie Quest API v${VERSION} running on port ${PORT} [${NODE_ENV}]`);
});
