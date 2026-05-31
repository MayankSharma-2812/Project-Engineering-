import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

// BROKEN: No compression middleware
// app.use(compression());

app.use(cors({ origin: '*' }));
app.use(express.json());

// BROKEN: N+1 Query Problem
app.get('/api/missions', async (req, res) => {
  try {
    // Fetch all missions first (1 query)
    const missions = await prisma.mission.findMany({
      orderBy: { launchDate: 'desc' }
    });

    // Then loop to fetch crew and logs for each mission (N queries)
    for (const mission of missions) {
      const crew = await prisma.crew.findMany({
        where: { missionId: mission.id },
        include: { crew: true }
      });
      
      const logs = await prisma.missionLog.findMany({
        where: { missionId: mission.id },
        orderBy: { timestamp: 'desc' },
        take: 10
      });
      
      mission.crew = crew;
      mission.logs = logs;
    }

    // BROKEN: No pagination - returns all 200 missions
    // BROKEN: Over-fetching - returns all columns including large description
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
