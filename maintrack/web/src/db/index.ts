import { drizzle as drizzleVercel } from "drizzle-orm/vercel-postgres";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { sql } from "@vercel/postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Use @vercel/postgres for Vercel deployment, pg for local development
const isVercel = process.env.VERCEL === "1";

let db: ReturnType<typeof drizzleVercel<typeof schema>> | ReturnType<typeof drizzlePg<typeof schema>>;

if (isVercel) {
  db = drizzleVercel(sql, { schema });
} else {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzlePg(pool, { schema });
}

export { db };
export * from "./schema";
