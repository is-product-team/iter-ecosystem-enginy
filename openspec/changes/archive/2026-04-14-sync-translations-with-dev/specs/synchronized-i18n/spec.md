## ADDED Requirements

### Requirement: Segment-based Internationalization
The application must use `next-intl` to provide localized routes under a `[locale]` dynamic segment.

#### Scenario: Automatic Locale Detection
- **WHEN** a user visits the root path `/`
- **THEN** the middleware should detect the preferred locale (from cookie or headers) and redirect to `/[locale]/`

#### Scenario: Localized Routing
- **WHEN** a user visits `/ca/admin` or `/es/admin`
- **THEN** the application should render the appropriate localized content for each route.

### Requirement: English Route Naming
All route segments within the `[locale]` segment must use English names to align with the latest `dev` refactor.

#### Scenario: Accessing Center Dashboard
- **WHEN** a user is in the Catalan locale
- **THEN** the URL should be `/ca/center` (replacing the old `/ca/centro`)
