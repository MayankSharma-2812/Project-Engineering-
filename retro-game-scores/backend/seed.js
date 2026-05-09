import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const retroGames = [
  { name: 'Donkey Kong', genre: 'Platform', year: 1981 },
  { name: 'Pac-Man', genre: 'Maze', year: 1980 },
  { name: 'Space Invaders', genre: 'Shooter', year: 1978 },
  { name: 'Asteroids', genre: 'Shooter', year: 1979 },
  { name: 'Centipede', genre: 'Shooter', year: 1980 },
  { name: 'Galaga', genre: 'Shooter', year: 1981 },
  { name: 'Frogger', genre: 'Action', year: 1981 },
  { name: 'Ms. Pac-Man', genre: 'Maze', year: 1981 },
  { name: 'Pole Position', genre: 'Racing', year: 1982 },
  { name: 'Q*bert', genre: 'Puzzle', year: 1982 }
];

const playerNames = [
  'ACE', 'MAX', 'FOX', 'ZAP', 'JET', 'BLAZE', 'STORM', 'SHADOW', 'NOVA', 'ECHO',
  'RAVEN', 'WOLF', 'FALCON', 'TIGER', 'PHOENIX', 'DRAGON', 'VIPER', 'Cobra', 'Eagle', 'Hawk'
];

const strategyNotes = [
  "Master the patterns and timing to achieve maximum efficiency. Focus on precision movements and anticipate enemy behavior. Practice makes perfect.",
  "Conserve your resources and use power-ups strategically. Learn the spawn points and create optimal routes through each level. Speed is essential.",
  "Memorize enemy patterns and exploit their weaknesses. Use the environment to your advantage and always have an escape route planned.",
  "Start with easier levels to build skills and confidence. Study the scoring system and prioritize high-value targets. Stay calm under pressure.",
  "Chain combos for maximum points and maintain momentum. Avoid unnecessary risks and focus on consistent performance over flashy moves."
];

async function seed() {
  console.log('🎮 Seeding Retro Game High Scores database...');

  // Create games
  const createdGames = [];
  for (const gameData of retroGames) {
    const game = await prisma.game.create({ data: gameData });
    createdGames.push(game);
  }

  // Create 300+ high scores
  for (let i = 1; i <= 320; i++) {
    const game = createdGames[i % createdGames.length];
    const playerName = playerNames[i % playerNames.length] + (i > 20 ? i.toString().slice(-2) : '');
    
    await prisma.score.create({
      data: {
        playerName,
        score: Math.floor(Math.random() * 99000) + 1000, // 1,000 - 99,000
        date: new Date(2024, (i % 12), (i % 28) + 1),
        strategyNote: strategyNotes[i % strategyNotes.length], // 150-word note for payload bloat
        gameId: game.id
      }
    });

    if (i % 50 === 0) {
      console.log(`✅ Seeded ${i} high scores...`);
    }
  }

  console.log(`🎉 Successfully seeded ${320} high scores across ${createdGames.length} retro games!`);
}

seed()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
