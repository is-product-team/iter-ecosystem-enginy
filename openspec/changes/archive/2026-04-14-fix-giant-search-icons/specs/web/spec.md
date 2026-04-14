## ADDED Requirements

### Requirement: Standard Icon Sizing
The web frontend SHALL only use standard Tailwind CSS classes for icon sizing (e.g., `h-4`, `h-5`, `h-6`) or explicit arbitrary values (e.g., `h-[18px]`) defined in the theme configuration.

#### Scenario: Search icon sizing
- **WHEN** a search input includes a magnifying glass icon
- **THEN** the icon MUST be sized using standard classes (typically `h-5 w-5`) to avoid unexpected rendering issues.

#### Scenario: Global size consistency
- **WHEN** any SVG icon is rendered in the UI
- **THEN** it MUST have explicit height and width classes that are supported by the project's Tailwind configuration.
