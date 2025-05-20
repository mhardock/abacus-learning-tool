"use client"

import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import WorksheetGenerator from "@/components/worksheet-generator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getFormulaNameById } from "@/lib/formulas" // Assuming this can still be used for Add/Subtract scenarios
import { QuestionSettings, OperationType } from "@/lib/question-generator"; // Import OperationType

export default function CreateWorksheetsPage() {
  const { settings } = useSettings()

  // Helper function to render settings based on operation type
  const renderSettings = (settings: QuestionSettings) => {
    switch (settings.operationType) {
      case 'add_subtract':
        return (
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Operation:</span>
              <span className="text-[#5d4037] font-semibold">Addition/Subtraction</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Formula:</span>
              <span className="text-[#5d4037] font-semibold">{getFormulaNameById(settings.addSubScenario || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Min. Terms:</span>
              <span className="text-[#5d4037] font-semibold">{settings.minAddSubTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Max. Terms:</span>
              <span className="text-[#5d4037] font-semibold">{settings.maxAddSubTerms}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Min. Digits per Term:</span>
              <span className="text-[#5d4037] font-semibold">{settings.minAddSubTermDigits}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Max. Digits per Term:</span>
              <span className="text-[#5d4037] font-semibold">{settings.maxAddSubTermDigits}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Weighting Multiplier:</span>
              <span className="text-[#5d4037] font-semibold">{settings.addSubWeightingMultiplier}</span>
            </div>
          </CardContent>
        );
      case 'multiply':
        return (
          <CardContent className="space-y-2 text-sm">
             <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Operation:</span>
              <span className="text-[#5d4037] font-semibold">Multiplication</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Term 1 Digits:</span>
              <span className="text-[#5d4037] font-semibold">{settings.term1Digits}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Term 2 Digits:</span>
              <span className="text-[#5d4037] font-semibold">{settings.term2Digits}</span>
            </div>
             {/* Add other relevant multiplication settings if available */}
          </CardContent>
        );
      case 'divide':
         return (
          <CardContent className="space-y-2 text-sm">
             <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Operation:</span>
              <span className="text-[#5d4037] font-semibold">Division</span>
            </div>
             <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Division Type:</span>
              <span className="text-[#5d4037] font-semibold">{settings.divisionFormulaType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Divisor Digits:</span>
              <span className="text-[#5d4037] font-semibold">{settings.divisorDigits}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Dividend Digits Min:</span>
              <span className="text-[#5d4037] font-semibold">{settings.dividendDigitsMin}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Dividend Digits Max:</span>
              <span className="text-[#5d4037] font-semibold">{settings.dividendDigitsMax}</span>
            </div>
             {/* Add other relevant division settings if available */}
          </CardContent>
        );
      default:
        return (
           <CardContent className="space-y-2 text-sm">
             <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Operation:</span>
                <span className="text-[#5d4037] font-semibold">Unknown</span>
              </div>
              <p className="text-sm text-muted-foreground">No specific settings to display for this operation type.</p>
           </CardContent>
        );
    }
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
              {renderSettings(settings)} {/* Render settings based on operation type */}
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