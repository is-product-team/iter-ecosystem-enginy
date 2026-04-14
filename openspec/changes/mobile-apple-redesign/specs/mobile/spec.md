## ADDED Requirements

### Requirement: iOS-Native Aesthetic Standard
The mobile application UI MUST adhere to an iOS-native (Apple-style) aesthetic while preserving the application's serious and intuitive user experience.

#### Scenario: Visual styling of common components
- **WHEN** the interface is rendered
- **THEN** it utilizes rounded geometries (squircles) instead of sharp rectangular boxes
- **THEN** typography uses Sentence case for readability instead of heavily tracked UPPERCASE headers

### Requirement: Reusable Mobile UI Components
The mobile application MUST implement and utilize a shared directory of reusable UI components (`apps/mobile/components/ui/`) for common structural elements to ensure consistent styling.

#### Scenario: Using bounded surfaces
- **WHEN** a screen requires grouping information or forms
- **THEN** it uses an Inset Grouped style card with subtle backgrounds and soft rounded corners (`rounded-2xl` equivalent)

#### Scenario: Actionable interface elements
- **WHEN** a user interacts with a primary button or control
- **THEN** the control utilizes the designated brand accent color (`pink-red`) but avoids excessive, rigid block decoration that contradicts the cohesive soft aesthetic
