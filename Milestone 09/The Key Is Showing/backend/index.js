import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { summarizeNotes } from './services/aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static frontend from Vite's build folder
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/summarize route
app.post('/api/summarize', async (req, res) => {
  const { notes } = req.body;

  if (!notes || typeof notes !== 'string' || !notes.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Notes content is required.'
    });
  }

  try {
    const summary = await summarizeNotes(notes);
    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during summarization.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
