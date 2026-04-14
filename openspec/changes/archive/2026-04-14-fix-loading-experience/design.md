# Design: Fix Loading Experience

## Technical Solution

### 1. Spinner Refactoring (`Loading.tsx`)
We will replace the current rotation mechanism with a sequential opacity animation.

**Animation Definition:**
```css
@keyframes tick-fade {
  0% { opacity: 1; }
  100% { opacity: 0.15; }
}
```

**Implementation Strategy:**
- Each `<line>` (tick) will have `animation: tick-fade 1s linear infinite`.
- We will calculate a staggered `animation-delay` for each tick:
  - `delay = - (i / total_ticks)`
  - Using a negative delay ensures the animation starts mid-cycle and looks smooth immediately upon mounting.

### 2. Global Loading Strategy (`loading.tsx`)
By leveraging Next.js App Router's `loading.tsx` convention, we can create a `Suspense` boundary that covers the entire `[locale]` segment.

**File Structure:**
```
apps/web/app/[locale]/loading.tsx
```

**Component Code:**
```tsx
import Loading from '@/components/Loading';

export default function GlobalLoading() {
  return <Loading fullScreen message="Loading platform..." />;
}
```

## UI/UX Considerations
- **Blur Effect**: The `Loading` component already has `backdrop-blur-md`. This should be maintained in the `fullScreen` state to keep the context of the previous page visible but muted.
- **Timing**: The `loading.tsx` should trigger as soon as Next.js detects a navigation to an un-rendered route.
