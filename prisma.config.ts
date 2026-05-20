import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

function createAdapter() {
  if (process.env.TURSO_DATABASE_URL) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaLibSQL(client);
  }
  const client = createClient({ url: rawUrl });
  return new PrismaLibSQL(client);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: rawUrl,
    adapter: createAdapter(),
  },
});
