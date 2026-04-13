# Proposal: Fix Loading Experience

## Problem Statement
The current loading experience has two significant issues that degrade the perceived quality of the application:
1. **Mechanical Wobble**: The loading spinner rotates the entire SVG using `animate-spin`. Any slight misalignment in the SVG center causes a "wobbling" effect, making the UI feel unpolished.
2. **Navigation Dead Zones**: Navigating to unvisited pages (e.g., Profile, Manage Students) causes a multi-second delay where the UI remains on the previous page without any feedback. Users perceive this as the application being "frozen".

## Proposed Solution
1. **Refined Spinner**: Shift from "mechanical rotation" (rotating the whole container) to "optical rotation" (animating sequential opacity of static ticks). This is the industry-standard "Apple-style" spinner which is perfectly stable.
2. **Global Loading Transitions**: Implement Next.js `loading.tsx` at the root locale level. This ensures that any navigation that triggers a server-side data fetch will immediately show a loading state, providing instant feedback to the user.

## Impact
- Improved perceived performance and responsiveness.
- More professional and premium aesthetic consistency.
- Elimination of user confusion during slow navigation.
