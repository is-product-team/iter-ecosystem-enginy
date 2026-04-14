# Design: Mobile Translations Centralization

This document outlines the strategy for moving hardcoded strings to the localization system.

## Overview

The refactoring will follow a systematic approach:
1.  Identify all hardcoded strings in `.tsx` files.
2.  Define a consistent taxonomy for the translation keys.
3.  Update the JSON translation files for Catalan and Spanish.
4.  Replace the hardcoded strings with `t()` calls.

## Localization Taxonomy

We will use a hierarchical structure to organize keys:

```json
{
  "Common": {
    "today": "Avui",
    "tomorrow": "Demà",
    "email": "Email",
    "not_available": "N/A"
  },
  "Auth": {
    "login": {
      "welcome_title": "Te damos la bienvenida a Iter",
      "welcome_subtitle": "Gestión avanzada...",
      "login_problems": "¿Problemas para acceder?",
      "privacy_footer": "Al iniciar sesión, aceptas nuestra Política de Privacidad..."
    }
  },
  "Dashboard": {
    "greeting_morning": "Bon dia, {{name}}",
    "greeting_afternoon": "Bona tarda, {{name}}",
    "no_upcoming_sessions": "Sense sessions properes",
    "session_today": "Tens una sessió avui",
    "next_session_on": "Pròxima sessió el {{label}}",
    "recent_workshops": "Tallers recents",
    "none_new": "Cap de nou"
  },
  "Calendar": {
    "weekdays": {
      "dl": "DL",
      "dt": "DT",
      "dc": "DC",
      "dj": "DJ",
      "dv": "DV",
      "ds": "DS",
      "dg": "DG"
    },
    "no_events": "No hi ha esdeveniments",
    "all_day": "Tot el dia"
  }
}
```

## Component Refactoring

### Dashboard (`app/(professor)/(tabs)/index.tsx`)
- Refactor `getContextualGreeting` to accept the `t` function or move it inside the component.
- Localize values in `quickAccessItems`.

### HeroCard (`components/dashboard/HeroCard.tsx`)
- Inject `useTranslation` hook.
- Map internal labels ("Avui", "Demà") to translation keys.

### CalendarView (`components/CalendarView.tsx`)
- Map weekday abbreviations.
- Localize date formatting locale (`ca-ES` vs `es-ES`).
- Localize "No hi ha esdeveniments" and "Tot el dia".

## Workflow for New Strings
All new features must use translation keys from the start. We will add a lint rule or a check in the future to prevent hardcoded strings in JSX.
