# Railway Dockerfile for TVP Redesign 2026 - Staging Environment
# Frontend-only build for SPA deployment

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production runtime stage
FROM node:20-alpine

WORKDIR /app

# Install a lightweight HTTP server for serving the SPA
RUN npm install -g serve

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy package.json for reference
COPY package.json .

# Expose the port for Railway
EXPOSE 4173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4173', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the preview server
CMD ["npm", "run", "preview"]
