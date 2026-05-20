import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function createAdapter() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^﻿/, "").trim();
  if (tursoUrl) {
    const client = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.replace(/^﻿/, "").trim(),
    });
    return new PrismaLibSql(client);
  }
  const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const client = createClient({ url: rawUrl });
  return new PrismaLibSql(client);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: createAdapter(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
