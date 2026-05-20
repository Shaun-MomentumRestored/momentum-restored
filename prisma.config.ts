import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^﻿/, "").trim();
const localUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const activeUrl = tursoUrl ?? localUrl;

function createAdapter() {
  if (tursoUrl) {
    const client = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.replace(/^﻿/, "").trim(),
    });
    return new PrismaLibSql(client);
  }
  const client = createClient({ url: localUrl });
  return new PrismaLibSql(client);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: activeUrl,
    adapter: tursoUrl ? createAdapter() : undefined,
  },
});
