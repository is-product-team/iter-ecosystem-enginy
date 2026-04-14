# Unified Loading System

## Requirements

### Requirement: Uniformity of Loading Indicators
All asynchronous loading indicators in the `web` application must transition from legacy manual implementations to the unified `<Loading />` component.

#### Scenario: Full-page data fetching
- **WHEN** A page or a major layout is in an initial loading state
- **THEN** It must display `<Loading fullScreen />` with `backdrop-blur-md` and a semi-transparent overlay.

#### Scenario: Section-level fetching
- **WHEN** A specific component or sub-layout is fetching data
- **THEN** It must display `<Loading size="md" />` (default) centered within its container.

#### Scenario: Tiny inline actions (Buttons/Checklists)
- **WHEN** A button or a checklist item is performing a background action
- **THEN** It must display `<Loading size="mini" />` to fit within the small UI boundaries.

### Requirement: Dark Mode & Theming
The loading component must automatically adapt its colors based on the `dark` class presence on the body.

#### Scenario: Light Mode Loading
- **WHEN** The interface is in light mode
- **THEN** The spinner and text must use charcoal/dark blue tones (`stroke-text-primary`).

#### Scenario: Dark Mode Loading
- **WHEN** The interface is in dark mode
- **THEN** The spinner and text must use light/inverse tones (`stroke-white`).
