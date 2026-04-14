# Propuesta: Estandarización y Optimización de Infraestructura Docker

## Goal
Estandarizar y optimizar la infraestructura Docker del proyecto para asegurar la consistencia entre entornos (desarrollo y producción), reducir los tiempos de construcción, minimizar el tamaño de las imágenes y mejorar la postura de seguridad.

## Scope
- **Unificación de Puertos**: Configurar tanto la Web como la API para usar el puerto 3000 internamente en todos los entornos, eliminando la discrepancia actual (3001 en dev vs 3000 en prod para la Web).
- **Optimización de Builds**: Refinar las etapas del `Dockerfile` para mejorar el aprovechamiento de la caché de capas y reducir el tamaño de la imagen de la API (usando una instalación limpia de dependencias de producción o aprovechando mejor el podado de Turbo).
- **Mejora de Seguridad**: Cambiar la ejecución de los contenedores finales al usuario no privilegiado `node` incorporado en la imagen base de Alpine.
- **Parametrización**: Eliminar URLs hardcodeadas en `docker-compose.prod.yml` y moverlas a variables de entorno o archivos `.env`.
- **Robustez del Setup**: Ajustar el servicio de `setup` para evitar el uso por defecto de `--force-reset` en Prisma, protegiendo contra la pérdida accidental de datos.
- **Salubridad (Healthchecks)**: Añadir definiciones de `healthcheck` en Docker Compose para mejorar la orquestación de servicios dependientes.

## Motivation
Actualmente existen inconsistencias en el mapeo de puertos que pueden causar errores sutiles al desplegar. Además, las imágenes de producción son más pesadas de lo necesario al incluir dependencias de desarrollo, y la ejecución como `root` representa un riesgo de seguridad evitable. Esta propuesta busca profesionalizar el stack de despliegue y hacerlo más eficiente y seguro.
