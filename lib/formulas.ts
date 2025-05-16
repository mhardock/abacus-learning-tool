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

export const getFormulaNameById = (scenarioId: number): string => {
  const option = scenarioOptions.find(opt => opt.value === scenarioId);
  return option ? option.label : `Scenario ${scenarioId}`;
}; 