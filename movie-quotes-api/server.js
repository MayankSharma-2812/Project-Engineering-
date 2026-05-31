import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Generate 1,000 movie quotes
const movieQuotes = [];
for (let i = 1; i <= 1000; i++) {
  movieQuotes.push({
    id: i,
    quote: `Famous movie quote ${i}`,
    movie: `Movie Title ${i}`,
    year: 1990 + (i % 30),
    character: `Character ${i}`,
    rating: 4.5 + (Math.random() * 0.5)
  });
}

// Simulated favorites storage
const favorites = new Set();

// CORS issues - intentionally permissive
app.use(cors({ origin: '*' }));
app.use(express.json());

// GET all quotes (unpaginated - slow, memory-heavy)
app.get('/api/quotes/unpaginated', (req, res) => {
  // Simulate processing delay
  setTimeout(() => {
    res.json(movieQuotes);
  }, 100);
});

// GET paginated quotes (fast, lightweight)
app.get('/api/quotes', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  // Pagination off-by-one error (intentional)
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedQuotes = movieQuotes.slice(startIndex, endIndex);
  
  // Wrong total count (intentional error)
  const total = movieQuotes.length - 10; // Off by 10
  
  const totalPages = Math.ceil(total / limit);
  
  res.json({
    data: paginatedQuotes,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
});

// POST favorites (simulated storage)
app.post('/api/favorites', (req, res) => {
  const { quoteId } = req.body;
  
  // No input validation (intentional error)
  if (quoteId) {
    favorites.add(quoteId);
  }
  
  // Synchronous blocking operation (intentional error)
  const start = Date.now();
  while (Date.now() - start < 50) {
    // Block for 50ms
  }
  
  res.json({ message: 'Added to favorites', quoteId, totalFavorites: favorites.size });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Movie Quotes API running on http://localhost:${PORT}`);
  console.log(`Loaded ${movieQuotes.length} movie quotes`);
});
