import { useState } from "react";
import { validateSettings, defaultSettings, DivisionFormulaType } from "../lib/settings-utils";
import { QuestionSettings as FullQuestionSettings, OperationType } from "../lib/question-types";

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

export const useQuestionSettingsForm = (
  initialGlobalSettings: FullQuestionSettings,
  onSettingsChange?: (newSettings: FullQuestionSettings) => void
) => {
  const [settings, setSettings] = useState<FullQuestionSettings>(() =>
    validateSettings({ ...defaultSettings, ...initialGlobalSettings })
  );

  const [tempInputs, setTempInputs] = useState<TempInputState>(() =>
    convertSettingsToTempInputs(settings)
  );

  const handleInputChange = (key: keyof TempInputState, value: string) => {
    setTempInputs((prevInputs) => ({
      ...prevInputs,
      [key]: value,
    }));
  };

  const applyAndValidateAllTempInputs = (changedOverride?: Partial<TempInputState>): FullQuestionSettings => {
    const mergedInputs = { ...tempInputs, ...changedOverride };

    const parsedSettings: Partial<FullQuestionSettings> = {
      operationType: mergedInputs.operationType,
      minAddSubTerms: parseInt(mergedInputs.minAddSubTerms),
      maxAddSubTerms: parseInt(mergedInputs.maxAddSubTerms),
      addSubScenario: parseInt(mergedInputs.addSubScenario),
      addSubWeightingMultiplier: parseInt(mergedInputs.addSubWeightingMultiplier),
      minAddSubTermDigits: parseInt(mergedInputs.minAddSubTermDigits),
      maxAddSubTermDigits: parseInt(mergedInputs.maxAddSubTermDigits),
      term1Digits: parseInt(mergedInputs.term1Digits),
      term2Digits: parseInt(mergedInputs.term2Digits),
      divisionFormulaType: mergedInputs.divisionFormulaType as DivisionFormulaType,
      divisorDigits: parseInt(mergedInputs.divisorDigits),
      dividendDigitsMin: parseInt(mergedInputs.dividendDigitsMin),
      dividendDigitsMax: parseInt(mergedInputs.dividendDigitsMax),
    };

    const newValidatedSettings = validateSettings(parsedSettings);
    setSettings(newValidatedSettings);
    setTempInputs(convertSettingsToTempInputs(newValidatedSettings)); // Update tempInputs to reflect clamped/corrected values
    if (onSettingsChange) {
      onSettingsChange(newValidatedSettings);
    }
    return newValidatedSettings;
  };

  return {
    settings,
    tempInputs,
    handleInputChange,
    applyAndValidateAllTempInputs,
  };
};