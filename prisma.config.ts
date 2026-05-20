import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const tursoUrl = process.env.TURSO_DATABASE_URL?.replace(/^﻿/, "").trim();
const localUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const activeUrl = tursoUrl ?? localUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: activeUrl,
    adapter: tursoUrl
      ? new PrismaLibSql({
          url: tursoUrl,
          authToken: process.env.TURSO_AUTH_TOKEN?.replace(/^﻿/, "").trim(),
        })
      : new PrismaLibSql({ url: localUrl }),
  },
});
