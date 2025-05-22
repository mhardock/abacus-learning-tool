"use client"

import { Book, Calculator, GraduationCap, Home, Settings, Sliders, ChevronDown, ChevronUp } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useSettings } from "@/components/settings-provider"
import { useSidebarState } from "@/components/sidebar-state-provider"
import { OperationType } from "@/lib/question-types"

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
const addSubtractPresets = [
  { id: 1, name: "Simple 1-4" },
  { id: 2, name: "Simple 1-5" },
  { id: 3, name: "Simple 1-9" },
  { id: 4, name: "Friends +" },
  { id: 5, name: "Friends +/-" },
  { id: 6, name: "Relatives +" },
  { id: 7, name: "Relatives +/-" },
  { id: 8, name: "Mix +" },
  { id: 9, name: "Mix +/-" },
];

const multiplyPresets = [
  { id: 11, name: "Single Digit" },
];

const dividePresets = [
  { id: 'TYPE1_CAT_GT_MICE1_2D', name: "2d/1d C > M" },
  { id: 'TYPE2_CAT_GT_MICE1_3D', name: "3d/1d C > M" },
  { id: 'TYPE3_CAT_EQ_MICE1_2OR3D', name: "2,3d/1d C = M" },
  { id: 'TYPE4_CAT_LT_MICE1_2D', name: "2d/1d C < M" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { settings: currentGlobalSettings, saveSettings } = useSettings();
  const [activePreset, setActivePreset] = useState<number | string | null>(null);
  const {
    isAddSubtractExpanded,
    setIsAddSubtractExpanded,
    isMultiplyExpanded,
    setIsMultiplyExpanded,
    isDivideExpanded,
    setIsDivideExpanded,
  } = useSidebarState();

  const handlePresetClick = (presetId: number | string, operationType: OperationType) => {
    setActivePreset(presetId);
    
    const presetConfigurations: {
      operationType: OperationType;
      addSubScenario?: number;
      term1Digits?: number;
      term2Digits?: number;
      divisionFormulaType?: string;
    } = {
      operationType: operationType,
    };

    if (operationType === 'add_subtract') {
      presetConfigurations.addSubScenario = presetId as number;
    } else if (operationType === 'multiply') {
      presetConfigurations.term1Digits = 1;
      presetConfigurations.term2Digits = 1;
    } else if (operationType === 'divide') {
      presetConfigurations.divisionFormulaType = presetId as string;
    }
    
    const newSettingsForPreset = {
      ...currentGlobalSettings,
      ...presetConfigurations,
    };
    
    saveSettings(newSettingsForPreset);
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
          <SidebarGroupLabel className="font-bold text-sidebar-foreground">Navigation</SidebarGroupLabel>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/create-digital-worksheet" && activePreset === null}>
                  <Link href="/create-digital-worksheet" onClick={handleNavigationClick}>
                    <Book className="h-4 w-4" />
                    <span>Create Digital Worksheet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-bold text-sidebar-foreground">Practice</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarGroup>
              <SidebarGroupLabel
                className="font-bold text-sidebar-foreground cursor-pointer flex justify-between items-center"
                onClick={() => setIsAddSubtractExpanded(!isAddSubtractExpanded)}
              >
                Addition/Subtraction
                {isAddSubtractExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </SidebarGroupLabel>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAddSubtractExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <SidebarMenu>
                  {addSubtractPresets.map((preset) => (
                    <SidebarMenuItem key={preset.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={activePreset === preset.id && pathname === "/"}
                      >
                        <Link href="/" onClick={() => handlePresetClick(preset.id, 'add_subtract')}>
                          <Calculator className="h-4 w-4" />
                          <span>{preset.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel
                className="font-bold text-sidebar-foreground cursor-pointer flex justify-between items-center"
                onClick={() => setIsMultiplyExpanded(!isMultiplyExpanded)}
              >
                Multiplication
                {isMultiplyExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </SidebarGroupLabel>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMultiplyExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <SidebarMenu>
                  {multiplyPresets.map((preset) => (
                    <SidebarMenuItem key={preset.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={activePreset === preset.id && pathname === "/"}
                      >
                        <Link href="/" onClick={() => handlePresetClick(preset.id, 'multiply')}>
                          <Calculator className="h-4 w-4" />
                          <span>{preset.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel
                className="font-bold text-sidebar-foreground cursor-pointer flex justify-between items-center"
                onClick={() => setIsDivideExpanded(!isDivideExpanded)}
              >
                Division
                {isDivideExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </SidebarGroupLabel>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDivideExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <SidebarMenu>
                  {dividePresets.map((preset) => (
                    <SidebarMenuItem key={preset.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={activePreset === preset.id && pathname === "/"}
                      >
                        <Link href="/" onClick={() => handlePresetClick(preset.id, 'divide')}>
                          <Calculator className="h-4 w-4" />
                          <span>{preset.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarGroup>
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
