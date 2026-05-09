import prisma from '../../lib/prisma.js';

export async function getAllOrdersWithItems(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true,
          },
        },
      },
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data: orders,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPrevPage,
    },
  };
}
