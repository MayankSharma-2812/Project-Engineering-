
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const fragmentRoutes = require('./routes/fragments');

const app = express();
const PORT = 5001;

// FIXED: Restrict CORS to trusted origin only
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/fragments', fragmentRoutes);

app.get('/', (req, res) => {
  res.send('Fragments API Running (Insecure)');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
