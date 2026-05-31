import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// BROKEN: No compression middleware

app.use(cors({ origin: '*' }));
app.use(express.json());

// BROKEN: No pagination & over-fetching of strategyNote
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await prisma.score.findMany({
      orderBy: { score: 'desc' },
      include: {
        game: true
      }
    });
    res.json(scores);
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
  console.log(`Retro Game High Score API running on http://localhost:${PORT}`);
});
