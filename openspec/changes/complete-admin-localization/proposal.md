# Proposal: Complete Admin Localization

## Goal
Eliminate all remaining raw English text in the Admin and Center dashboards, ensuring full compatibility with the existing `next-intl` localization system for Catalan (`ca.json`) and other supported languages.

## Background
During a recent exploration across the frontend components under the Catalan locale, multiple views (notably within the Center routing and the Admin modals) were found to display hardcoded English text. Key components such as the `CreateWorkshopModal`, `Pagination`, and heavily data-driven views like Center Assignments and Sessions are bypassing the `t()` or `tc()` translation hooks. This disrupts the immersive multi-language experience.

## Scope
The scope resolves around replacing raw English strings with `next-intl` keys and updating the translation dictionaries (`ca.json` and `en.json`) simultaneously.

Specifically targeting:
1. **Admin Components**: `CreateWorkshopModal`
2. **Shared Components**: `Pagination`, `NextEventsWidget`, `Calendar`
3. **Center Dashboard Routes**: `center/assignments`, `center/sessions`, `center/requests`, `center/notifications`

Out of scope: Modifying backend error messages or non-user-facing system logs.
