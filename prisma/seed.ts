import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const statusSeed = [
    { id: 1, name: 'pendente' },
    { id: 2, name: 'aprovada' },
    { id: 3, name: 'rejeitada' },
  ];

  const transferTypeSeed = [
    { id: 1, name: 'PIX' },
    { id: 2, name: 'TED' },
  ];

  for (const status of statusSeed) {
    await prisma.transactionStatus.upsert({
      where: { id: status.id },
      update: { name: status.name },
      create: status,
    });
  }

  for (const transferType of transferTypeSeed) {
    await prisma.transferType.upsert({
      where: { id: transferType.id },
      update: { name: transferType.name },
      create: transferType,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
