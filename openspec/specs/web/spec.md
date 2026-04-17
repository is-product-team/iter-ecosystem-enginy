# Specification: Frontend Web

The frontend is a Next.js 15 application using the App Router, React 19, and Tailwind CSS.

## Architecture

- **App Router (`/app`)**: Layouts, pages, and server components.
- **Components (`/components`)**: Reusable UI components (buttons, cards, forms).
- **Context (`/context`)**: React Context providers (Auth, Theme).
- **Services (`/services`)**: Client-side API fetching and data management.
- **Lib (`/lib`)**: Utility functions and shared helpers.

## Features

- **Admin Panel**: Management of centers, workshops, and allocations.
- **Client Interface**: Workshop requests and enrollment tracking.
- **Responsive Design**: Optimized for both desktop and tablet views.

## Requirements

### Requirement: i18n-First UI Development
The web application SHALL enforce an i18n-first approach for all UI components, requiring all user-facing text to be localizable from the point of creation.

#### Scenario: Developer adds a new UI component
- **WHEN** a new component is added to the `apps/web/components` directory
- **THEN** it MUST use the `useTranslations` hook for all its text elements and reference keys in the central locale JSON files.

### Requirement: Coordinator View Internationalization Compliance
All pages and sub-pages under the Coordinator role view (`/center/**`) MUST be fully internationalized, following the `web-i18n` specification. Hardcoded English text is strictly forbidden.

#### Scenario: Coordinator views assignments
- **WHEN** a coordinator navigates to the `/center/assignments` page
- **THEN** all UI text, including table headers, search placeholders, and empty state messages, MUST be translated.

#### Scenario: Coordinator requests a workshop
- **WHEN** a coordinator interacts with the workshop request form (`/center/requests`)
- **THEN** all informational text, labels, and feedback messages MUST be fully internationalized.

### Requirement: Standardized Data Presentation
The web application SHALL use the unified `DataTable` component for all tabular data presentation to ensure consistency across Admin and Coordinator views.

#### Scenario: Admin views workshop requests
- **WHEN** the user navigates to a list-based page (e.g., `/requests`)
- **THEN** the system MUST employ the `DataTable` component for rendering the list of entities.
