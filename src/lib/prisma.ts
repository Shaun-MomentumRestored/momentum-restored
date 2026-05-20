import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createAdapter() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^﻿/, "").trim();
  if (tursoUrl) {
    return new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.replace(/^﻿/, "").trim(),
    });
  }
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  return new PrismaLibSql({ url: rawUrl });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: createAdapter(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
