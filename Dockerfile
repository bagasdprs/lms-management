# ---- Stage 1: base ----
# Semua stage lain "mewarisi" dari sini, biar nggak install Bun berkali-kali
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Stage 2: install dependency ----
# Cuma copy package.json + lockfile dulu (bukan semua source code),
# supaya layer ini ke-cache selama dependency nggak berubah.
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- Stage 3: build ----
# Baru di sini semua source code di-copy, terus di-build.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env — @t3-oss/env-nextjs butuh ini biar nggak nolak build
# karena DATABASE_URL/DIRECT_URL asli belum ada di tahap ini.
ENV SKIP_ENV_VALIDATION=true
RUN bun run build

# ---- Stage 4: runner (image final yang beneran jalan) ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Cuma copy HASIL build-nya, bukan source code atau node_modules penuh.
# Ini inti dari kenapa multi-stage build bikin image jauh lebih kecil.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["bun", "server.js"]