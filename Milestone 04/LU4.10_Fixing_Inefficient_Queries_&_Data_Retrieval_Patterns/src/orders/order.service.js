import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'], // Leaves query logging on to expose the N+1 crime
});

export async function getOrders() {
  const ordersWithUsers = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return ordersWithUsers;
}

export async function getOrderById(id) {
  const order = await prisma.order.findUnique({ 
    where: { id },
    include: { user: true }
  });
  return order;
}