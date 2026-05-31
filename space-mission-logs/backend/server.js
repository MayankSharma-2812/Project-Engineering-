import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient({ log: ['query'] });

// BROKEN: No compression middleware
// app.use(compression());

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/missions', async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      orderBy: { launchDate: 'desc' },
      include: {
        crew: true,
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    res.json(missions);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Space Mission Logs API running on http://localhost:${PORT}`);
});
