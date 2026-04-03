# ─── Stage 1: Build React frontend ──────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Run Express backend ────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Copy compiled frontend into the backend's expected location
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Cloud Run injects PORT env var (default 8080)
ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "backend/server.js"]
