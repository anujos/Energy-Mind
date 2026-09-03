# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including dev tools like vite, esbuild, typescript)
RUN npm install

# Copy full application source code
COPY . .

# Build Vite client SPA into dist/ and bundle Express backend into dist/server.cjs
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled client bundle and server script from builder
COPY --from=builder /app/dist ./dist

# Expose port 8080 (Google Cloud Run default)
EXPOSE 8080

# Run the compiled CommonJS server
CMD ["node", "dist/server.cjs"]
