import * as React from 'react';

declare global {
  namespace React {
    interface ReactElement<
      P = any,
      T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
    > {
      type: T;
      props: P;
      key: string | null;
    }
  }
}

declare module 'react-native' {
  interface ViewProps {
    children?: React.ReactNode;
    className?: string;
  }
  interface TextProps {
    children?: React.ReactNode;
    className?: string;
  }
  interface TouchableOpacityProps {
    children?: React.ReactNode;
    className?: string;
  }
  interface ScrollViewProps {
    children?: React.ReactNode;
    className?: string;
  }
}
