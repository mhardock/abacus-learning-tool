"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"

export default function QuestionSettingsPage() {
  const router = useRouter()
  const { settings: globalSettings, saveSettings } = useSettings()
  const [settings, setSettings] = useState({
    minNumbers: globalSettings.minNumbers,
    maxNumbers: globalSettings.maxNumbers,
    minValue: globalSettings.minValue,
    maxValue: globalSettings.maxValue
  })
  const [tempInputs, setTempInputs] = useState({
    minNumbers: globalSettings.minNumbers.toString(),
    maxNumbers: globalSettings.maxNumbers.toString(),
    minValue: globalSettings.minValue.toString(),
    maxValue: globalSettings.maxValue.toString()
  })
  const [generateNewToggle, setGenerateNewToggle] = useState(false)
  const [previewAnswer, setPreviewAnswer] = useState<number | null>(null)
  const [applySettingsTimer, setApplySettingsTimer] = useState<NodeJS.Timeout | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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
      validValue = Math.max(1, Math.min(numValue, 10)) // Min between 1 and 10
      
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
      validValue = Math.max(settings.minNumbers, Math.min(numValue, 100)) // At least minNumbers, max 100
    } else if (key === "minValue") {
      validValue = Math.max(1, Math.min(numValue, settings.maxValue)) // At least 1, max is maxValue
      
      // If minValue changes, ensure maxValue is at least this value
      if (validValue > settings.maxValue) {
        setSettings(prev => ({
          ...prev,
          [key]: validValue,
          maxValue: validValue
        }))
        setTempInputs(prev => ({
          ...prev,
          [key]: validValue.toString(),
          maxValue: validValue.toString()
        }))
        return
      }
    } else if (key === "maxValue") {
      validValue = Math.max(settings.minValue, Math.min(numValue, 1000000)) // At least minValue, max 1000000
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

  const handleSave = () => {
    try {
      // Save settings using the global provider
      saveSettings(settings)
      
      // Show success message
      setSaveMessage("Settings saved successfully!")
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveMessage("Error saving settings. Please try again.")
    }
  }

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      if (applySettingsTimer) {
        clearTimeout(applySettingsTimer)
      }
    }
  }, [applySettingsTimer])

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
            <div className="max-w-4xl mx-auto mb-4 p-2 bg-green-100 text-green-800 rounded text-center">
              {saveMessage}
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
                    <h3 className="font-medium mb-4">Number Range</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="minValue" className="text-sm text-muted-foreground mb-2 block">
                          Minimum
                        </label>
                        <Input
                          id="minValue"
                          type="number"
                          min="1"
                          value={tempInputs.minValue}
                          onChange={(e) => handleInputChange("minValue", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("minValue", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("minValue", (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="maxValue" className="text-sm text-muted-foreground mb-2 block">
                          Maximum
                        </label>
                        <Input
                          id="maxValue"
                          type="number"
                          min="1"
                          max="1000000"
                          value={tempInputs.maxValue}
                          onChange={(e) => handleInputChange("maxValue", e.target.value)}
                          onBlur={(e) => validateAndApplySettings("maxValue", e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              validateAndApplySettings("maxValue", (e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Validate all fields before saving
                    validateAndApplySettings("minNumbers", tempInputs.minNumbers);
                    validateAndApplySettings("maxNumbers", tempInputs.maxNumbers);
                    validateAndApplySettings("minValue", tempInputs.minValue);
                    validateAndApplySettings("maxValue", tempInputs.maxValue);
                    handleSave();
                  }}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-xl font-medium mb-4 text-[#5d4037]">Preview Question</h2>
              <QuestionDisplay
                feedback={previewAnswer ? `Answer: ${previewAnswer}` : null}
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 