# Tareas: Unificación de Entorno y Puertos

## 1. Infraestructura y Consolidación de .env

- [x] 1.1 Crear el nuevo archivo `.env` maestro en la raíz combinando todas las variables actuales. <!-- id: 1.1 -->
- [x] 1.2 Actualizar `.env.example` en la raíz con la nueva estructura documentada. <!-- id: 1.2 -->
- [x] 1.3 Refactorizar `docker-compose.yml` para usar `env_file: .env` en todos los servicios. <!-- id: 1.3 -->
- [x] 1.4 Estandarizar el mapeo de puertos en Docker Compose usando variables `_PORT_EXTERNAL` y `_PORT_INTERNAL`. <!-- id: 1.4 -->

## 2. Validación de Entorno (Fail-Safe)

- [x] 2.1 Implementar utilidad de validación con Zod en `apps/api/src/config/env.ts`. <!-- id: 2.1 -->
- [x] 2.2 Implementar utilidad de validación con Zod en `apps/web/config/env.ts`. <!-- id: 2.2 -->
- [x] 2.3 Integrar la validación en los puntos de entrada (`index.ts` / `layout.tsx`) para abortar el arranque si faltan variables. <!-- id: 2.3 -->

## 3. Refactorización de Aplicaciones

- [x] 3.1 Eliminar variables hardcodeadas en `apps/api` (ej: secretos por defecto, URLs de desarrollo). <!-- id: 3.1 -->
- [x] 3.2 Actualizar configuración de Prisma para construir `DATABASE_URL` dinámicamente o validarla estrictamente. <!-- id: 3.2 -->
- [x] 3.3 Configurar el Frontend para usar `INTERNAL_API_URL` (para SSR) y `NEXT_PUBLIC_API_URL` (para cliente). <!-- id: 3.3 -->

## 4. Limpieza y CI/CD

- [x] 4.1 Eliminar archivos `.env` residuales en `apps/api` y `apps/web`. <!-- id: 4.1 -->
- [x] 4.2 Actualizar `.github/workflows/deploy-self-hosted.yml` para simplificar la creación de entornos de producción. <!-- id: 4.2 -->
- [x] 4.3 Verificar que el comando `docker compose up` funciona correctamente con el nuevo sistema. <!-- id: 4.3 -->
