## Why

Actualmente existe una inconsistencia entre los puertos internos configurados en las variables de entorno (`apps/web/.env`) y los mapeos de puertos en `docker-compose.yml`. Esto provoca que, al iniciar Docker, el servicio web no sea accesible desde el host a través de `localhost:8000`, ya que el tráfico se redirige a un puerto interno donde el servidor no está escuchando. Además, los healthchecks fallan por la misma razón.

## What Changes

- Sincronización de puertos internos a un valor estándar (3000) para todos los servicios web/api dentro de los contenedores.
- Actualización de los mapeos de Docker para que coincidan con los puertos configurados en el `.env` raíz.
- Corrección de las URLs de CORS en el backend para permitir conexiones desde los puertos de desarrollo correctos.
- Actualización de los healthchecks en `docker-compose.yml` para usar los puertos internos correctos.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `infra`: Se actualiza la especificación de despliegue con Docker para asegurar consistencia en la gestión de puertos.

## Impact

- `docker-compose.yml`: Cambios en mapeos de puertos y healthchecks.
- `apps/web/.env`: Cambio de puerto interno de 8000 a 3000.
- `apps/api/.env`: Actualización de CORS_ORIGIN.
- `.env` (root): Asegurar que las variables de puerto coincidan con la intención del usuario.
