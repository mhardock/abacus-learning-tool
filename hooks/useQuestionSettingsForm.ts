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
  term1DigitsMultiply: string;
  term2DigitsMultiply: string;
  isTimesTableMode: string; // Stored as string for input, converted to boolean
  timesTableTerm1Min: string;
  timesTableTerm1Max: string;
  timesTableTerm2Min: string;
  timesTableTerm2Max: string;
  divisionFormulaType: string; // Store as string, cast to DivisionFormulaType on use
  divisorDigits: string;
  dividendDigitsMin: string;
  dividendDigitsMax: string;
  ruleString: string;
  numberOfAbacusColumns: string;
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
    term1DigitsMultiply: (currentSettings.term1DigitsMultiply ?? defaultSettings.term1DigitsMultiply!).toString(),
    term2DigitsMultiply: (currentSettings.term2DigitsMultiply ?? defaultSettings.term2DigitsMultiply!).toString(),
    isTimesTableMode: (currentSettings.isTimesTableMode ?? defaultSettings.isTimesTableMode ?? false).toString(),
    timesTableTerm1Min: (currentSettings.timesTableTerm1Min ?? defaultSettings.timesTableTerm1Min ?? 1).toString(),
    timesTableTerm1Max: (currentSettings.timesTableTerm1Max ?? defaultSettings.timesTableTerm1Max ?? 9).toString(),
    timesTableTerm2Min: (currentSettings.timesTableTerm2Min ?? defaultSettings.timesTableTerm2Min ?? 1).toString(),
    timesTableTerm2Max: (currentSettings.timesTableTerm2Max ?? defaultSettings.timesTableTerm2Max ?? 9).toString(),
    divisionFormulaType: (currentSettings.divisionFormulaType ?? defaultSettings.divisionFormulaType!).toString(),
    divisorDigits: (currentSettings.divisorDigits ?? defaultSettings.divisorDigits!).toString(),
    dividendDigitsMin: (currentSettings.dividendDigitsMin ?? defaultSettings.dividendDigitsMin!).toString(),
    dividendDigitsMax: (currentSettings.dividendDigitsMax ?? defaultSettings.dividendDigitsMax!).toString(),
    ruleString: (currentSettings.ruleString ?? ""),
    numberOfAbacusColumns: (currentSettings.numberOfAbacusColumns ?? defaultSettings.numberOfAbacusColumns!).toString(),
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
      term1DigitsMultiply: parseInt(mergedInputs.term1DigitsMultiply),
      term2DigitsMultiply: parseInt(mergedInputs.term2DigitsMultiply),
      isTimesTableMode: mergedInputs.isTimesTableMode === 'true',
      timesTableTerm1Min: parseInt(mergedInputs.timesTableTerm1Min || (defaultSettings.timesTableTerm1Min ?? 1).toString()),
      timesTableTerm1Max: parseInt(mergedInputs.timesTableTerm1Max || (defaultSettings.timesTableTerm1Max ?? 9).toString()),
      timesTableTerm2Min: parseInt(mergedInputs.timesTableTerm2Min || (defaultSettings.timesTableTerm2Min ?? 1).toString()),
      timesTableTerm2Max: parseInt(mergedInputs.timesTableTerm2Max || (defaultSettings.timesTableTerm2Max ?? 9).toString()),
      divisionFormulaType: mergedInputs.divisionFormulaType as DivisionFormulaType,
      divisorDigits: parseInt(mergedInputs.divisorDigits),
      dividendDigitsMin: parseInt(mergedInputs.dividendDigitsMin),
      dividendDigitsMax: parseInt(mergedInputs.dividendDigitsMax),
      ruleString: mergedInputs.ruleString,
      numberOfAbacusColumns: parseInt(mergedInputs.numberOfAbacusColumns),
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