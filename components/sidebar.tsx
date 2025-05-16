"use client"

import { Book, Calculator, GraduationCap, Home, Settings, Sliders } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useSettings } from "@/components/settings-provider"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Define formulas for presets
const formulaPresets = [
  { id: 1, name: "Simple 1-4" },
  { id: 2, name: "Simple 1-5" },
  { id: 3, name: "Simple 1-9" },
  { id: 4, name: "Friends +" },
  { id: 5, name: "Friends +/-" },
  { id: 6, name: "Relatives +" },
  { id: 7, name: "Relatives +/-" },
  { id: 8, name: "Mix +" },
  { id: 9, name: "Mix +/-" },
  { id: 10, name: "All Formulas" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { settings: currentGlobalSettings, saveSettings } = useSettings();
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const handlePresetClick = (formulaId: number) => {
    setActivePreset(formulaId);
    saveSettings({
      minNumbers: currentGlobalSettings.minNumbers,
      maxNumbers: currentGlobalSettings.maxNumbers,
      weightingMultiplier: currentGlobalSettings.weightingMultiplier,
      scenario: formulaId,
    });
    // Navigation to "/" is handled by the Link component
  };

  const handleNavigationClick = () => {
    setActivePreset(null);
  };
  
  return (
    <Sidebar variant="floating" className="border-r border-[#8d6e63]/20">
      <SidebarHeader className="pb-0">
        <div className="flex items-center px-2 py-3">
          <Calculator className="mr-2 h-6 w-6 text-[#8d6e63]" />
          <span className="font-medium text-lg text-[#5d4037]">Soroban</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/" && activePreset === null}>
                  <Link href="/" onClick={handleNavigationClick}>
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/question-settings" && activePreset === null}>
                  <Link href="/question-settings" onClick={handleNavigationClick}>
                    <Sliders className="h-4 w-4" />
                    <span>Question Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/worksheet-generator" && activePreset === null}>
                  <Link href="/worksheet-generator" onClick={handleNavigationClick}>
                    <Book className="h-4 w-4" />
                    <span>Create Worksheets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Practice</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {formulaPresets.map((preset) => (
                <SidebarMenuItem key={preset.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activePreset === preset.id && pathname === "/"}
                  >
                    <Link href="/" onClick={() => handlePresetClick(preset.id)}>
                      <Calculator className="h-4 w-4" />
                      <span>{preset.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#">
                <GraduationCap className="h-4 w-4" />
                <span>About</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
