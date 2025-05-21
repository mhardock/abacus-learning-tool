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
import { scenarioOptions, divisionFormulaLabels } from "@/lib/formulas"
import { validateSettings, defaultSettings, validDivisionFormulaTypes, DivisionFormulaType } from "@/lib/settings-utils"
import { QuestionSettings as FullQuestionSettings, OperationType } from "@/lib/question-types"

interface TempInputState {
  operationType: OperationType;

  minAddSubTerms: string;
  maxAddSubTerms: string;
  addSubScenario: string;
  addSubWeightingMultiplier: string;
  minAddSubTermDigits: string;
  maxAddSubTermDigits: string;

  term1Digits: string;
  term2Digits: string;

  divisionFormulaType: string; // Store as string, cast to DivisionFormulaType on use
  divisorDigits: string;
  dividendDigitsMin: string;
  dividendDigitsMax: string;
}

const convertSettingsToTempInputs = (currentSettings: FullQuestionSettings): TempInputState => {
  return {
    operationType: currentSettings.operationType,
    minAddSubTerms: (currentSettings.minAddSubTerms ?? defaultSettings.minAddSubTerms!).toString(),
    maxAddSubTerms: (currentSettings.maxAddSubTerms ?? defaultSettings.maxAddSubTerms!).toString(),
    addSubScenario: (currentSettings.addSubScenario ?? defaultSettings.addSubScenario!).toString(),
    addSubWeightingMultiplier: (currentSettings.addSubWeightingMultiplier ?? defaultSettings.addSubWeightingMultiplier!).toString(),
    minAddSubTermDigits: (currentSettings.minAddSubTermDigits ?? defaultSettings.minAddSubTermDigits!).toString(),
    maxAddSubTermDigits: (currentSettings.maxAddSubTermDigits ?? defaultSettings.maxAddSubTermDigits!).toString(),
    term1Digits: (currentSettings.term1Digits ?? defaultSettings.term1Digits!).toString(),
    term2Digits: (currentSettings.term2Digits ?? defaultSettings.term2Digits!).toString(),
    divisionFormulaType: (currentSettings.divisionFormulaType ?? defaultSettings.divisionFormulaType!).toString(),
    divisorDigits: (currentSettings.divisorDigits ?? defaultSettings.divisorDigits!).toString(),
    dividendDigitsMin: (currentSettings.dividendDigitsMin ?? defaultSettings.dividendDigitsMin!).toString(),
    dividendDigitsMax: (currentSettings.dividendDigitsMax ?? defaultSettings.dividendDigitsMax!).toString(),
  };
};

const operationTypeOptions: { value: OperationType; label: string }[] = [
  { value: "add_subtract", label: "Addition/Subtraction" },
  { value: "multiply", label: "Multiplication" },
  { value: "divide", label: "Division" },
];


export default function QuestionSettingsPage() {
  const router = useRouter()
  const { settings: globalSettings, saveSettings } = useSettings()
  
  const validatedInitialSettings = validateSettings({ ...defaultSettings, ...globalSettings });
  
  const [settings, setSettings] = useState<FullQuestionSettings>(validatedInitialSettings);
  const [tempInputs, setTempInputs] = useState<TempInputState>(convertSettingsToTempInputs(validatedInitialSettings));
  
  const [generateNewToggle, setGenerateNewToggle] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleInputChange = (key: keyof TempInputState, value: string) => {
    setTempInputs(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyAndValidateAllTempInputs = (changedOverride?: Partial<TempInputState>) => {
    // Use the override for the most current value if provided, otherwise use current tempInputs state
    const currentSourceOfTruth = { ...tempInputs, ...changedOverride };

    const parsedFromTemp: Partial<FullQuestionSettings> = {
      operationType: currentSourceOfTruth.operationType,
      minAddSubTerms: parseInt(currentSourceOfTruth.minAddSubTerms, 10),
      maxAddSubTerms: parseInt(currentSourceOfTruth.maxAddSubTerms, 10),
      addSubScenario: parseInt(currentSourceOfTruth.addSubScenario, 10),
      addSubWeightingMultiplier: parseInt(currentSourceOfTruth.addSubWeightingMultiplier, 10),
      minAddSubTermDigits: parseInt(currentSourceOfTruth.minAddSubTermDigits, 10),
      maxAddSubTermDigits: parseInt(currentSourceOfTruth.maxAddSubTermDigits, 10),
      term1Digits: parseInt(currentSourceOfTruth.term1Digits, 10),
      term2Digits: parseInt(currentSourceOfTruth.term2Digits, 10),
      divisionFormulaType: currentSourceOfTruth.divisionFormulaType as DivisionFormulaType,
      divisorDigits: parseInt(currentSourceOfTruth.divisorDigits, 10),
      dividendDigitsMin: parseInt(currentSourceOfTruth.dividendDigitsMin, 10),
      dividendDigitsMax: parseInt(currentSourceOfTruth.dividendDigitsMax, 10),
    };

    const validated = validateSettings(parsedFromTemp);
    setSettings(validated);
    setTempInputs(convertSettingsToTempInputs(validated)); // Sync tempInputs with the fully validated state
    setGenerateNewToggle(prev => !prev);
  };
  
  // NOTE: The useEffect hooks that previously listened to tempInputs.operationType
  // and tempInputs.divisionFormulaType have been removed.
  // The onChange handlers for the respective select elements now directly call
  // applyAndValidateAllTempInputs with the changed value.


  const handleSave = () => {
    try {
      applyAndValidateAllTempInputs(); // Ensure settings state is based on latest tempInputs
      // 'settings' state is now the single source of truth for saving
      saveSettings(settings);
      
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error saving settings. Please try again.");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const generateNewPreviewQuestion = () => {
    setGenerateNewToggle(prev => !prev);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f5f0e6] p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#5d4037]">Question Settings</h1>
          
          {saveMessage && (
            <div className={`max-w-4xl mx-auto mb-6 p-3 rounded-md text-center shadow-sm border ${saveMessage.includes("Error") ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}>
              <p className="font-medium">{saveMessage}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Customize Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Operation Type Selector */}
                <div>
                  <label htmlFor="operationType" className="text-sm text-muted-foreground mb-2 block font-medium">
                    Operation Type
                  </label>
                  <select
                    id="operationType"
                    value={tempInputs.operationType}
                    onChange={(e) => {
                      const newValue = e.target.value as OperationType;
                      handleInputChange("operationType", newValue);
                      applyAndValidateAllTempInputs({ operationType: newValue });
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {operationTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Settings Sections */}
                <div className="space-y-4">
                  {settings.operationType === 'add_subtract' && (
                    <>
                      <div>
                        <h3 className="font-medium mb-4">Number of Teams</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="minAddSubTerms" className="text-sm text-muted-foreground mb-2 block">Minimum</label>
                            <Input id="minAddSubTerms" type="number" min="1" max="50" value={tempInputs.minAddSubTerms}
                                   onChange={(e) => handleInputChange("minAddSubTerms", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                          <div>
                            <label htmlFor="maxAddSubTerms" className="text-sm text-muted-foreground mb-2 block">Maximum</label>
                            <Input id="maxAddSubTerms" type="number" min="1" max="50" value={tempInputs.maxAddSubTerms}
                                   onChange={(e) => handleInputChange("maxAddSubTerms", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-4">Formula Setting (Add/Subtract)</h3>
                        <div className="grid grid-cols-2 gap-4 items-end">
                          <div>
                            <label htmlFor="addSubScenario" className="text-sm text-muted-foreground mb-2 block">Select Formula</label>
                            <select id="addSubScenario" value={tempInputs.addSubScenario}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      handleInputChange("addSubScenario", newValue);
                                      applyAndValidateAllTempInputs({ addSubScenario: newValue });
                                    }}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                              {scenarioOptions.map(option => (<option key={option.value} value={option.value.toString()}>{option.label}</option>))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="addSubWeightingMultiplier" className="text-sm text-muted-foreground mb-2 block flex items-center">
                              Formula Weighting
                              <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p className="max-w-xs">Controls formula emphasis (1=none, 100=max).</p></TooltipContent></Tooltip></TooltipProvider>
                            </label>
                            <Input id="addSubWeightingMultiplier" type="number" min="1" max="100" value={tempInputs.addSubWeightingMultiplier}
                                   onChange={(e) => handleInputChange("addSubWeightingMultiplier", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium mb-4 mt-6">Number of Digits Per Team</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="minAddSubTermDigits" className="text-sm text-muted-foreground mb-2 block">Minimum Digits</label>
                            <Input id="minAddSubTermDigits" type="number" min="1" max="5" value={tempInputs.minAddSubTermDigits}
                                   onChange={(e) => handleInputChange("minAddSubTermDigits", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                          <div>
                            <label htmlFor="maxAddSubTermDigits" className="text-sm text-muted-foreground mb-2 block">Maximum Digits</label>
                            <Input id="maxAddSubTermDigits" type="number" min="1" max="5" value={tempInputs.maxAddSubTermDigits}
                                   onChange={(e) => handleInputChange("maxAddSubTermDigits", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {settings.operationType === 'multiply' && (
                    <>
                      <div>
                        <h3 className="font-medium mb-4">Number of Digits in Factors</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="term1Digits" className="text-sm text-muted-foreground mb-2 block">Digits in Term 1</label>
                            <Input id="term1Digits" type="number" min="1" max="7" value={tempInputs.term1Digits}
                                   onChange={(e) => handleInputChange("term1Digits", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                          <div>
                            <label htmlFor="term2Digits" className="text-sm text-muted-foreground mb-2 block">Digits in Term 2</label>
                            <Input id="term2Digits" type="number" min="1" max="7" value={tempInputs.term2Digits}
                                   onChange={(e) => handleInputChange("term2Digits", e.target.value)}
                                   onBlur={() => applyAndValidateAllTempInputs()}
                                   onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                          </div>
                        </div>
                      </div>
                      {/* Multiplication formula settings deferred */}
                    </>
                  )}

                  {settings.operationType === 'divide' && (
                    <>
                      <div>
                        <label htmlFor="divisionFormulaType" className="text-sm text-muted-foreground mb-2 block font-medium">Division Formula Type</label>
                        <select id="divisionFormulaType" value={tempInputs.divisionFormulaType}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  handleInputChange("divisionFormulaType", newValue);
                                  applyAndValidateAllTempInputs({ divisionFormulaType: newValue });
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {validDivisionFormulaTypes.map(type => (
                            <option key={type} value={type}>{divisionFormulaLabels[type] || type}</option>
                          ))}
                        </select>
                      </div>
                      {tempInputs.divisionFormulaType === 'TYPE5_ANY_DIGITS' && (
                        <div>
                          <h3 className="font-medium mb-4 mt-6">Division Digits (Type 5)</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="divisorDigits" className="text-sm text-muted-foreground mb-2 block h-10">Divisor Digits</label>
                              <Input id="divisorDigits" type="number" min="1" max={parseInt(tempInputs.dividendDigitsMin) - 1} value={tempInputs.divisorDigits}
                                     onChange={(e) => handleInputChange("divisorDigits", e.target.value)}
                                     onBlur={() => applyAndValidateAllTempInputs()}
                                     onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                            </div>
                            <div>
                              <label htmlFor="dividendDigitsMin" className="text-sm text-muted-foreground mb-2 block">Min Dividend Digits</label>
                              <Input id="dividendDigitsMin" type="number" min="1" max="7" value={tempInputs.dividendDigitsMin}
                                     onChange={(e) => {
                                       const newValue = e.target.value;
                                       handleInputChange("dividendDigitsMin", newValue);
                                       
                                       // If the divisorDigits value becomes invalid due to the new min dividend digits,
                                       // adjust the divisorDigits value to be valid
                                       const maxDivisorDigits = parseInt(newValue) - 1;
                                       const currentDivisorDigits = parseInt(tempInputs.divisorDigits);
                                       if (currentDivisorDigits > maxDivisorDigits && maxDivisorDigits > 0) {
                                         handleInputChange("divisorDigits", maxDivisorDigits.toString());
                                       }
                                     }}
                                     onBlur={() => applyAndValidateAllTempInputs()}
                                     onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                            </div>
                            <div>
                              <label htmlFor="dividendDigitsMax" className="text-sm text-muted-foreground mb-2 block">Max Dividend Digits</label>
                              <Input id="dividendDigitsMax" type="number" min="1" max="7" value={tempInputs.dividendDigitsMax}
                                     onChange={(e) => handleInputChange("dividendDigitsMax", e.target.value)}
                                     onBlur={() => applyAndValidateAllTempInputs()}
                                     onKeyDown={(e) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Back to Home
                  </Button>
                  <Button onClick={handleSave}>
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
                  settings={settings} // Pass the main 'settings' state here
                  generateNew={generateNewToggle}
                  onQuestionGenerated={() => { /* Logic for when a question is generated if needed */ }}
                  feedback={null} // Assuming feedback is handled elsewhere or not relevant for preview
                  feedbackType={null}
                />
                <Button onClick={generateNewPreviewQuestion}>
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