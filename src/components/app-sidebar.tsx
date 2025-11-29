'use client';

import {
  BrushIcon,
  CropIcon,
  LayersIcon,
  SlidersHorizontalIcon,
  SmileIcon,
  TypeIcon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from '~/components/ui/sidebar';
import { useActiveTab } from '~/hooks/use-active-tab';
import { EditorTab } from '~/store/editor.store';
import BrushTab from './editor-tabs/BrushTab';
import CropTab from './editor-tabs/CropTab';
import LayersTab from './editor-tabs/LayersTab';
import StickerTab from './editor-tabs/StickerTab';
import TypeTab from './editor-tabs/TypeTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ActiveWidgetSettings from './active-widget-settings';
import EnhanceTab from './editor-tabs/EnhanceTab';

export function AppSidebar() {
  const { activeTab, setActiveTab } = useActiveTab();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Tabs
              value={activeTab}
              onValueChange={(tab) => setActiveTab(tab as EditorTab)}
              className="scrollbar-hidden"
            >
              {/* Tab Bar */}
              <TabsList className="w-full">
                <TabsTrigger className="cursor-pointer" value="enhance">
                  <SlidersHorizontalIcon />
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="crop">
                  <CropIcon />
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="type">
                  <TypeIcon />
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="brush">
                  <BrushIcon />
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="sticker">
                  <SmileIcon />
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="layers">
                  <LayersIcon />
                </TabsTrigger>
              </TabsList>

              {/* Active Widget Settings */}
              <TabsContent value="active-widget">
                <ActiveWidgetSettings />
              </TabsContent>

              {/* Tab Content */}
              <TabsContent value="enhance">
                <EnhanceTab />
              </TabsContent>
              <TabsContent value="crop">
                <CropTab />
              </TabsContent>
              <TabsContent value="type">
                <TypeTab />
              </TabsContent>
              <TabsContent value="brush">
                <BrushTab />
              </TabsContent>
              <TabsContent value="sticker">
                <StickerTab />
              </TabsContent>
              <TabsContent value="layers">
                <LayersTab />
              </TabsContent>
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
