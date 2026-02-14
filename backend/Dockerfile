FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy shared package and backend configurations
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the entire project context
COPY . .

# Generate Prisma client and build the backend
RUN pnpm --filter wishtracker-backend run prisma:generate && \
    pnpm --filter wishtracker-backend run build

FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm for runtime commands
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy build artifacts and node_modules from builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./

EXPOSE 3010

# Set environment to production
ENV NODE_ENV=production

# Run migrations and start the application
CMD ["sh", "-c", "pnpm --filter wishtracker-backend run prisma:migrate:prod && node dist/main"]
