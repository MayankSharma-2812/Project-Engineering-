import { Router } from 'express';
import { getAllPostsWithAuthors } from '../services/postService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20; // Cap at 100 for safety

    const result = await getAllPostsWithAuthors(page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
