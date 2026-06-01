import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// FIXED: Enable compression middleware
app.use(compression());

app.use(cors({ origin: '*' }));
app.use(express.json());

// BROKEN: No pagination & over-fetching of strategyNote
app.get('/api/scores', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [scores, totalCount] = await Promise.all([
      prisma.score.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          playerName: true,
          score: true,
          date: true,
          game: {
            select: {
              id: true,
              name: true,
              genre: true,
              year: true
            }
          }
        },
        orderBy: { score: 'desc' }
      }),
      prisma.score.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      data: scores,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
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
