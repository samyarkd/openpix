import {
  BrushIcon,
  CropIcon,
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
import BrushTab from './editor-tabs/BrushTab';
import CropTab from './editor-tabs/CropTab';
import EnhanceTab from './editor-tabs/EnhanceTab';
import StickerTab from './editor-tabs/StickerTab';
import TypeTab from './editor-tabs/TypeTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Tabs defaultValue="enhance" className="scrollbar-hidden">
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
              </TabsList>

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
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
