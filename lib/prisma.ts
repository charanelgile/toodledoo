import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Create a Single Instance of PrismaClient
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Save the PrismaClient on "globalThis" and name it "globalForPrisma"
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// If no PrismaClient is stored on "globalForPrisma", create a new one
// Otherwise, just reuse the existing one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
