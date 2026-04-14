# Tasks: Estandarización y Optimización Docker

## 1. Estandarización de Puertos
- [x] Modificar `apps/web/package.json` para que el script `dev` use el puerto 3000: `"dev": "next dev -p ${PORT:-3000} -H 0.0.0.0"`.
- [x] Actualizar `docker-compose.yml` para mapear el servicio `web` al puerto interno 3000: `"${WEB_PORT:-8002}:3000"`.
- [x] Asegurar que `Dockerfile` en la etapa `runner-web` expone y usa el puerto 3000 (ya está configurado, verificar consistencia).

## 2. Optimización del Build y Seguridad
- [x] Modificar `Dockerfile` para añadir `USER node` en las etapas `runner-web` y `runner-api`.
- [ ] Ajustar la etapa `pruner` para copiar solo los archivos necesarios (`package.json`, `package-lock.json`, `turbo.json`) antes de ejecutar `turbo prune`.
- [ ] Refinar el copiado de dependencias en `runner-api` para no copiar todo `node_modules` si es posible, o usar una instalación limpia de producción.

## 3. Robustez de Infraestructura
- [x] Modificar el comando del servicio `setup` en `docker-compose.yml` eliminando el flag `--force-reset`.
- [x] Añadir `healthcheck` a los servicios `db`, `api` y `web` en `docker-compose.yml`.
- [x] En `docker-compose.prod.yml`, sustituir la URL hardcodeada de `NEXT_PUBLIC_API_URL` por una variable de entorno.

## 4. Verificación
- [ ] Ejecutar `docker compose down -v` (con precaución) y luego `docker compose up --build` para verificar el nuevo flujo de construcción.
- [ ] Comprobar que los contenedores corren bajo el usuario `node`: `docker exec <container> id`.
- [ ] Verificar acceso a Web (8002) y API (3000) externamente.
