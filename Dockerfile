# Stage 1: Base (Node 22 con herramientas de construcción incluidas)
FROM node:22 AS base
RUN corepack enable
ENV COREPACK_ENABLE=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000
WORKDIR /app

# Stage 2: Pruner (Base para poda)
FROM base AS pruner
RUN npm install -g turbo
COPY . .

# Stage 2a: Pruning para Web
FROM pruner AS pruner-web
RUN turbo prune @iter/web --docker

# Stage 2b: Pruning para API
FROM pruner AS pruner-api
RUN turbo prune @iter/api --docker
# Fix: re-inyectar manualmente las migraciones que turbo prune borra
RUN mkdir -p out/full/apps/api/prisma && cp -r apps/api/prisma/* out/full/apps/api/prisma/

# --- BUILDER WEB ---
FROM base AS builder-web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=pruner-web /app/out/json/ .
COPY --from=pruner-web /app/out/package-lock.json ./package-lock.json
RUN npm ci --ignore-scripts
COPY --from=pruner-web /app/out/full/ .
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
COPY --from=builder-web /app/apps/web/public ./public

USER node
EXPOSE 3000
# IMPORTANTE: En monorepo standalone, server.js está en apps/web/server.js
CMD ["node", "apps/web/server.js"]

# --- BUILDER API ---
FROM base AS builder-api
COPY --from=pruner-api /app/out/json/ .
COPY --from=pruner-api /app/out/package-lock.json ./package-lock.json
RUN npm install --ignore-scripts
COPY --from=pruner-api /app/out/full/ .
# Forzar inclusión de prisma y migraciones
COPY --from=pruner-api /app/apps/api/prisma ./apps/api/prisma
WORKDIR /app/apps/api
RUN npx prisma generate
WORKDIR /app
RUN npx turbo run build --filter=@iter/api

# --- RUNNER API (PRODUCCIÓN) ---
FROM base AS runner-api
ENV NODE_ENV=production
WORKDIR /app

# Asegurar que el usuario node tenga permisos sobre el WORKDIR
RUN chown -R node:node /app

# Copiamos la estructura completa necesaria para que los symlinks de node_modules funcionen
COPY --from=builder-api --chown=node:node /app/node_modules ./node_modules
# Importante: apps/api/dist contiene tanto apps/api como shared debido a rootDir: ../../
# Al copiarlo a ./dist, mantenemos la estructura que tsc generó para resolver imports relativos
COPY --from=builder-api --chown=node:node /app/apps/api/dist ./dist
# Fix: Copiar el paquete shared y sus JS compilados para que el runner los encuentre
COPY --from=builder-api --chown=node:node /app/shared ./shared
COPY --from=builder-api --chown=node:node /app/apps/api/dist/shared ./shared
COPY --from=builder-api --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder-api --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder-api --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder-api --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma

# Patch: Corregir package.json de @iter/shared para que apunte al JS compilado en lugar del TS
# Esto evita que Node intente cargar archivos .ts en producción
RUN sed -i 's/"main": ".\/index.ts"/"main": ".\/index.js"/g' ./node_modules/@iter/shared/package.json && \
    sed -i 's/"import": ".\/index.ts"/"import": ".\/index.js"/g' ./node_modules/@iter/shared/package.json && \
    sed -i 's/"require": ".\/index.ts"/"require": ".\/index.js"/g' ./node_modules/@iter/shared/package.json

# Crear la carpeta d'uploads y asegurar permisos
RUN mkdir -p /app/uploads/perfil /app/uploads/documents && chown -R node:node /app/uploads

USER node
EXPOSE 3000
# Apuntamos a la ruta exacta dentro de ./dist que tsc generó
CMD ["node", "dist/apps/api/src/index.js"]