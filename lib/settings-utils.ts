import seedrandom from 'seedrandom';
import { QuestionSettings, OperationType } from "../lib/question-types";
import { parseRules } from "./multiplication-rules";


export const validDivisionFormulaTypes = [
  'TYPE1_CAT_GT_MICE1_2D', // "2 digits / 1 digit (cat > first digit of mice)"
  'TYPE2_CAT_GT_MICE1_3D', // "3 digits / 1 digit (cat > first digit of mice)"
  'TYPE3_CAT_EQ_MICE1_2OR3D', // "2 or 3 digits / 1 digit (cat = first digit of mice)"
  'TYPE4_CAT_LT_MICE1_2D', // "2 digits / 1 digit (cat < first digit of mice)"
  'TYPE5_ANY_DIGITS', // "Any number of digits / 1 digit (no restriction)"
] as const; // Use "as const" to make it a tuple of string literals

export type DivisionFormulaType = typeof validDivisionFormulaTypes[number];


export const defaultSettings: QuestionSettings = {
  operationType: OperationType.ADD_SUBTRACT,
  
  // Addition/Subtraction specific
  minAddSubTerms: 2,
  maxAddSubTerms: 5,
  addSubScenario: 1,
  addSubWeightingMultiplier: 10,
  minAddSubTermDigits: 1,
  maxAddSubTermDigits: 1,

  // Multiplication specific
  term1DigitsMultiply: 1,
  term2DigitsMultiply: 1,
  isTimesTableMode: false,
  timesTableTerm1Max: 9,
  timesTableTerm2Max: 9,

  // Division specific
  divisionFormulaType: 'TYPE1_CAT_GT_MICE1_2D',
  divisorDigits: 1, // Default for TYPE5, implied for others usually
  dividendDigitsMin: 2, // Default for TYPE5
  dividendDigitsMax: 3, // Default for TYPE5
  rng: seedrandom(),

  ruleString: "",
  processedRules: null,
  
  // Abacus display settings
  numberOfAbacusColumns: 7,
};

function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value !== 'number' || isNaN(value) || value === null) return fallback;
  return Math.max(min, Math.min(value, max));
}

export function validateSettings(partialSettings: Partial<QuestionSettings>): QuestionSettings {
  const currentOperationType = partialSettings.operationType || defaultSettings.operationType;

  let validated: QuestionSettings = {
    ...defaultSettings, // Start with all defaults
    ...partialSettings, // Override with provided settings
    operationType: currentOperationType, // Ensure operationType is set
  };

  // Validate Add/Subtract settings if that's the type, or reset to defaults
  if (currentOperationType === OperationType.ADD_SUBTRACT) {
    const minAddSubTermDigits = clampNumber(validated.minAddSubTermDigits, 1, 5, defaultSettings.minAddSubTermDigits!);
    const maxAddSubTermDigits = clampNumber(validated.maxAddSubTermDigits, minAddSubTermDigits, 5, defaultSettings.maxAddSubTermDigits!);
    const minTerms = clampNumber(validated.minAddSubTerms, 1, 50, defaultSettings.minAddSubTerms!);
    
    // When validating settings for the current operation type,
    // we only update fields relevant to that type.
    // Fields for other operation types remain as they were in `partialSettings`
    // (or `defaultSettings` if they weren't in `partialSettings`).
    validated = {
      ...validated, // Keep all existing fields from partialSettings or defaultSettings
      operationType: currentOperationType, // Ensure this is always correctly set
      minAddSubTerms: minTerms,
      maxAddSubTerms: clampNumber(validated.maxAddSubTerms, minTerms, 50, defaultSettings.maxAddSubTerms!),
      addSubScenario: clampNumber(validated.addSubScenario, 1, 10, defaultSettings.addSubScenario!),
      addSubWeightingMultiplier: clampNumber(validated.addSubWeightingMultiplier, 1, 100, defaultSettings.addSubWeightingMultiplier!),
      minAddSubTermDigits: minAddSubTermDigits,
      maxAddSubTermDigits: maxAddSubTermDigits,
    };
  } else if (currentOperationType === OperationType.MULTIPLY) {
    validated = {
      ...validated, // Keep all existing fields
      operationType: currentOperationType,
      term1DigitsMultiply: clampNumber(validated.term1DigitsMultiply, 1, 4, defaultSettings.term1DigitsMultiply!),
      term2DigitsMultiply: clampNumber(validated.term2DigitsMultiply, 1, 4, defaultSettings.term2DigitsMultiply!),
      isTimesTableMode: typeof validated.isTimesTableMode === 'boolean' ? validated.isTimesTableMode : defaultSettings.isTimesTableMode,
      timesTableTerm1Max: clampNumber(validated.timesTableTerm1Max, 1, 9, defaultSettings.timesTableTerm1Max!),
      timesTableTerm2Max: clampNumber(validated.timesTableTerm2Max, 1, 9, defaultSettings.timesTableTerm2Max!),
      ruleString: validated.ruleString, // Keep the ruleString as is
      processedRules: parseRules(validated.ruleString || ""), // Parse the ruleString
    };
  } else if (currentOperationType === OperationType.DIVIDE) {
    const formulaType = validated.divisionFormulaType && validDivisionFormulaTypes.includes(validated.divisionFormulaType as DivisionFormulaType)
                        ? validated.divisionFormulaType
                        : defaultSettings.divisionFormulaType!;
    
    // Default these to the values from the incoming 'validated' object, which already includes defaults or partials.
    // Then, only override if the formulaType dictates.
    let divisorDigits = clampNumber(validated.divisorDigits, 1, 9, defaultSettings.divisorDigits!);
    let dividendMin = clampNumber(validated.dividendDigitsMin, 1, 10, defaultSettings.dividendDigitsMin!);
    let dividendMax = clampNumber(validated.dividendDigitsMax, dividendMin, 10, defaultSettings.dividendDigitsMax!);

    if (formulaType === 'TYPE5_ANY_DIGITS') {
      // Values are already clamped above using validated.xxxDigits or defaults
    } else if (formulaType === 'TYPE1_CAT_GT_MICE1_2D') {
        divisorDigits = 1; dividendMin = 2; dividendMax = 2;
    } else if (formulaType === 'TYPE2_CAT_GT_MICE1_3D') {
        divisorDigits = 1; dividendMin = 3; dividendMax = 3;
    } else if (formulaType === 'TYPE3_CAT_EQ_MICE1_2OR3D') {
        divisorDigits = 1;
        dividendMin = clampNumber(validated.dividendDigitsMin, 2, 3, 2); // As it can be 2 or 3
        dividendMax = clampNumber(validated.dividendDigitsMax, dividendMin, 3, 3);
    } else if (formulaType === 'TYPE4_CAT_LT_MICE1_2D') {
        divisorDigits = 1; dividendMin = 2; dividendMax = 2;
    }
    // If not TYPE5, the specific digit inputs (divisorDigits, dividendDigitsMin/Max) are hidden in the UI.
    // The question generator for these types will use their fixed digit counts.
    // So, we only need to ensure divisionFormulaType is correctly set.
    // The individual digit settings (divisorDigits, dividendDigitsMin, dividendDigitsMax)
    // will retain their last value (from TYPE5 or default) but won't be used by non-TYPE5 generators.

    validated = {
      ...validated, // Keep all existing fields
      operationType: currentOperationType,
      divisionFormulaType: formulaType as DivisionFormulaType,
      // Only validate these if it's TYPE5, otherwise they are not directly used by other generators
      // and will keep their previous values (or defaults if never set).
      divisorDigits: (formulaType === 'TYPE5_ANY_DIGITS') ? divisorDigits : validated.divisorDigits,
      dividendDigitsMin: (formulaType === 'TYPE5_ANY_DIGITS') ? dividendMin : validated.dividendDigitsMin,
      dividendDigitsMax: (formulaType === 'TYPE5_ANY_DIGITS') ? dividendMax : validated.dividendDigitsMax,
    };
  } else {
    // Should not happen with OperationType union, but as a safeguard:
    console.warn("Unknown operation type in validateSettings, falling back to full defaults.");
    return { ...defaultSettings }; // Return a clean default state
  }
  
  // Validate abacus display settings (applies to all operation types)
  validated.numberOfAbacusColumns = clampNumber(validated.numberOfAbacusColumns, 5, 13, defaultSettings.numberOfAbacusColumns!);
  // Ensure numberOfAbacusColumns is odd
  if (validated.numberOfAbacusColumns % 2 === 0) {
    // If even, adjust to nearest valid odd number within range
    if (validated.numberOfAbacusColumns < 7) {
      validated.numberOfAbacusColumns = 5;
    } else if (validated.numberOfAbacusColumns < 9) {
      validated.numberOfAbacusColumns = 7;
    } else if (validated.numberOfAbacusColumns < 11) {
      validated.numberOfAbacusColumns = 9;
    } else if (validated.numberOfAbacusColumns < 13) {
      validated.numberOfAbacusColumns = 11;
    } else {
      validated.numberOfAbacusColumns = 13;
    }
  }
  
  return validated;
}

// Migration logic for settings (if needed in the future)
export function migrateSettings(settings: Partial<QuestionSettings>): QuestionSettings {
  // Add missing fields with defaults before validation
  const migrated = { ...defaultSettings, ...settings };
  return validateSettings(migrated);
}
export function initializeRNG(settings: QuestionSettings): void {
  const seed = settings.seed || new Date().getTime().toString();
  settings.rng = seedrandom(seed);
}