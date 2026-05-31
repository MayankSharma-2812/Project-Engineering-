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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [missions, totalCount] = await Promise.all([
      prisma.mission.findMany({
        orderBy: { launchDate: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          launchDate: true,
          rocket: true,
          status: true,
          crew: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          logs: {
            select: {
              id: true,
              timestamp: true,
              event: true
            },
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        }
      }),
      prisma.mission.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: missions,
      meta: {
        total: totalCount,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
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
  console.log(`Space Mission Logs API running on http://localhost:${PORT}`);
});
