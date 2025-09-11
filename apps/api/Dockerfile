# Base image with Bun
FROM oven/bun:1.2.21 AS base

# Install turbo CLI globally using Bun
FROM base AS turbo-cli
RUN bun add -g turbo

# Builder stage
FROM turbo-cli AS builder
WORKDIR /app

# Copy root package.json, turbo.json, and workspace configs
COPY package.json bun.lock turbo.json ./
COPY packages ./packages

# Copy API package files
COPY apps/api ./apps/api

# Use turbo to prune workspaces for API
RUN turbo prune @wd-ai-tools/api --docker

# Installer stage
FROM base AS installer
WORKDIR /app

# Copy pruned package files
COPY --from=builder /app/out/json/ .

# Remove references to workspaces that aren't included in the prune
RUN sed -i '/"examples",/d' package.json

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY --from=builder /app/out/full/ .

# Build the API
RUN bun run build --filter=@wd-ai-tools/api

# Runner stage
FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/api/dist ./apps/api/dist
COPY --from=installer /app/apps/api/package.json ./apps/api/package.json

# Copy only necessary workspace dependencies
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV TZ=UTC

# Create non-root user for security
RUN addgroup --system --gid 1001 appuser
RUN adduser --system --uid 1001 --ingroup appuser appuser

# Create logs directory and set permissions
RUN mkdir -p /app/apps/api/logs && chown -R appuser:appuser /app

USER appuser

# Expose the port
EXPOSE 8080

# Change to API directory
WORKDIR /app/apps/api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun --version || exit 1

# Start the application
CMD ["bun", "run", "start"]