# Specification: Design Overview & UX

The Iter Ecosystem is built with a "Premium First" philosophy, aiming for a visual experience that is both professional and state-of-the-art, drawing inspiration from modern high-end software design (Apple-style aesthetics).

## 1. Design Principles

- **Visual Excellence**: Avoidance of generic browser defaults. Use of curated color palettes, smooth gradients, and depth through shadowing.
- **Glassmorphism**: Subtle use of background blurs and semi-transparent surfaces to create a layered "glass" effect.
- **Micro-Animations**: Use of smooth transitions for hover states, modal entries, and status changes to make the interface feel alive.
- **Mobile-Optimized UX**: The mobile app prioritizes one-handed usability with large action areas and bottom sheets.

## 2. Color System (Tokens)

The system uses a strictly defined set of tokens managed in `packages/shared/theme.ts`.

### Primitives
- **Primary (`#00426B`)**: Deep Navy, used for branding and high-priority headers.
- **Secondary (`#4197CB`)**: Sky Blue, used for primary actions and brand backgrounds.
- **Accent (`#F26178`)**: Coral Red, used for highlights and specific call-to-actions.
- **Neutral/Slate**: Grayscale ramps for backgrounds and text.

### Semantic Themes
- **Light Mode**: High legibility with `#F9FAFB` page backgrounds and white surfaces.
- **Dark Mode**: High contrast and reduced eye strain using `#0F172A` (Slate 900) as the base.

## 3. Typography

- **Font Family**: **Inter** is the primary typeface across all platforms (Web, Mobile, Admin).
- **Hierarchy**:
  - **Headers**: Black/Extrabold weight with tight letter spacing for a modern impact.
  - **Body**: Medium weight for optimal readability.
  - **Monospace**: Used for technical IDs and telemetry data.

## 4. Components & Layout

- **Shadows**: Soft, multi-layered shadows to provide depth without harsh lines.
- **Borders**: Subtle `1px` borders in Neutral 200 (Light) or Slate 700 (Dark) to define structure.
- **Rounded Corners**: Generous border-radii (`1rem` to `2rem`) for a friendly, modern feel.
- **Glass Surfaces**: High-blur backdrops for modals and navigation bars.

## 5. Responsive Strategy

- **Admin Web**: Information-dense dashboard layout using a persistent sidebar and grid-based widgets.
- **Mobile App**: Contextual navigation focused on current missions and immediate actions (Attendance, Sessions).
