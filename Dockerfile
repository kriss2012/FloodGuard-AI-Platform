# ==============================================================================
# FloodGuard AI: Production Container Image
# ET AI Hackathon 2026: Multi-Agent Flood Risk & Disaster Intelligence Copilot
# ==============================================================================

# Stage 1: Build Frontend Distribution
FROM node:20-alpine AS builder

WORKDIR /app

COPY app/package*.json ./
RUN npm ci

COPY app/ ./
RUN npm run build

# Stage 2: Serve Production Assets via Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
