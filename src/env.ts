import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Transaction pooler (port 6543) — dipakai app pas runtime
    DATABASE_URL: z.string().url(),
    // Direct connection (port 5432) — khusus buat drizzle-kit migrate
    DIRECT_URL: z.string().url(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  },
});