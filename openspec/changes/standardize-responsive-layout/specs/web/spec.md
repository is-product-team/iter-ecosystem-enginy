## ADDED Requirements

### Requirement: Uniform Page Layout
All internal pages in the web frontend SHALL follow the same responsive container pattern, ensuring consistent horizontal alignment across all modules.

#### Scenario: Alignment consistency
- **WHEN** navigating from a data-heavy page (like Reports) to a detail page (like Profile)
- **THEN** the main content must remain consistently aligned with the `DashboardLayout`'s `container-responsive` margins.

### Requirement: Removal of Component-Level Width Constraints
Individual page components SHALL NOT use `max-w-*` classes to constrain their top-level container width, except for internal elements that specifically require fixed widths.

#### Scenario: Full-width support
- **WHEN** the browser window is resized up to the 1440px limit
- **THEN** all pages MUST use the full width allowed by the `DashboardLayout`'s container.
