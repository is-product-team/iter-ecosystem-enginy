# infra Specification

## Purpose
TBD - created by archiving change fix-docker-ports-consistency. Update Purpose after archive.
## Requirements
### Requirement: Consistencia de Puertos Internos
El sistema DEBE y DEBERÁ utilizar el puerto 3000 como puerto interno estándar para todos los servicios web y API dentro de los contenedores Docker en el entorno de desarrollo (The system SHALL use port 3000 as the standard internal port).

#### Scenario: Acceso al frontend en desarrollo
- **WHEN** el usuario accede a `localhost:${WEB_PORT}` (ej. port 8000)
- **THEN** Docker mapea la petición al puerto 3000 interno del contenedor web y el servicio responde correctamente.

#### Scenario: Healthcheck exitoso
- **WHEN** el motor de Docker ejecuta el healthcheck configurado
- **THEN** la petición a `http://localhost:3000/` dentro del contenedor devuelve un estado exitoso (200 OK).

### Requirement: CORS Sincronizado
El backend DEBE y DEBERÁ permitir peticiones CORS desde el puerto de desarrollo configurado para el frontend en el archivo `.env` raíz (The backend SHALL allow CORS requests).

#### Scenario: Petición desde el frontend al backend
- **WHEN** el frontend (ej. en localhost:8000) realiza una petición al API
- **THEN** el API permite la conexión al incluir el origen en su lista blanca de CORS.

