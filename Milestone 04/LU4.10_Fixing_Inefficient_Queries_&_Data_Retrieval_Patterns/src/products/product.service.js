import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getProducts({ page, limit, sortBy, order, selectFields }) {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      ...(selectFields && { select: selectFields }),
    }),
    prisma.product.count()
  ]);

  const meta = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };

  return { data: products, meta };
}

export async function getProductById(id) {
  return prisma.product.findUnique({ where: { id } });
}