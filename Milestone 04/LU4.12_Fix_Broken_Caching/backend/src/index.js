const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const cacheService = require('./cache.service');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET /tasks
app.get('/tasks', async (req, res, next) => {
  try {
    const cacheKey = 'tasks:list';
    
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('Serving from cache');
      return res.status(200).json(cachedResult);
    }

    const tasks = await prisma.task.findMany();
    cacheService.set(cacheKey, tasks, 60); 
    
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id
app.get('/tasks/:id', async (req, res, next) => {
  const { id } = req.params;
  const cacheKey = `task:${id}`;

  try {
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json(cachedResult);
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    cacheService.set(cacheKey, task, 60);
    
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks
app.post('/tasks', async (req, res, next) => {
  const { title, description, price } = req.body;
  
  if (!title || !description || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTask = await prisma.task.create({
      data: { title, description, price: parseFloat(price) }
    });

    cacheService.invalidate('tasks:list');
    
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    cacheService.invalidate('tasks:list');
    cacheService.invalidate(`task:${id}`);
    
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
