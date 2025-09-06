'use client';

import React from 'react';

/**
 * EditorTab represents the currently selected editor tool tab.
 */
export type EditorTab =
  | 'enhance'
  | 'crop'
  | 'type'
  | 'brush'
  | 'sticker';

interface EditorTabContextType {
  activeTab: EditorTab;
  setActiveTab: React.Dispatch<React.SetStateAction<EditorTab>>;
}

const EditorTabContext = React.createContext<EditorTabContextType | null>(null);

/**
 * Provides activeTab state for editor tabs.
 */
export function EditorTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<EditorTab>('enhance');
  return (
    <EditorTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </EditorTabContext.Provider>
  );
}

/**
 * Hook to read or update the active editor tab.
 */
export function useEditorTab() {
  const ctx = React.useContext(EditorTabContext);
  if (!ctx) throw new Error('useEditorTab must be used within <EditorTabProvider>');
  return ctx;
}
