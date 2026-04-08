# Specification: UI Modernization

This specification defines the requirements for the "Minimalist Sharp" design system, ensuring a professional, premium aesthetic through typography, strict geometry, and layering.

## Context
We are replacing the "Institutional Brutalist" style with a cleaner, Inter-focused design that explicitly avoids shadows and rounded corners.

## Requirements

### Global Aesthetics
The platform must maintain a strictly professional tone through sharp geometry and consistent typography.

#### Requirement: Sharp Geometry
All interactive and container elements must have a border-radius of 0px.
- **WHEN** any UI element (button, card, input, dialog) is rendered.
- **THEN** it must have `border-radius: 0px`.

#### Requirement: Shadowless Depth
Drop shadows must be removed in favor of background layering and subtle borders.
- **WHEN** an element needs visual separation from the background.
- **THEN** use a `1px` border (Light: `#E5E7EB`, Dark: `#2C2C2E`).
- **THEN** use a background color progression.
- **THEN** (Dark Mode) ensure all backgrounds are neutral/black, avoiding blue (#000000) or anthracite (#121212) tones.

### Typography
Inter must be the primary typeface, used without aggressive bolding or uppercase patterns.

#### Requirement: Weight Standardization
Font weights must not exceed Medium (500) for standard headings and buttons.
- **WHEN** text is rendered in a header or button.
- **THEN** the font weight must be `400` or `500`.
- **THEN** the text must be in **Sentence case**, never all-caps.

### Modern Texture
The UI should feel "premium" through translucency and smooth interactions.

#### Requirement: Translucency
Navigation elements must support backdrop blurring.
- **WHEN** the Sidebar or Header is rendered.
- **THEN** it must have a semi-transparent background with a `backdrop-blur` effect.
