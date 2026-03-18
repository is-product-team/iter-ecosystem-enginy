# 🌐 Infraestructura Global - Contexto Técnico (LXC Projects)

Este documento detalla la arquitectura de despliegue y red para los proyectos alojados en este servidor LXC (`192.168.1.39`). **Cualquier nuevo proyecto debe seguir estas reglas para integrarse correctamente.**

---

## 🏗️ Arquitectura de Red
- **Red Docker:** Todos los contenedores deben unirse a la red externa `red_proxy`.
  - Comando manual: `docker network create red_proxy` (ya creada).
- **Proxy Inverso:** Un contenedor Nginx global gestiona todo el tráfico entrante en `~/nginx-global`.
- **Acceso:** Las aplicaciones NO exponen puertos al exterior; solo el Nginx Global escucha en los puertos `80` (HTTP) y `443` (HTTPS).

---

## 🚀 Despliegue de un Nuevo Proyecto
Para añadir un nuevo proyecto (ej: `nuevo-app`):

### 1. En el repositorio del proyecto:
- **`docker-compose.prod.yml`**:
  - Los servicios deben llamarse de forma única (ej: `nuevo_web`, `nuevo_api`).
  - El puerto interno debe ser `3000`.
  - Debe incluir la red `red_proxy` como externa.
- **`.github/workflows/deploy.yml`**:
  - Usar `runs-on: [self-hosted, Linux, X64]`.
  - El runner debe estar instalado en `/home/kore/action-runners/nombre-proyecto`.

### 2. En el Nginx Global (`~/nginx-global/config/nginx.conf`):
Añadir las rutas correspondientes apuntando al nombre del contenedor de Docker:
```nginx
location /nuevo-app {
    proxy_pass http://nuevo_web:3000;
    ...
}
location /nuevo-app/api {
    proxy_pass http://nuevo_api:3000;
    ...
}
```

---

## 🤖 Configuración del GitHub Runner
- **Usuario:** `kore` (No usar root para runners).
- **Ruta:** `/home/kore/action-runners/`
- **Servicio:** Se gestiona con `./svc.sh` dentro de cada carpeta de runner.

---

## 📁 Estructura de Carpetas Recomendada
- `~/nginx-global/`: Configuración del Proxy Inverso.
- `~/action-runners/`: Instancias de GitHub Runners para cada repo.
- `~/docker-data/`: (Opcional) Volúmenes de bases de datos persistentes.

---

## 🔐 Seguridad y Certificados (Cloudflare Tunnel)
- **SSL/TLS:** El certificado lo gestiona **Cloudflare** automáticamente a través del túnel (`cloudflared`). 
- **Nginx Interno:** El contenedor `global_proxy` solo necesita escuchar en el **puerto 80**. Cloudflare recibe el tráfico HTTPS y lo entrega al Nginx localmente de forma segura.
- **Sin Puertos Abiertos:** No es necesario abrir puertos en el router ni configurar `certbot` en el LXC.
