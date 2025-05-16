"use client"

import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import WorksheetGenerator from "@/components/worksheet-generator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Copied from question-settings/page.tsx for formula name lookup
const scenarioOptions = [
  { value: 1, label: "Simple 1-4" },
  { value: 2, label: "Simple 1-5" },
  { value: 3, label: "Simple 1-9" },
  { value: 4, label: "Friends +" },
  { value: 5, label: "Friends +/-" },
  { value: 6, label: "Relatives +" },
  { value: 7, label: "Relatives +/-" },
  { value: 8, label: "Mix +" },
  { value: 9, label: "Mix +/-" },
  { value: 10, label: "All Formulas" }
];

export default function CreateWorksheetsPage() {
  const { settings } = useSettings()

  const getFormulaName = (scenarioId: number) => {
    const option = scenarioOptions.find(opt => opt.value === scenarioId);
    return option ? option.label : `Scenario ${scenarioId}`;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f5f0e6] p-8">
          <h1 className="text-2xl font-bold mb-8 text-center text-[#5d4037]">
            Create Worksheets
          </h1>
          
          {/* Flex container for side-by-side layout on medium screens and up */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            
            {/* Current Settings Display Box - Left Column */}
            <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0"> {/* Adjusted width and removed margin classes */}
              <CardHeader>
                <CardTitle className="text-lg">Current Worksheet Settings</CardTitle>
                <CardDescription>
                  These are the active question generation settings that will be used for new worksheets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Formula:</span>
                  <span className="text-[#5d4037] font-semibold">{getFormulaName(settings.scenario)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Min. Terms per Problem:</span>
                  <span className="text-[#5d4037] font-semibold">{settings.minNumbers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Max. Terms per Problem:</span>
                  <span className="text-[#5d4037] font-semibold">{settings.maxNumbers}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Weighting Multiplier:</span>
                  <span className="text-[#5d4037] font-semibold">{settings.weightingMultiplier}</span>
                </div>
              </CardContent>
            </Card>

            <div className="w-full md:w-2/3 lg:w-3/4">
              <Card>
                <CardHeader>
                  <CardTitle>Worksheet Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorksheetGenerator settings={settings} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 