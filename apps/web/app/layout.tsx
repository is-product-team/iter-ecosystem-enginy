import { ReactNode } from 'react';

// This is the root layout required by Next.js.
// Since all our content is within the `[locale]` dynamic segment,
// this layout just passes the children through to the localized layout.

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
