import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv';

config();

export default defineConfig({
  out: "./server/migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});