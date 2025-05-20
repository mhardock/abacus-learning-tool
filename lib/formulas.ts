import { DivisionFormulaType } from "@/lib/settings-utils";

export const scenarioOptions = [
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
];

export interface ScenarioOption {
  value: number;
  label: string;
}

export const divisionFormulaLabels: Record<DivisionFormulaType, string> = {
  TYPE1_CAT_GT_MICE1_2D: "2 digits / 1 digit cat > mice", // User definition: cat=Dividend, mice=Divisor
  TYPE2_CAT_GT_MICE1_3D: "3 digits / 1 digit cat > mice", // User definition: cat=Dividend, mice=Divisor
  TYPE3_CAT_EQ_MICE1_2OR3D: "2,3 digits / 1 digit cat = mice", // User definition: cat=Dividend, mice=Divisor
  TYPE4_CAT_LT_MICE1_2D: "2 digit / 1 digit cat < mice", // User definition: cat=Dividend, mice=Divisor
  TYPE5_ANY_DIGITS: "Custom Digits (cat / mice) (No restriction)", // User definition: cat=Dividend, mice=Divisor
};

export const getFormulaNameById = (scenarioId: number): string => {
  const option = scenarioOptions.find(opt => opt.value === scenarioId);
  return option ? option.label : `Scenario ${scenarioId}`;
};

export const getDivisionFormulaNameByType = (formulaType: DivisionFormulaType): string => {
  return divisionFormulaLabels[formulaType] || `Formula ${formulaType}`;
};