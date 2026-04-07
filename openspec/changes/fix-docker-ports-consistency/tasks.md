## 1. Configuración de Variables de Entorno

- [x] 1.1 Modificar `apps/web/.env` para cambiar `PORT=8000` a `PORT=3000`.
- [x] 1.2 Actualizar `apps/api/.env` para que `CORS_ORIGIN` incluya `http://localhost:8000`.
- [x] 1.3 Verificar que el archivo `.env` raíz tenga los valores correctos (`WEB_PORT=8000`, `API_PORT=3000`).

## 2. Orquestación Docker

- [x] 2.1 Actualizar `docker-compose.yml` para asegurar que los mapeos de puertos usen `3000` como puerto interno para los servicios `web` y `api`.
- [x] 2.2 Actualizar los healthchecks en `docker-compose.yml` para apuntar al puerto `3000`.

## 3. Verificación y Limpieza

- [x] 3.1 Reiniciar contenedores con `docker compose up -d --build`.
- [x] 3.2 Verificar acceso a `localhost:8000` en el navegador.
- [x] 3.3 Verificar que los contenedores aparezcan como `healthy`.
