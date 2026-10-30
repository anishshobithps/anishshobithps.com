import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL && existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
