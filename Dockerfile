# Stage 1: Base (Node 22 + Librerías sistema)
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl curl
RUN corepack enable
ENV COREPACK_ENABLE=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000
WORKDIR /app

# Stage 2: Pruner (Separa dependencias de Web y API)
FROM base AS pruner
RUN npm install -g turbo
COPY . .
RUN turbo prune @iter/web --docker
RUN turbo prune @iter/api --docker
# El fix definitivo: re-inyectar manualmente las migraciones que turbo prune borra
RUN mkdir -p out/full/apps/api/prisma && cp -r apps/api/prisma/* out/full/apps/api/prisma/

# --- BUILDER WEB ---
FROM base AS builder-web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install --ignore-scripts
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=@iter/web

# --- RUNNER WEB (PRODUCCIÓN) ---
FROM base AS runner-web
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
WORKDIR /app
# En modo standalone monorepo, Next.js pone todo lo necesario en la carpeta standalone
COPY --from=builder-web /app/apps/web/.next/standalone ./
COPY --from=builder-web /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder-web /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
# IMPORTANTE: En monorepo standalone, server.js está en apps/web/server.js
CMD ["node", "apps/web/server.js"]

# --- BUILDER API ---
FROM base AS builder-api
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm install --ignore-scripts
COPY --from=pruner /app/out/full/ .
# Forzar inclusión de prisma y migraciones
COPY --from=pruner /app/apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
RUN npx prisma generate
WORKDIR /app
RUN npx turbo run build --filter=@iter/api

# --- RUNNER API (PRODUCCIÓN) ---
FROM base AS runner-api
ENV NODE_ENV=production
WORKDIR /app

# Copiamos la estructura completa necesaria para que los symlinks de node_modules funcionen
COPY --from=builder-api /app/node_modules ./node_modules
COPY --from=builder-api /app/shared ./shared
COPY --from=builder-api /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder-api /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder-api /app/apps/api/dist ./apps/api/dist
COPY --from=builder-api /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder-api /app/node_modules/@prisma ./node_modules/@prisma

# Crear la carpeta d'uploads per garantir que existeixi
RUN mkdir -p /app/uploads/perfil /app/uploads/documents

USER node
EXPOSE 3000
# Apuntamos a la ruta exacta donde tsc genera el index con rootDir: ../../
CMD ["node", "apps/api/dist/apps/api/src/index.js"]