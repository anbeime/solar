# ===== Stage 1: 依赖安装 =====
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# ===== Stage 2: 构建 =====
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm build

# ===== Stage 3: 运行 =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制数据文件
COPY --from=builder /app/public/data ./public/data

# 安装 Chromium (爬虫)
RUN apk add --no-cache chromium chromium-chromedriver nss freetype harfbuzz ca-certificates ttf-freefont
ENV CHROME_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER nextjs

EXPOSE 5000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
