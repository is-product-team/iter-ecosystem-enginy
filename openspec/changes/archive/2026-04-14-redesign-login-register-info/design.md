# Design: Redesign Login and Registration Info

## UI Redesign Plan

### 1. The "Apple" Aesthetic
- **Colors**: Use the existing neutral palette (`bg-background-page` and `bg-background-surface`).
- **Borders**: Remove the `border border-border-subtle` from the main card. Use a very subtle `shadow-sm` or `shadow-md` for depth.
- **Typography**: Increase line height and letter spacing slightly. Use `font-medium` for headers.
- **Dividers**: Remove the `h-0.5 w-8 bg-consorci-darkBlue`. Instead, use white space to separate the logo from the content.

### 2. Information View (3 Columns)
- **Container**: A responsive grid (`grid-cols-1 md:grid-cols-3`).
- **Icons**: Use `lucide-react` icons:
  - `Building2` for Coordinators.
  - `ShieldCheck` for Administrators.
  - `Smartphone` for Teachers.
- **Content**: Center-aligned typography, clear headings, and concise descriptions.

### 3. Transition Logic
- Use a boolean or string state `showInfo` in the `LoginPage` component.
- Wrap both the Login Form and the Info View in a Presence container or use Tailwind's `animate-in` classes for a fade-in effect.

## Internationalization
The following keys will be added to `apps/web/messages/[locale].json`:

```json
{
  "Auth": {
    "login": {
      "tagline": "Ecosistema de ingeniería y gestión educativa",
      "no_account_link": "¿No tienes cuenta? Infórmate aquí",
      "register_info": {
        "title": "¿Cómo obtener acceso?",
        "coordinator": {
          "title": "Coordinación",
          "desc": "Contacta con coordinacio@iter.cat para dar de alta tu centro en la plataforma."
        },
        "admin": {
          "title": "Administración",
          "desc": "Ponte en contacto con el equipo del proyecto para la gestión global."
        },
        "teacher": {
          "title": "Profesorado",
          "desc": "Gestiona tus sesiones e incidencias directamente desde la App de profesores."
        },
        "back": "Volver al inicio de sesión"
      }
    }
  }
}
```
