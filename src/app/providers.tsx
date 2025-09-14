'use client';

import { PropsWithChildren } from 'react';
import { ThemeProvider } from '~/components/theme-provider';
import { SidebarProvider } from '~/components/ui/sidebar';

const Providers = (props: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <SidebarProvider>{props.children}</SidebarProvider>
    </ThemeProvider>
  );
};

export default Providers;
