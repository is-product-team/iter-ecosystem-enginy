## ADDED Requirements

### Requirement: Reusable Mobile UI Component Library
The mobile frontend SHALL implement a robust, reusable component library conforming to Human Interface Guidelines styled principles.

#### Scenario: Implementing a generic button
- **WHEN** a developer requires a button inside a view
- **THEN** they MUST import and use `Button` from `components/ui/` instead of manually applying NativeWind classes to TouchableOpacity

#### Scenario: Implementing a text input field
- **WHEN** a developer requires a form field
- **THEN** they MUST import and use `TextInput` or `FormGroup` from `components/ui/` which provides standardized inset styling and label typography
