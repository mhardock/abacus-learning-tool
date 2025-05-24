"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { scenarioOptions, divisionFormulaLabels } from "@/lib/formulas";
import { QuestionSettings, OperationType } from "@/lib/question-types";
import { DivisionFormulaType, validDivisionFormulaTypes } from "@/lib/settings-utils";
import { generateEfficientValidRuleStrings } from "@/lib/multiplication-rules";
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
  
  
  // State for rule suggestions
  const [allPossibleRules, setAllPossibleRules] = useState<string[]>([]);
  const [filteredRules, setFilteredRules] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // State for rule input validation
  const [ruleWarningMessage, setRuleWarningMessage] = useState<string>("");
  
  // State for rule-digit mismatch validation
  const [ruleMismatchError, setRuleMismatchError] = useState<string>("");
  
  // Generate rules when term digits change
  useEffect(() => {
    if (settings.operationType === OperationType.MULTIPLY) {
      const term1Digits = parseInt(tempInputs.term1DigitsMultiply) || 1;
      const term2Digits = parseInt(tempInputs.term2DigitsMultiply) || 1;
      const rules = generateEfficientValidRuleStrings(term1Digits, term2Digits);
      setAllPossibleRules(rules);
      setFilteredRules(rules);
    }
  }, [tempInputs.term1DigitsMultiply, tempInputs.term2DigitsMultiply, settings.operationType]);
  
  // Filter rules based on input value with part-specific filtering
  useEffect(() => {
    if (!tempInputs.ruleString) {
      setFilteredRules(allPossibleRules);
    } else {
      // Strip all whitespace from user input first, then split by '+'
      const userParts = tempInputs.ruleString.replace(/\s/g, '').split('+');
      
      const filtered = allPossibleRules.filter(rule => {
        // Strip all whitespace from rule first, then split by '+'
        const ruleParts = rule.replace(/\s/g, '').split('+');
        
        // Check if user has typed more parts than the suggestion has
        if (userParts.length > ruleParts.length) {
          return false;
        }
        
        // Check each user input part against corresponding rule part
        for (let i = 0; i < userParts.length; i++) {
          const userPart = userParts[i];
          const rulePart = ruleParts[i];
          
          // If user part is empty (e.g., from "s+" input), don't filter on that part
          if (userPart === '') {
            continue;
          }
          
          // Check if rule part starts with user part (both lowercase for case-insensitive comparison)
          if (!rulePart.toLowerCase().startsWith(userPart.toLowerCase())) {
            return false;
          }
        }
        
        return true;
      });
      setFilteredRules(filtered);
    }
  }, [tempInputs.ruleString, allPossibleRules]);
  
  // Clear warning message when validation conditions change (not for input changes)
  useEffect(() => {
    if (ruleWarningMessage) {
      // Only clear warning when validation no longer applies
      const term1Digits = parseInt(tempInputs.term1DigitsMultiply) || 1;
      const term2Digits = parseInt(tempInputs.term2DigitsMultiply) || 1;
      const shouldValidate = term1Digits < 4 && term2Digits < 4;
      
      if (!shouldValidate) {
        setRuleWarningMessage("");
      }
    }
  }, [tempInputs.term1DigitsMultiply, tempInputs.term2DigitsMultiply, ruleWarningMessage]);
  
  // Function to check if current rule matches the term digits
  const validateRuleMatchesTermDigits = useCallback((): boolean => {
    if (settings.operationType !== OperationType.MULTIPLY || !tempInputs.ruleString.trim()) {
      return true; // No validation needed for non-multiply or empty rules
    }
    
    const term1Digits = parseInt(tempInputs.term1DigitsMultiply) || 1;
    const term2Digits = parseInt(tempInputs.term2DigitsMultiply) || 1;
    const currentRule = tempInputs.ruleString.replace(/\s/g, ''); // Strip whitespace
    
    // Generate valid rules for current term digits
    const validRules = generateEfficientValidRuleStrings(term1Digits, term2Digits);
    const validRulesStripped = validRules.map(rule => rule.replace(/\s/g, ''));
    
    // Check if current rule matches any valid rule
    return validRulesStripped.includes(currentRule.toLowerCase()) ||
           validRulesStripped.includes(currentRule);
  }, [settings.operationType, tempInputs.ruleString, tempInputs.term1DigitsMultiply, tempInputs.term2DigitsMultiply]);
  
  // Update rule mismatch error when term digits or rule changes
  useEffect(() => {
    if (settings.operationType === OperationType.MULTIPLY && tempInputs.ruleString.trim()) {
      const isValid = validateRuleMatchesTermDigits();
      if (!isValid) {
        setRuleMismatchError("Rule does not match Term Digits");
      } else {
        setRuleMismatchError("");
      }
    } else {
      setRuleMismatchError("");
    }
  }, [tempInputs.term1DigitsMultiply, tempInputs.term2DigitsMultiply, tempInputs.ruleString, settings.operationType, validateRuleMatchesTermDigits]);
  
  const internalHandleSave = () => {
    // Check for rule mismatch error before saving
    if (ruleMismatchError) {
      return; // Prevent saving when there's a mismatch error
    }
    
    const finalSettings = applyAndValidateAllTempInputs();
    
    // Strip whitespace from multiplication rule string before saving
    if (finalSettings.operationType === OperationType.MULTIPLY && finalSettings.ruleString) {
      finalSettings.ruleString = finalSettings.ruleString.replace(/\s/g, '');
    }
    
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
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("minAddSubTermDigits", e.target.value)}
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
            <>
              {/* Term Digit Inputs */}
              <div>
                <h3 className="font-medium mb-4">Multiplication Term Digits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="term1DigitsMultiply" className="text-sm text-muted-foreground mb-2 block">Term 1 Digits</label>
                    <Input
                      id="term1DigitsMultiply"
                      type="number"
                      min="1"
                      max="4"
                      value={tempInputs.term1DigitsMultiply}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("term1DigitsMultiply", e.target.value)}
                      onBlur={() => applyAndValidateAllTempInputs()}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                    />
                  </div>
                  <div>
                    <label htmlFor="term2DigitsMultiply" className="text-sm text-muted-foreground mb-2 block">Term 2 Digits</label>
                    <Input
                      id="term2DigitsMultiply"
                      type="number"
                      min="1"
                      max="4"
                      value={tempInputs.term2DigitsMultiply}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("term2DigitsMultiply", e.target.value)}
                      onBlur={() => applyAndValidateAllTempInputs()}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                    />
                  </div>
                </div>
              </div>

              {/* Rule Input with Dropdown */}
              <div className="relative">
                <label htmlFor="ruleString" className="text-sm text-muted-foreground mb-2 block font-medium flex items-center">
                  Multiplication Rules
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Define rules for multiplication problems. Use &apos;a&apos; for any digit, &apos;s&apos; for single-digit product, &apos;d&apos; for double-digit product, &apos;0&apos; for zero product. Separate rules for each digit of the second term with &apos;+&apos;. Example: &apos;s + d&apos; for 1-digit x 2-digit where first product is single-digit and second is double-digit.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {/* Warning message displayed inline with label */}
                  {ruleWarningMessage && (
                    <span className="text-red-600 text-sm ml-2">
                      {ruleWarningMessage}
                    </span>
                  )}
                </label>
                <Input
                  id="ruleString"
                  value={tempInputs.ruleString}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    const currentValue = tempInputs.ruleString;
                    
                    // Check if validation should apply (both term digits < 4)
                    const term1Digits = parseInt(tempInputs.term1DigitsMultiply) || 1;
                    const term2Digits = parseInt(tempInputs.term2DigitsMultiply) || 1;
                    const shouldValidate = term1Digits < 4 && term2Digits < 4;
                    
                    // If validation doesn't apply, allow all input and clear any warning
                    if (!shouldValidate) {
                      setRuleWarningMessage("");
                      handleInputChange("ruleString", newValue);
                      return;
                    }
                    
                    // If user is adding characters (typing)
                    if (newValue.length > currentValue.length) {
                      const addedChar = newValue.slice(currentValue.length);
                      
                      // If the added character is whitespace, always allow it
                      // Warning persists if the non-whitespace part was invalid
                      if (/\s/.test(addedChar)) {
                        handleInputChange("ruleString", newValue);
                        return;
                      }
                      
                      // Handle '+' character specifically
                      if (addedChar === '+') {
                        // Check if current input already ends with '+'
                        if (tempInputs.ruleString.trim().endsWith('+')) {
                          // Prevent sequential '+'
                          setRuleWarningMessage("Cannot add sequential '+'");
                          return;
                        }
                        
                        // Create stripped version of potential new value for validation
                        const potentialNewValue = newValue;
                        const strippedPotentialNewValue = potentialNewValue.replace(/\s/g, '');
                        
                        // Check if stripped potential new value forms a valid prefix
                        const isValidPrefixWithPlus = allPossibleRules.some(rule => {
                          const strippedRule = rule.replace(/\s/g, '');
                          return strippedRule.toLowerCase().startsWith(strippedPotentialNewValue.toLowerCase());
                        });
                        
                        if (isValidPrefixWithPlus) {
                          // Clear warning and allow input
                          setRuleWarningMessage("");
                          handleInputChange("ruleString", newValue);
                        } else {
                          // Prevent input and show warning
                          setRuleWarningMessage("Invalid rule input");
                        }
                        return;
                      }
                      
                      // For other non-whitespace characters, validate against possible rules
                      const potentialNewValue = newValue;
                      const strippedPotentialNewValue = potentialNewValue.replace(/\s/g, '');
                      
                      const isValidPrefix = allPossibleRules.some(rule => {
                        const strippedRule = rule.replace(/\s/g, '');
                        return strippedRule.toLowerCase().startsWith(strippedPotentialNewValue.toLowerCase());
                      });
                      
                      if (isValidPrefix) {
                        // Clear warning and allow input
                        setRuleWarningMessage("");
                        handleInputChange("ruleString", newValue);
                      } else {
                        // Prevent input and show warning
                        setRuleWarningMessage("Invalid rule input");
                      }
                      return;
                    }
                    
                    // For deletions or other operations, always allow and update input
                    handleInputChange("ruleString", newValue);
                    
                    // Check if the resulting input is valid to potentially clear warning
                    if (newValue.trim() === '') {
                      setRuleWarningMessage("");
                    } else {
                      const strippedNewValue = newValue.replace(/\s/g, '');
                      const isValidPrefix = allPossibleRules.some(rule => {
                        const strippedRule = rule.replace(/\s/g, '');
                        return strippedRule.toLowerCase().startsWith(strippedNewValue.toLowerCase());
                      });
                      
                      if (isValidPrefix) {
                        setRuleWarningMessage("");
                      }
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    // Delay hiding dropdown to allow click on dropdown items
                    setTimeout(() => setShowDropdown(false), 150);
                    applyAndValidateAllTempInputs();
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                  placeholder="Type rules or select from suggestions below"
                />
                
                {/* Dropdown with rule suggestions */}
                {showDropdown && filteredRules.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredRules.slice(0, 20).map((rule, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          handleInputChange("ruleString", rule);
                          setShowDropdown(false);
                          setRuleWarningMessage(""); // Clear warning when selecting from dropdown
                        }}
                      >
                        {rule}
                      </button>
                    ))}
                    {filteredRules.length > 20 && (
                      <div className="px-3 py-2 text-xs text-gray-500 text-center border-t">
                        Showing first 20 of {filteredRules.length} rules
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
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
            <div className="flex justify-between items-center pt-4">
              {/* Error message for rule mismatch */}
              {ruleMismatchError && (
                <span className="text-red-600 text-sm font-medium">
                  {ruleMismatchError}
                </span>
              )}
              {/* Spacer when no error */}
              {!ruleMismatchError && <div></div>}
              
              <div className="flex space-x-2">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button onClick={internalHandleSave} disabled={!!ruleMismatchError}>
                  Save Settings
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}