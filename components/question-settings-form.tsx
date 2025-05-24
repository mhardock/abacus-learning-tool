"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { scenarioOptions, divisionFormulaLabels } from "@/lib/formulas";
import { QuestionSettings, OperationType } from "@/lib/question-types";
import { DivisionFormulaType, validDivisionFormulaTypes } from "@/lib/settings-utils";
import { useQuestionSettingsForm } from "@/hooks/useQuestionSettingsForm";

const operationTypeOptions: { value: OperationType; label: string }[] = [
  { value: OperationType.ADD_SUBTRACT, label: "Addition/Subtraction" },
  { value: OperationType.MULTIPLY, label: "Multiplication" },
  { value: OperationType.DIVIDE, label: "Division" },
];

interface QuestionSettingsFormProps {
  initialSettings: QuestionSettings;
  onSave: (settings: QuestionSettings) => void;
  onCancel?: () => void;
  showActionButtons?: boolean;
  onSettingsChange?: (newSettings: QuestionSettings) => void;
  saveMessage?: string | null;
}

export default function QuestionSettingsForm({
  initialSettings,
  onSave,
  onCancel,
  showActionButtons = true,
  onSettingsChange,
  saveMessage,
}: QuestionSettingsFormProps) {
  const { settings, tempInputs, handleInputChange, applyAndValidateAllTempInputs } = useQuestionSettingsForm(initialSettings, onSettingsChange);
  
  const internalHandleSave = () => {
    const finalSettings = applyAndValidateAllTempInputs();
    onSave(finalSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Settings</CardTitle>
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const newValue = e.target.value as OperationType;
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

        {/* Conditional Settings Sections based on 'settings.operationType' from the hook */}
        <div className="space-y-4">
          {settings.operationType === OperationType.ADD_SUBTRACT && (
            <>
              {/* Number of Terms */}
              <div>
                <h3 className="font-medium mb-4">Number of Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minAddSubTerms" className="text-sm text-muted-foreground mb-2 block">Minimum</label>
                    <Input id="minAddSubTerms" type="number" min="1" max="50" 
                           value={tempInputs.minAddSubTerms}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("minAddSubTerms", e.target.value)}
                           onBlur={() => applyAndValidateAllTempInputs()}
                           onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                  </div>
                  <div>
                    <label htmlFor="maxAddSubTerms" className="text-sm text-muted-foreground mb-2 block">Maximum</label>
                    <Input id="maxAddSubTerms" type="number" min="1" max="50" 
                           value={tempInputs.maxAddSubTerms}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("maxAddSubTerms", e.target.value)}
                           onBlur={() => applyAndValidateAllTempInputs()}
                           onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                  </div>
                </div>
              </div>
              {/* Formula Setting (Add/Subtract) */}
              <div>
                <h3 className="font-medium mb-4">Formula Setting (Add/Subtract)</h3>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label htmlFor="addSubScenario" className="text-sm text-muted-foreground mb-2 block">Select Formula</label>
                    <select id="addSubScenario" 
                            value={tempInputs.addSubScenario}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const newValue = e.target.value;
                                applyAndValidateAllTempInputs({ addSubScenario: newValue });
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {scenarioOptions.map((option: { value: number; label: string }) => (<option key={option.value} value={option.value.toString()}>{option.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="addSubWeightingMultiplier" className="text-sm text-muted-foreground mb-2 block flex items-center">
                      Formula Weighting
                      <TooltipProvider delayDuration={200}><Tooltip><TooltipTrigger asChild><HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p className="max-w-xs">Controls formula emphasis (1=none, 100=max).</p></TooltipContent></Tooltip></TooltipProvider>
                    </label>
                    <Input id="addSubWeightingMultiplier" type="number" min="1" max="100"
                           value={tempInputs.addSubWeightingMultiplier}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("addSubWeightingMultiplier", e.target.value)}
                           onBlur={() => applyAndValidateAllTempInputs()}
                           onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                  </div>
                </div>
              </div>
              {/* Number of Digits Per Term */}
              <div>
                <h3 className="font-medium mb-4 mt-6">Number of Digits Per Term</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minAddSubTermDigits" className="text-sm text-muted-foreground mb-2 block">Minimum Digits</label>
                    <Input id="minAddSubTermDigits" type="number" min="1" max="5" 
                           value={tempInputs.minAddSubTermDigits}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("minAddSubTerms", e.target.value)}
                           onBlur={() => applyAndValidateAllTempInputs()}
                           onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                  </div>
                  <div>
                    <label htmlFor="maxAddSubTermDigits" className="text-sm text-muted-foreground mb-2 block">Maximum Digits</label>
                    <Input id="maxAddSubTermDigits" type="number" min="1" max="5" 
                           value={tempInputs.maxAddSubTermDigits}
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("maxAddSubTermDigits", e.target.value)}
                           onBlur={() => applyAndValidateAllTempInputs()}
                           onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                  </div>
                </div>
              </div>
            </>
          )}


          {settings.operationType === OperationType.MULTIPLY && (
            <div>
              <label htmlFor="ruleString" className="text-sm text-muted-foreground mb-2 block font-medium flex items-center">
                Multiplication Rules
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Define rules for multiplication problems. Use 'a' for any digit, 's' for single-digit product, 'd' for double-digit product, '0' for zero product. Separate rules for each digit of the second term with '+'. Example: 's + d' for 1-digit x 2-digit where first product is single-digit and second is double-digit.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <Input
                id="ruleString"
                value={tempInputs.ruleString}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("ruleString", e.target.value)}
                onBlur={() => applyAndValidateAllTempInputs()}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
              />
            </div>
          )}

          {settings.operationType === OperationType.DIVIDE && (
            <>
              <div>
                <label htmlFor="divisionFormulaType" className="text-sm text-muted-foreground mb-2 block font-medium">Division Formula Type</label>
                <select id="divisionFormulaType" 
                        value={tempInputs.divisionFormulaType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const newValue = e.target.value as DivisionFormulaType;
                          applyAndValidateAllTempInputs({ divisionFormulaType: newValue });
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {validDivisionFormulaTypes.map((type: DivisionFormulaType) => (
                    <option key={type} value={type}>{divisionFormulaLabels[type] || type}</option>
                  ))}
                </select>
              </div>
              {/* Conditional inputs based on tempInputs.divisionFormulaType */}
              {tempInputs.divisionFormulaType === 'TYPE5_ANY_DIGITS' && (
                <div>
                  <h3 className="font-medium mb-4 mt-6">Division Digits (Type 5)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="divisorDigits" className="text-sm text-muted-foreground mb-2 block h-10">Divisor Digits</label>
                      <Input id="divisorDigits" type="number" min="1" 
                             max={Math.max(1, parseInt(tempInputs.dividendDigitsMin) - 1)}
                             value={tempInputs.divisorDigits}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("divisorDigits", e.target.value)}
                             onBlur={() => applyAndValidateAllTempInputs()}
                             onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                    </div>
                    <div>
                      <label htmlFor="dividendDigitsMin" className="text-sm text-muted-foreground mb-2 block">Min Dividend Digits</label>
                      <Input id="dividendDigitsMin" type="number" min="1" max="7"
                             value={tempInputs.dividendDigitsMin}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                               const newValue = e.target.value;
                               handleInputChange("dividendDigitsMin", newValue);
                               const newMinDividend = parseInt(newValue);
                               const currentDivisor = parseInt(tempInputs.divisorDigits);
                               if (!isNaN(newMinDividend) && !isNaN(currentDivisor)) {
                                 const maxDivisor = newMinDividend - 1;
                                 if (currentDivisor > maxDivisor && maxDivisor > 0) {
                                   handleInputChange("divisorDigits", maxDivisor.toString());
                                 } else if (maxDivisor <=0 && currentDivisor > 1) {
                                    handleInputChange("divisorDigits", "1");
                                  }
                               }
                             }}
                             onBlur={() => applyAndValidateAllTempInputs()}
                             onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                    </div>
                    <div>
                      <label htmlFor="dividendDigitsMax" className="text-sm text-muted-foreground mb-2 block">Max Dividend Digits</label>
                      <Input id="dividendDigitsMax" type="number" min="1" max="7"
                             value={tempInputs.dividendDigitsMax}
                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("dividendDigitsMax", e.target.value)}
                             onBlur={() => applyAndValidateAllTempInputs()}
                             onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {showActionButtons && (
          <>
            {saveMessage && (
              <div className={`p-2 rounded-md text-sm text-center mb-4 ${saveMessage.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {saveMessage}
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button onClick={internalHandleSave}>
                Save Settings
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}