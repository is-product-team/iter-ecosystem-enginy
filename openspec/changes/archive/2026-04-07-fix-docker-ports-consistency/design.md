## Context

Actualmente hay una discrepancia entre cómo se configuran los puertos en desarrollo (Docker Compose) y producción (Nginx/Proxy). En desarrollo, el archivo `apps/web/.env` establece `PORT=8000`, pero `docker-compose.yml` intenta mapear el tráfico al puerto 3000 del contenedor. Esto causa que el frontend no sea accesible y que los healthchecks fallen.

## Goals / Non-Goals

**Goals:**
- Unificar el puerto interno de todos los servicios web a 3000.
- Asegurar que `localhost:8000` funcione correctamente en el host mapeando al puerto 3000 interno.
- Corregir los healthchecks para que verifiquen el puerto correcto (3000).
- Sincronizar CORS para permitir el origen correcto.

**Non-Goals:**
- Cambiar la arquitectura de red (`red_proxy`, `iter-network`).
- Modificar el comportamiento de producción (que ya usa el puerto 3000).

## Decisions

1. **Puerto Interno Estándar (3000)**: Se establece el puerto 3000 como el puerto por defecto para todos los contenedores web/api. 
   - *Rationale*: Es el estándar de Next.js y Express, y coincide con la configuración de producción ya documentada.
2. **Mapeo Dinámico en Compose**: Usar variables `${WEB_PORT}` y `${API_PORT}` del `.env` raíz para el lado del host, pero mantener `3000` fijo para el lado del contenedor.
3. **CORS Dinámico**: Asegurar que `CORS_ORIGIN` en el backend incluya explícitamente el puerto configurado en el `.env` raíz.

### Diagrama de Flujo de Red (Desarrollo)

```
Navegador (Host)          Docker Bridge Network      Contenedor (Web)
┌────────────────┐       ┌──────────────────────┐    ┌─────────────────┐
│ localhost:8000 ├──────▶│ Mapeo: 8000 -> 3000  ├────▶│ Next.js (3000)  │
└────────────────┘       └──────────────────────┘    └─────────────────┘
                                                       ▲
                                                       │ Healthcheck (3000)
                                                       │
```

## Risks / Trade-offs

- **[Riesgo]** Confusión si el usuario intenta cambiar el puerto interno. 
  - **Mitigación**: Documentar que el puerto interno es siempre 3000 y solo se debe cambiar el puerto del host en el `.env` raíz.
- **[Riesgo]** Cache de Docker.
  - **Mitigación**: Recomendar un `docker compose up --build` tras los cambios.
