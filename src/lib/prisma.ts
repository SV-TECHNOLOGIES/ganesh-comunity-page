import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getFreshPrisma(): PrismaClient {
  try {
    const dynamicRequire = eval('require');
    if (dynamicRequire && dynamicRequire.cache) {
      Object.keys(dynamicRequire.cache).forEach((key: string) => {
        if (key.includes('@prisma/client') || key.includes('.prisma')) {
          delete dynamicRequire.cache[key];
        }
      });
    }
    const FreshClient = dynamicRequire('@prisma/client').PrismaClient;
    return new FreshClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (e) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    const hasImagesField = (globalForPrisma.prisma as any)?._runtimeDataModel?.models?.MediaItem?.fields?.some(
      (f: any) => f.name === 'images'
    );
    if (hasImagesField) {
      return globalForPrisma.prisma;
    }
  }

  const client = getFreshPrisma();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
