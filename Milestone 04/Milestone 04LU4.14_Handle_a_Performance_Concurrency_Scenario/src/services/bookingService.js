const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBooking({ userId, seatId, showId }) {
  try {
    const booking = await prisma.booking.create({
      data: { userId, seatId, showId }
    });
    return { success: true, booking };
  } catch (err) {
    if (err.code === 'P2002') {
      return { success: false, status: 409, message: 'Seat already taken' };
    }
    throw err;
  }
}

module.exports = {
  createBooking
};
