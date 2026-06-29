FROM node:26-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter wishtracker-backend run prisma:generate && \
    pnpm --filter wishtracker-backend run build

FROM node:26-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./

EXPOSE 3010

CMD ["sh", "-c", "pnpm --filter wishtracker-backend run prisma:migrate:prod && node dist/main"]
