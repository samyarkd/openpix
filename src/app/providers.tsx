'use client';

import { PropsWithChildren } from 'react';
import { EditorTabProvider } from '~/components/editor-tab-context';
import { FiltersProvider } from '~/components/filters-context';
import { ThemeProvider } from '~/components/theme-provider';
import { SidebarProvider } from '~/components/ui/sidebar';

const Providers = (props: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <SidebarProvider>
        <FiltersProvider>
          <EditorTabProvider>{props.children}</EditorTabProvider>
        </FiltersProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Providers;
