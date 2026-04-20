import "dotenv/config";
import { defineConfig, env } from "prisma/config";

type Env = {
  DIRECT_URL: string;
};

// Prisma 7 moved datasource URLs out of schema.prisma into this config file.
// Migrations use DIRECT_URL (unpooled Neon endpoint). Runtime queries use
// DATABASE_URL (pooled) via the @prisma/adapter-neon driver adapter in
// src/lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env<Env>("DIRECT_URL"),
  },
});
