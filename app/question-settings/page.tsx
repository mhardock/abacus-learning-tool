"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings, defaultSettings } from "@/components/settings-provider"
import WorksheetGenerator from "@/components/worksheet-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

export default function QuestionSettingsPage() {
  const router = useRouter()
  const { settings: globalSettings, saveSettings } = useSettings()
  const [settings, setSettings] = useState({
    minNumbers: globalSettings.minNumbers,
    maxNumbers: globalSettings.maxNumbers,
    scenario: globalSettings.scenario || 1,
    weightingMultiplier: globalSettings.weightingMultiplier || defaultSettings.weightingMultiplier
  })
  const [tempInputs, setTempInputs] = useState({
    minNumbers: globalSettings.minNumbers.toString(),
    maxNumbers: globalSettings.maxNumbers.toString(),
    scenario: (globalSettings.scenario || 1).toString(),
    weightingMultiplier: (globalSettings.weightingMultiplier || defaultSettings.weightingMultiplier).toString()
  })
  const [generateNewToggle, setGenerateNewToggle] = useState(false)
  const [previewAnswer, setPreviewAnswer] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("preview")

  // Define scenario options
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
  ]

  const handleInputChange = (key: keyof typeof tempInputs, value: string) => {
    setTempInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const validateAndApplySettings = (key: keyof typeof settings, value: string) => {
    // Convert to number and validate
    const numValue = parseInt(value, 10) || 0
    
    // Apply limits based on the field
    let validValue = numValue
    
    if (key === "minNumbers") {
      validValue = Math.max(1, Math.min(numValue, 50)) // Min between 1 and 50
      
      // If minNumbers changes, ensure maxNumbers is at least this value
      if (validValue > settings.maxNumbers) {
        setSettings(prev => ({
          ...prev,
          [key]: validValue,
          maxNumbers: validValue
        }))
        setTempInputs(prev => ({
          ...prev,
          [key]: validValue.toString(),
          maxNumbers: validValue.toString()
        }))
        return
      }
    } else if (key === "maxNumbers") {
      validValue = Math.max(settings.minNumbers, Math.min(numValue, 50)) // At least minNumbers, max 50
    } else if (key === "scenario") {
      validValue = Math.max(1, Math.min(numValue, 10)) // Between 1 and 10
    } else if (key === "weightingMultiplier") {
      validValue = Math.max(1, Math.min(numValue, 10)) // Multiplier between 1 and 10
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: validValue
    }))
    
    setTempInputs(prev => ({
      ...prev,
      [key]: validValue.toString()
    }))

    // Trigger preview update
    setGenerateNewToggle(prev => !prev)
  }

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    validateAndApplySettings("scenario", value);
  }

  const handleSave = () => {
    try {
      // Save settings using the global provider
      saveSettings(settings)
      
      // Show success message
      setSaveMessage("Settings saved successfully!")
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveMessage("Error saving settings. Please try again.")
      
      // Clear error message after a few seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    }
  }

  // Function to manually generate a new question
  const generateNewQuestion = () => {
    setGenerateNewToggle(prev => !prev)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f5f0e6] p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#5d4037]">Question Settings</h1>
          
          {saveMessage && (
            <div className="max-w-4xl mx-auto mb-6 p-3 bg-green-100 text-green-800 rounded-md text-center shadow-sm border border-green-200">
              <p className="font-medium">{saveMessage}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Customize Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-4">Number of Teams</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="minTeams" className="text-sm text-muted-foreground mb-2 block">
                          Minimum
                        </label>
                        <Input
                          id="minTeams"
                          type="number"
                          min="1"
                          max="10"
                          value={tempInputs.minNumbers}
                          onChange={(e) => handleInputChange("minNumbers", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("minNumbers", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("minNumbers", (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="maxTeams" className="text-sm text-muted-foreground mb-2 block">
                          Maximum
                        </label>
                        <Input
                          id="maxTeams"
                          type="number"
                          min="1"
                          max="100"
                          value={tempInputs.maxNumbers}
                          onChange={(e) => handleInputChange("maxNumbers", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("maxNumbers", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("maxNumbers", (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Formula Setting</h3>
                    <div className="grid grid-cols-2 gap-4 items-end">
                      <div>
                        <label htmlFor="scenario" className="text-sm text-muted-foreground mb-2 block">
                          Select Formula
                        </label>
                        <select
                          id="scenario"
                          value={tempInputs.scenario}
                          onChange={handleScenarioChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {scenarioOptions.map(option => (
                            <option key={option.value} value={option.value.toString()}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="weightingMultiplier" className="text-sm text-muted-foreground mb-2 block flex items-center">
                          Weighting Multiplier
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Increases how often specially designated numbers within the selected formula are chosen. (1 = no weighting, 10 = max emphasis).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </label>
                        <Input
                          id="weightingMultiplier"
                          type="number"
                          min="1"
                          max="10"
                          value={tempInputs.weightingMultiplier}
                          onChange={(e) => handleInputChange("weightingMultiplier", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("weightingMultiplier", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("weightingMultiplier", (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Back to Home
                  </Button>
                  <Button onClick={() => {
                    // Validate all fields before saving
                    validateAndApplySettings("minNumbers", tempInputs.minNumbers);
                    validateAndApplySettings("maxNumbers", tempInputs.maxNumbers);
                    validateAndApplySettings("scenario", tempInputs.scenario);
                    validateAndApplySettings("weightingMultiplier", tempInputs.weightingMultiplier);
                    handleSave();
                  }}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col">
              <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="preview">Preview Question</TabsTrigger>
                  <TabsTrigger value="worksheet">Generate Worksheet</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="flex flex-col items-center justify-center">
                  <QuestionDisplay
                    feedback={previewAnswer !== null ? `Answer: ${previewAnswer}` : null}
                    feedbackType="success"
                    generateNew={generateNewToggle}
                    onQuestionGenerated={(answer) => setPreviewAnswer(answer)}
                    settings={settings}
                  />
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={generateNewQuestion}
                  >
                    Generate New Example
                  </Button>
                </TabsContent>
                
                <TabsContent value="worksheet">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generate Practice Worksheet</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create a printable PDF worksheet with multiple practice questions using your current settings.
                      </p>
                      <WorksheetGenerator settings={settings} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 