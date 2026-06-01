require('dotenv').config();
const express = require('express');
const bookingsRouter = require('./routes/bookings');

const app = express();

app.use(express.json());

app.use('/api/bookings', bookingsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
