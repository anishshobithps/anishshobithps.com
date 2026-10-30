import { ENV } from "../env";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(ENV.DATABASE_URL);
export const db = drizzle({ client: sql });
