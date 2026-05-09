import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const crewRoles = ['Commander', 'Pilot', 'Engineer', 'Scientist', 'Medic'];
const logEvents = ['Launch', 'Orbit Insert', 'System Check', 'EVA Prep', 'Communication', 'Emergency'];

async function seed() {
  console.log('🚀 Seeding Space Mission Logs database...');

  // Create 200 space missions
  for (let i = 1; i <= 200; i++) {
    const mission = await prisma.mission.create({
      data: {
        name: `Mission ${i}: ${['Alpha', 'Beta', 'Gamma', 'Delta'][i % 4]} Explorer`,
        description: `This is a comprehensive space exploration mission involving advanced research and discovery operations in deep space. Mission ${i} will utilize cutting-edge technology to explore uncharted territories and gather valuable scientific data. The crew will conduct various experiments including atmospheric analysis, geological surveys, and biological research. This mission represents a significant step forward in humanity's understanding of the cosmos and our place within it. The duration is expected to be approximately ${30 + (i % 20)} days depending on orbital mechanics and mission objectives. Primary goals include mapping new star systems, collecting samples from celestial bodies, and testing new propulsion systems in extreme conditions.`, // Large description for payload bloat
        launchDate: new Date(2024, (i % 12), (i % 28) + 1),
        rocket: `${['Falcon', 'Saturn', 'Atlas', 'Soyuz'][i % 4]}-${1000 + i}`,
        status: ['planning', 'active', 'completed', 'archived'][i % 4]
      }
    });

    // Add 2-5 crew members per mission
    const crewCount = 2 + (i % 4);
    for (let j = 1; j <= crewCount; j++) {
      await prisma.crew.create({
        data: {
          name: `Crew Member ${mission.id}-${j}`,
          role: crewRoles[j % crewRoles.length],
          missionId: mission.id
        }
      });
    }

    // Add 5-10 logs per mission
    const logCount = 5 + (i % 6);
    for (let k = 1; k <= logCount; k++) {
      await prisma.missionLog.create({
        data: {
          timestamp: new Date(Date.now() - (k * 3600000)), // Hours ago
          event: logEvents[k % logEvents.length],
          details: `Mission log entry ${k} for mission ${mission.id}. System status nominal, all parameters within expected ranges. Crew performing routine maintenance and scientific observations.`,
          missionId: mission.id
        }
      });
    }

    if (i % 20 === 0) {
      console.log(`✅ Seeded ${i} missions...`);
    }
  }

  console.log(`🎉 Successfully seeded ${200} missions with crew and logs!`);
  console.log(`📊 Total crew members: ${Array.from({length: 200}, (_, i) => 2 + (i % 4)).reduce((a, b) => a + b, 0)}`);
  console.log(`📝 Total mission logs: ${Array.from({length: 200}, (_, i) => 5 + (i % 6)).reduce((a, b) => a + b, 0)}`);
}

seed()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
