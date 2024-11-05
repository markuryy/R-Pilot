FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/web ./apps/web

# Build the application
WORKDIR /app/apps/web
RUN bun run build

# Production image
FROM oven/bun:1-slim

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "start"]
