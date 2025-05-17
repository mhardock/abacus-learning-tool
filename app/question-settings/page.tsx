"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { scenarioOptions } from "@/lib/formulas"
import { validateSettings, defaultSettings } from "@/lib/settings-utils"
import { QuestionSettings as FullQuestionSettings } from "@/lib/question-generator"

export default function QuestionSettingsPage() {
  const router = useRouter()
  const { settings: globalSettings, saveSettings } = useSettings()
  
  // Ensure globalSettings has the new fields, falling back to defaults from defaultSettings if not present
  const initialSettings = {
    ...defaultSettings, // Start with all defaults from settings-utils
    ...globalSettings // Override with any saved global settings
  };
  
  const [settings, setSettings] = useState<FullQuestionSettings>(validateSettings(initialSettings))
  const [tempInputs, setTempInputs] = useState({
    minNumbers: settings.minNumbers.toString(),
    maxNumbers: settings.maxNumbers.toString(),
    scenario: settings.scenario.toString(),
    weightingMultiplier: settings.weightingMultiplier.toString(),
    minOperandDigits: settings.minOperandDigits.toString(),
    maxOperandDigits: settings.maxOperandDigits.toString(),
  })
  const [generateNewToggle, setGenerateNewToggle] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleInputChange = (key: keyof typeof tempInputs, value: string) => {
    setTempInputs(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const validateAndApplySettings = (key: keyof FullQuestionSettings | keyof typeof tempInputs, value: string) => {
    // Convert to number and update tempInputs
    const updatedInputs = { ...tempInputs, [key as keyof typeof tempInputs]: value };
    setTempInputs(updatedInputs);
    
    // Use validateSettings to update settings
    const parsedSettings: Partial<FullQuestionSettings> = {
      minNumbers: parseInt(updatedInputs.minNumbers, 10),
      maxNumbers: parseInt(updatedInputs.maxNumbers, 10),
      scenario: parseInt(updatedInputs.scenario, 10),
      weightingMultiplier: parseInt(updatedInputs.weightingMultiplier, 10),
      minOperandDigits: parseInt(updatedInputs.minOperandDigits, 10),
      maxOperandDigits: parseInt(updatedInputs.maxOperandDigits, 10),
    };
    const valid = validateSettings(parsedSettings);
    setSettings(valid);
    
    // Sync tempInputs with clamped values
    setTempInputs({
      minNumbers: valid.minNumbers.toString(),
      maxNumbers: valid.maxNumbers.toString(),
      scenario: valid.scenario.toString(),
      weightingMultiplier: valid.weightingMultiplier.toString(),
      minOperandDigits: valid.minOperandDigits.toString(),
      maxOperandDigits: valid.maxOperandDigits.toString(),
    });
    setGenerateNewToggle(prev => !prev);
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    validateAndApplySettings("scenario", value);
  }

  const handleSave = () => {
    try {
      // Ensure all current temp inputs are validated and applied before saving
      const currentParsedSettings: Partial<FullQuestionSettings> = {
        minNumbers: parseInt(tempInputs.minNumbers, 10),
        maxNumbers: parseInt(tempInputs.maxNumbers, 10),
        scenario: parseInt(tempInputs.scenario, 10),
        weightingMultiplier: parseInt(tempInputs.weightingMultiplier, 10),
        minOperandDigits: parseInt(tempInputs.minOperandDigits, 10),
        maxOperandDigits: parseInt(tempInputs.maxOperandDigits, 10),
      };
      const validToSave = validateSettings(currentParsedSettings);
      setSettings(validToSave);

      saveSettings(validToSave)
      
      // Show success message
      setSaveMessage("Settings saved successfully!")
      
      // Clear success message after a few seconds and navigate
      setTimeout(() => {
        router.push('/') // Navigate to home page
      }, 500)
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
                          Formula Weighting
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Controls how often specially designated numbers within the selected formula are chosen. (1 = no weighting, 100 = max emphasis).
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </label>
                        <Input
                          id="weightingMultiplier"
                          type="number"
                          min="1"
                          max="100"
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

                  <div>
                    <h3 className="font-medium mb-4 mt-6">Number of Digits per Term</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="minOperandDigits" className="text-sm text-muted-foreground mb-2 block">
                          Minimum Digits
                        </label>
                        <Input
                          id="minOperandDigits"
                          type="number"
                          min="1"
                          max="5"
                          value={tempInputs.minOperandDigits}
                          onChange={(e) => handleInputChange("minOperandDigits", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("minOperandDigits", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("minOperandDigits", (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="maxOperandDigits" className="text-sm text-muted-foreground mb-2 block">
                          Maximum Digits
                        </label>
                        <Input
                          id="maxOperandDigits"
                          type="number"
                          min="1"
                          max="5"
                          value={tempInputs.maxOperandDigits}
                          onChange={(e) => handleInputChange("maxOperandDigits", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("maxOperandDigits", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("maxOperandDigits", (e.target as HTMLInputElement).value);
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
                    const fieldsToValidate: (keyof FullQuestionSettings)[] = ["minNumbers", "maxNumbers", "scenario", "weightingMultiplier", "minOperandDigits", "maxOperandDigits"];
                    let currentValidSettings = { ...settings };

                    fieldsToValidate.forEach(fieldKey => {
                        const tempVal = tempInputs[fieldKey as keyof typeof tempInputs];
                        const settingsForValidation = { ...currentValidSettings, [fieldKey]: parseInt(tempVal,10) };
                        currentValidSettings = validateSettings(settingsForValidation);
                        
                        setTempInputs(prev => ({...prev, [fieldKey]: currentValidSettings[fieldKey].toString()}));
                    });
                    setSettings(currentValidSettings);
                    handleSave();
                  }}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Question Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <QuestionDisplay
                  settings={settings}
                  generateNew={generateNewToggle}
                  onQuestionGenerated={() => { /* setPreviewAnswer(answer) */ }}
                  feedback={null}
                  feedbackType={null}
                />
                <Button onClick={generateNewQuestion}>
                  Generate New Preview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 