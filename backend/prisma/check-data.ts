import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const companies = await prisma.company.findMany();
  const zonas = await prisma.zona.findMany();
  console.log('Users:', users);
  console.log('Companies:', companies);
  console.log('Zonas:', zonas);
}

main().finally(() => prisma.$disconnect());
