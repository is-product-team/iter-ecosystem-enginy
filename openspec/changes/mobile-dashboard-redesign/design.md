## Context

El dashboard de Iter Mobile es la pantalla principal (`app/(professor)/(tabs)/index.tsx`) que los profesores ven al abrir la aplicación. Actualmente utiliza un patrón de lista plana tipo "WhatsApp rows" (`DashboardItem`), donde todos los elementos tienen el mismo peso visual y tamaño. Esto resulta en una jerarquía pobre donde la próxima sesión —el dato más crítico para el profesor— no recibe protagonismo visual.

La app ya tiene un sistema de diseño base con componentes `ui/Button`, `ui/FormGroup`, `ui/TextInput`, y los datos necesarios se obtienen correctamente de la API (asignaciones, fases, notificaciones).

## Goals / Non-Goals

**Goals:**
- Establecer una jerarquía visual clara en la pantalla de inicio.
- Convertir la "próxima sesión" en el elemento visual dominante mediante una Hero Card.
- Reemplazar las listas planas de accesos por un grid 2×2 de tarjetas compactas.
- Hacer el header sensible al contexto (saludos adaptados al momento del día y estado de sesiones).
- Reutilizar el sistema de componentes UI existente, extendiendo con nuevos componentes de dashboard si es necesario.

**Non-Goals:**
- Cambiar la navegación por tabs ni las rutas existentes.
- Modificar la API o el backend.
- Rediseñar otras pantallas (perfil, calendario, coordinación).
- Introducir animaciones complejas o librerías adicionales.

## Decisions

### D1: Hero Card como elemento focal principal

**Decisión:** La próxima sesión/asignación se muestra como una tarjeta grande y prominente (Hero Card) en la parte superior del contenido scrollable.

**Alternativa descartada:** Mantener el `DashboardItem` de "Próxima sesión" como una fila small de lista. Descartado porque da el mismo peso visual que "Ir a Notificaciones".

**Rationale:** En las apps de referencia Apple (Salud, Fitness, Wallet), el dato más importante ocupa siempre el mayor espacio en pantalla. La próxima sesión es la acción más urgente para el profesor.

```
┌─────────────────────────────────────┐
│  🗓  PRÓXIMA SESIÓN                 │   ← Hero Card (ancho completo, ~130px alto)
│  Taller de Robótica                 │
│  Institut Joan Brossa               │
│  Hoy · 09:00 – 13:00              │
│  [Ver detalles]                 › │
└─────────────────────────────────────┘
```

### D2: Grid 2×2 para accesos rápidos

**Decisión:** Cuatro tarjetas cuadradas compactas en un grid 2 columnas para los accesos: Notificaciones, Fase Activa, Coordinación y Evaluaciones.

**Alternativa descartada:** Mantener la lista de `DashboardItem` para estos accesos.

**Rationale:** El grid diferencia visualmente los "accesos de navegación" de los "datos de sesión", y es una convención consolidada en iOS (pantalla de inicio, Salud, Atajos).

```
┌──────────┐  ┌──────────┐
│  🔔  3  │  │ 🚀 Fase  │
│ Notif.  │  │Phase 3   │
└──────────┘  └──────────┘
┌──────────┐  ┌──────────┐
│ 👥 Coord │  │ ⭐ Eval. │
│          │  │ 2 pend.  │
└──────────┘  └──────────┘
```

### D3: Componentes en `components/dashboard/`

**Decisión:** Extraer `HeroCard` y `QuickAccessGrid` como componentes reutilizables en `apps/mobile/components/dashboard/`.

**Rationale:** Mantiene el `index.tsx` limpio (solo lógica) y los componentes reutilizables para futuras pantallas. Sigue el mismo patrón ya establecido en `components/ui/`.

### D4: Header contextual con saludo dinámico

**Decisión:** El subtexto del header variará según el momento del día y el estado de las sesiones.

**Lógica:**
- Si hay sesión hoy → "Tienes una sesión hoy"
- Si no hay sesión pero hay alguna próxima → "Tu próxima sesión es el [fecha]" 
- Si no hay sesiones → "Sin sesiones próximas"
- Añadir un saludo temporal: "Buenos días / Buenas tardes" basado en la hora.

## Risks / Trade-offs

- **[Riesgo] Si `assignments` está vacío, la Hero Card no tiene contenido** → Mitigación: Estado vacío elegante con mensaje contextual y CTA para ver el calendario.
- **[Tradeoff] Más código/componentes** → La claridad visual y la mantenibilidad a largo plazo justifican la separación en archivos distintos.
- **[Riesgo] El grid puede quedar mal en pantallas muy pequeñas** → Mitigación: Usar tamaños relativos (`flex-1`) y testear en Expo Go con iPhone SE simulado.
