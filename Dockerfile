# Railway Dockerfile for TVP Backend - Express.js API Server
# This runs the backend Express server that the frontend connects to

FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy backend source code
COPY server/src ./src

# Expose the backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the backend server
CMD ["node", "src/index.js"]
