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
import { generateEfficientValidRuleStrings, parseRules } from "@/lib/multiplication-rules";
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

  // Converts a UI slider value (1-10) to a speech synthesis rate (0.25-2.5)
  const uiToActualRate = (uiRate: number) => {
    return uiRate * 0.2;
  };

  // Converts a speech synthesis rate back to a UI slider value (1-10)
  const actualToUiRate = (actualRate: number) => {
    // Round to handle potential floating point inaccuracies
    return Math.round(actualRate / 0.2);
  };


  // State for rule suggestions
  const [allPossibleRules, setAllPossibleRules] = useState<string[]>([]);
  const [filteredRules, setFilteredRules] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length === 0) {
        return;
      }
      setVoices(availableVoices);

      const currentVoiceURI = tempInputs.speechVoiceURI;
      const isCurrentVoiceAvailable = availableVoices.some(voice => voice.voiceURI === currentVoiceURI);

      if (!currentVoiceURI || !isCurrentVoiceAvailable) {
        applyAndValidateAllTempInputs({ speechVoiceURI: availableVoices[0].voiceURI });
      }
    };

    // The voices may not be loaded immediately.
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = getVoices;
    } else {
        getVoices();
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [applyAndValidateAllTempInputs, tempInputs.speechVoiceURI]);

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

    // If rule is empty after stripping whitespace but digits are set, consider invalid
    if (!currentRule && term1Digits > 0 && term2Digits > 0) {
      return false;
    }

    // Split rule by '+' to get parts
    const ruleParts = currentRule.split('+');

    // Validation Check 1: Number of parts must match term2Digits
    if (ruleParts.length !== term2Digits) {
      return false;
    }

    // Validation Check 2: Each part must have correct length and valid characters
    const validChars = ['a', 's', 'd', '0'];
    for (const part of ruleParts) {
      // Check part length matches term1Digits
      if (part.length !== term1Digits) {
        return false;
      }

      // Check each character is valid
      for (const char of part) {
        if (!validChars.includes(char.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
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
    // This check uses validateRuleMatchesTermDigits for live structural validation
    if (ruleMismatchError) {
      return; // Prevent saving if structural error exists
    }

    const finalSettings = applyAndValidateAllTempInputs();

    // Additional semantic validation using parseRules for MULTIPLY operation on save
    if (finalSettings.operationType === OperationType.MULTIPLY && finalSettings.ruleString) {
      const strippedRuleString = finalSettings.ruleString.replace(/\s/g, '');
      // Update finalSettings with the stripped rule for consistency if saved
      finalSettings.ruleString = strippedRuleString;

      if (strippedRuleString) { // Only attempt to parse if there's a non-empty rule after stripping
        const parsedResult = parseRules(strippedRuleString);

        if (parsedResult === null) {
          // parseRules returned null, indicating an invalid rule
          setRuleMismatchError("Rule is invalid or does not conform to expected structure.");
          return; // Prevent saving
        }
        // If parsedResult is not null, rule is valid by parseRules.
        // ruleMismatchError should be clear if structural validation passed.
      }
      // If strippedRuleString is empty, validateRuleMatchesTermDigits (live validation)
      // should have already caught this if a rule was expected, set ruleMismatchError,
      // and blocked the save via the initial 'if (ruleMismatchError)' check.
      // So, no explicit 'else' for empty strippedRuleString is needed here.
    }

    // If all validations pass, proceed to save
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
              const updates: Partial<typeof tempInputs> = { operationType: newValue };
              if (newValue === OperationType.MULTIPLY || newValue === OperationType.DIVIDE) {
                updates.speechIsEnabled = 'false';
              }
              applyAndValidateAllTempInputs(updates);
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

        {/* Abacus Display Settings */}
        <div>
          <label htmlFor="numberOfAbacusColumns" className="text-sm text-muted-foreground mb-2 block font-medium flex items-center">
            Number of Abacus Columns
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Sets the number of columns displayed on the abacus. Must be an odd number between 5 and 13.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <select
            id="numberOfAbacusColumns"
            value={tempInputs.numberOfAbacusColumns}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const newValue = e.target.value;
              applyAndValidateAllTempInputs({ numberOfAbacusColumns: newValue });
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {[5, 7, 9, 11, 13].map(num => (
              <option key={num} value={num.toString()}>
                {num} columns
              </option>
            ))}
          </select>
        </div>

        {/* Image Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isImage"
            checked={tempInputs.isImage === 'true'}
            onChange={(e) => {
              const newValue = e.target.checked.toString();
              applyAndValidateAllTempInputs({ isImage: newValue });
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label
            htmlFor="isImage"
            className="text-sm font-medium"
          >
            Image
          </label>
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

              {/* Speech Settings */}
              <div>
                <h3 className="font-medium mb-4 mt-6">Listening Settings</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="speechIsEnabled"
                    checked={tempInputs.speechIsEnabled === 'true'}
                    onChange={(e) => {
                      applyAndValidateAllTempInputs({ speechIsEnabled: e.target.checked.toString() });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="speechIsEnabled"
                    className="text-sm font-medium"
                  >
                    Listening
                  </label>
                </div>

                {tempInputs.speechIsEnabled === 'true' && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="speechVoiceURI" className="block text-sm font-medium text-gray-700">Voice</label>
                      <select
                        id="speechVoiceURI"
                        value={tempInputs.speechVoiceURI || ''}
                        onChange={(e) => {
                          applyAndValidateAllTempInputs({ speechVoiceURI: e.target.value });
                        }}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        {voices.map((voice) => (
                          <option key={voice.name} value={voice.voiceURI}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="speechRate" className="block text-sm font-medium text-gray-700">
                        Speed: {actualToUiRate(parseFloat(tempInputs.speechRate) || 1)}
                      </label>
                      <input
                        id="speechRate"
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={actualToUiRate(parseFloat(tempInputs.speechRate) || 1)}
                        onChange={(e) => {
                            const uiRate = parseInt(e.target.value, 10);
                            const actualRate = uiToActualRate(uiRate);
                            handleInputChange("speechRate", actualRate.toString());
                        }}
                        onMouseUp={() => applyAndValidateAllTempInputs()}
                        onTouchEnd={() => applyAndValidateAllTempInputs()}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}


          {settings.operationType === OperationType.MULTIPLY && (
            <>
              {/* Term Digit Inputs */}
              {!settings.isTimesTableMode && (<>
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
              </>)}
              {/* Rule String Input */}
              {!settings.isTimesTableMode && (
              <div className="relative">
                <label htmlFor="ruleString" className="text-sm text-muted-foreground mb-2 block font-medium flex items-center">
                  Rule String
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Define multiplication rules using &amp;apos;a&amp;apos; (add), &amp;apos;s&amp;apos; (subtract), &amp;apos;d&amp;apos; (direct), and &amp;apos;0&amp;apos; (zero).
                          Each part of the rule corresponds to a digit in Term 2, and its length must match Term 1&amp;apos;s digits.
                          Example: For 2-digit x 2-digit, a rule could be &amp;apos;as+d0&amp;apos;.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <Input
                  id="ruleString"
                  type="text"
                  value={tempInputs.ruleString}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    handleInputChange("ruleString", newValue);

                    // Basic structural check for '+' to manage dropdown visibility
                    if (newValue.endsWith('+')) {
                      setShowDropdown(true);
                    } else {
                      // More complex logic to decide if dropdown should be shown
                      // This could be based on whether the current input is a valid prefix of any rule
                      const isPrefix = allPossibleRules.some(rule => rule.startsWith(newValue));
                      setShowDropdown(isPrefix && newValue.length > 0);
                    }
                  }}
                  onFocus={() => {
                    // Show dropdown if there's text and it's a valid prefix
                    if (tempInputs.ruleString) {
                      const isPrefix = allPossibleRules.some(rule => rule.startsWith(tempInputs.ruleString));
                      setShowDropdown(isPrefix);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding to allow click on dropdown
                    setTimeout(() => {
                      setShowDropdown(false);
                      applyAndValidateAllTempInputs();
                    }, 150);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      applyAndValidateAllTempInputs();
                      setShowDropdown(false); // Hide dropdown on Enter
                    }
                  }}
                  className="pr-10"
                  autoComplete="off"
                />
                {showDropdown && filteredRules.length > 0 && (
                  <div className="absolute z-10 w-full bg-background border border-input rounded-md shadow-lg mt-1">
                    <ul className="max-h-60 overflow-auto">
                      {filteredRules.slice(0, 20).map((rule, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 cursor-pointer hover:bg-accent"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleInputChange("ruleString", rule);
                            setShowDropdown(false);
                            applyAndValidateAllTempInputs({ ruleString: rule });
                          }}
                        >
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ruleMismatchError && (
                  <p className="text-red-500 text-xs mt-1">{ruleMismatchError}</p>
                )}
                {ruleWarningMessage && (
                  <p className="text-yellow-500 text-xs mt-1">{ruleWarningMessage}</p>
                )}
              </div>
              )}
              {/* Times Table Mode Toggle */}
              <div>
                <h3 className="font-medium mb-4">Times Table Mode</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isTimesTableMode"
                    checked={tempInputs.isTimesTableMode === 'true'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const isChecked = e.target.checked;
                      applyAndValidateAllTempInputs({ isTimesTableMode: isChecked.toString() });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isTimesTableMode" className="text-sm font-medium">
                    Enable Times Table Mode
                  </label>
                </div>
              </div>

              {/* Times Table Term Ranges */}
              {settings.isTimesTableMode && (
                <div>
                  <h3 className="font-medium mb-4">Times Table Term Ranges</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Term 1 Range */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Term 1 Range</label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="timesTableTerm1Min"
                          type="number"
                          min="1"
                          max="100"
                          value={tempInputs.timesTableTerm1Min}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("timesTableTerm1Min", e.target.value)}
                          onBlur={() => applyAndValidateAllTempInputs()}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                        />
                        <span>to</span>
                        <Input
                          id="timesTableTerm1Max"
                          type="number"
                          min="1"
                          max="100"
                          value={tempInputs.timesTableTerm1Max}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("timesTableTerm1Max", e.target.value)}
                          onBlur={() => applyAndValidateAllTempInputs()}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                        />
                      </div>
                    </div>
                    {/* Term 2 Range */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Term 2 Range</label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="timesTableTerm2Min"
                          type="number"
                          min="1"
                          max="100"
                          value={tempInputs.timesTableTerm2Min}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("timesTableTerm2Min", e.target.value)}
                          onBlur={() => applyAndValidateAllTempInputs()}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                        />
                        <span>to</span>
                        <Input
                          id="timesTableTerm2Max"
                          type="number"
                          min="1"
                          max="100"
                          value={tempInputs.timesTableTerm2Max}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("timesTableTerm2Max", e.target.value)}
                          onBlur={() => applyAndValidateAllTempInputs()}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}


          {settings.operationType === OperationType.DIVIDE && (
            <>
              {/* Division Formula Type */}
              <div>
                <label htmlFor="divisionFormulaType" className="text-sm text-muted-foreground mb-2 block font-medium">
                  Division Formula Type
                </label>
                <select
                  id="divisionFormulaType"
                  value={tempInputs.divisionFormulaType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newValue = e.target.value as DivisionFormulaType;
                    applyAndValidateAllTempInputs({ divisionFormulaType: newValue });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {validDivisionFormulaTypes.map(type => (
                    <option key={type} value={type}>
                      {divisionFormulaLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divisor and Dividend Digits */}
              <div>
                <h3 className="font-medium mb-4">Divisor and Dividend Digits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="divisorDigits" className="text-sm text-muted-foreground mb-2 block">Divisor Digits</label>
                    <Input
                      id="divisorDigits"
                      type="number"
                      min="1"
                      value={tempInputs.divisorDigits}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("divisorDigits", e.target.value)}
                      onBlur={() => applyAndValidateAllTempInputs()}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                    />
                  </div>
                  <div>
                    <label htmlFor="dividendDigitsMin" className="text-sm text-muted-foreground mb-2 block">Min Dividend Digits</label>
                    <Input
                      id="dividendDigitsMin"
                      type="number"
                      min="1"
                      max="7"
                      value={tempInputs.dividendDigitsMin}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleInputChange("dividendDigitsMin", e.target.value);
                      }}
                      onBlur={() => applyAndValidateAllTempInputs()}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                    />
                  </div>
                  <div>
                    <label htmlFor="dividendDigitsMax" className="text-sm text-muted-foreground mb-2 block">Max Dividend Digits</label>
                    <Input
                      id="dividendDigitsMax"
                      type="number"
                      min="1"
                      max="7"
                      value={tempInputs.dividendDigitsMax}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("dividendDigitsMax", e.target.value)}
                      onBlur={() => applyAndValidateAllTempInputs()}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && applyAndValidateAllTempInputs()}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="flex justify-end space-x-2 mt-6">
            {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button onClick={internalHandleSave}>Save Settings</Button>
          </div>
        )}
        {saveMessage && <p className="text-sm text-green-600 mt-2">{saveMessage}</p>}
      </CardContent>
    </Card>
  );
}