import seedrandom from 'seedrandom';
import { QuestionSettings, OperationType } from "../lib/question-types";

// parseRules moved from question-generator-multiply.ts
export function parseRules(ruleString: string): string[] | null {
    // 1. Initial cleaning and splitting based on PHP's $r processing
    let ruleParts = ruleString
        .toLowerCase()
        .replace(/o/g, "0") // 'o' to '0'
        .replace(/\s*\+\s*/g, " ") // Replace '+' and surrounding spaces with a single space
        .trim()
        .split(" ");

    // Helper to get the "zero pattern value" (e.g., "s0s" -> "101" (binary) -> 5 decimal)
    // This is used for comparing structures, like PHP's $rz.
    const getZeroPatternValue = (r: string): number => {
        if (r.length === 0) return -1; // Should ideally not be called with empty string
        // Create binary string: non-'0' chars become '1', '0' stays '0'
        const binaryPattern = r.split('').map(char => (char === '0' ? '0' : '1')).join('');
        return parseInt(binaryPattern, 2);
    };

    // 2. Process each part and create objects for consistency checking
    interface ProcessedRulePartObject {
        finalOutputPart: string;
        lengthForCheck: number;
        zeroPatternStringForCheck: string;
    }

    let processedRulePartObjects: ProcessedRulePartObject[] = ruleParts.map(rawPart => {
        // Clean the part: keep only 'a', 's', 'd', '0'
        let cleanedPart = rawPart.replace(/[^asd0]/g, "");
        
        // Cap at 6 characters for both length check and zero pattern check
        let cappedCleanedPart = cleanedPart.substring(0, 6);
        
        // Final output part: ltrim zeros and cap at 6
        let finalOutputPart = cleanedPart.replace(/^0+/, '').substring(0, 6);
        
        // Length and zero pattern should be based on the capped cleaned part (before ltrim)
        let lengthForCheck = cappedCleanedPart.length;
        let zeroPatternStringForCheck = cappedCleanedPart;
        
        return {
            finalOutputPart,
            lengthForCheck,
            zeroPatternStringForCheck
        };
    });

    // 3. Filter out objects where lengthForCheck is 0 (invalid parts)
    let validProcessedObjects = processedRulePartObjects.filter(obj => obj.lengthForCheck > 0);
    
    if (validProcessedObjects.length === 0) {
        return null;
    }

    // 4. Determine reference from the first valid object and check strict consistency
    const firstRefObject = validProcessedObjects[0];
    const refLength = firstRefObject.lengthForCheck;
    const refZeroPattern = getZeroPatternValue(firstRefObject.zeroPatternStringForCheck);

    // 5. Check strict consistency - ALL parts must match reference length and zero pattern
    for (let i = 0; i < validProcessedObjects.length; i++) {
        const obj = validProcessedObjects[i];
        if (obj.lengthForCheck !== refLength ||
            getZeroPatternValue(obj.zeroPatternStringForCheck) !== refZeroPattern) {
            return null; // Immediate failure if any part doesn't match
        }
    }

    // 6. All parts passed consistency check, extract final output parts
    let finalRuleArray = validProcessedObjects.map(obj => obj.finalOutputPart);
    
    // Ensure final array is not empty (though previous checks should cover this)
    if (finalRuleArray.length === 0) {
        return null;
    }

    return finalRuleArray;
}

export function generateAllPossibleRuleStrings(term1Digits: number, term2Digits: number): string[] {
  // Input validation: return empty array if parameters are out of valid range
  if (term1Digits < 1 || term1Digits > 4 || term2Digits < 1 || term2Digits > 4) {
    return [];
  }

  const validChars = ['s', 'd', '0', 'a'];
  
  // Generate all possible rule parts of specified length
  function generateRuleParts(length: number): string[] {
    const parts = [''];
    
    for (let i = 0; i < length; i++) {
      const newParts: string[] = [];
      for (const part of parts) {
        for (const char of validChars) {
          newParts.push(part + char);
        }
      }
      parts.splice(0, parts.length, ...newParts);
    }
    
    return parts;
  }
  
  const allRuleParts = generateRuleParts(term1Digits);
  const validRuleStrings = new Set<string>();
  
  // Generate all combinations of term2Digits rule parts
  function generateCombinations(currentCombination: string[], remainingParts: number): void {
    if (remainingParts === 0) {
      const ruleString = currentCombination.join('+');
      const parsedRules = parseRules(ruleString);
      
      // Only include rule strings that parseRules validates as non-null
      if (parsedRules !== null) {
        validRuleStrings.add(ruleString);
      }
      return;
    }
    
    for (const part of allRuleParts) {
      generateCombinations([...currentCombination, part], remainingParts - 1);
    }
  }
  
  generateCombinations([], term2Digits);
  
  return Array.from(validRuleStrings);
}

/**
 * Helper function to get the zero pattern value for a rule part.
 * Converts a part into a binary string where '0' maps to '0' and 'a', 's', 'd' map to '1'.
 * Returns the decimal value of this binary string.
 */
function getZeroPatternValueForPart(part: string): number {
  if (part.length === 0) return -1;
  const binaryPattern = part.split('').map(char => (char === '0' ? '0' : '1')).join('');
  return parseInt(binaryPattern, 2);
}

/**
 * Helper function to generate valid rule parts grouped by their zero pattern value.
 * Returns a Map where keys are zero pattern values and values are arrays of parts with that pattern.
 */
function generateValidRulePartsByPattern(length: number): Map<number, string[]> {
  const validChars = ['s', 'd', 'a', '0'];
  const partsByPattern = new Map<number, string[]>();
  
  // Generate all possible strings of the given length using validChars
  function generateAllParts(currentPart: string, remainingLength: number): void {
    if (remainingLength === 0) {
      const zeroPatternValue = getZeroPatternValueForPart(currentPart);
      if (!partsByPattern.has(zeroPatternValue)) {
        partsByPattern.set(zeroPatternValue, []);
      }
      partsByPattern.get(zeroPatternValue)!.push(currentPart);
      return;
    }
    
    for (const char of validChars) {
      generateAllParts(currentPart + char, remainingLength - 1);
    }
  }
  
  generateAllParts('', length);
  return partsByPattern;
}

/**
 * Efficient function to generate only valid rule strings that would pass parseRules validation.
 * Pre-groups rule parts by zero pattern values to ensure consistency without calling parseRules.
 */
export function generateEfficientValidRuleStrings(term1Digits: number, term2Digits: number): string[] {
  // Input validation: return empty array if parameters are out of valid range
  if (term1Digits < 1 || term1Digits > 3 || term2Digits < 1 || term2Digits > 3) {
    return [];
  }
  
  const partsByPattern = generateValidRulePartsByPattern(term1Digits);
  const validRuleStrings = new Set<string>();
  
  // Generate permutations for each group of parts that share the same zero pattern
  for (const groupOfParts of partsByPattern.values()) {
    if (groupOfParts.length === 0) continue;
    
    // Filter out parts that start with '0'
    const filteredGroupOfParts = groupOfParts.filter(part => !part.startsWith('0'));
    if (filteredGroupOfParts.length === 0) continue;
    
    // Generate all permutations of term2Digits parts from this group (with replacement)
    function generatePermutations(currentPermutation: string[], remainingSlots: number): void {
      if (remainingSlots === 0) {
        const ruleString = currentPermutation.join('+');
        validRuleStrings.add(ruleString);
        return;
      }
      
      for (const part of filteredGroupOfParts) {
        generatePermutations([...currentPermutation, part], remainingSlots - 1);
      }
    }
    
    generatePermutations([], term2Digits);
  }
  
  return Array.from(validRuleStrings);
}

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
  addSubWeightingMultiplier: 3,
  minAddSubTermDigits: 1,
  maxAddSubTermDigits: 1,

  // Multiplication specific
  term1DigitsMultiply: 1,
  term2DigitsMultiply: 1,

  // Division specific
  divisionFormulaType: 'TYPE1_CAT_GT_MICE1_2D',
  divisorDigits: 1, // Default for TYPE5, implied for others usually
  dividendDigitsMin: 2, // Default for TYPE5
  dividendDigitsMax: 3, // Default for TYPE5
  rng: seedrandom(),

  ruleString: "",
  processedRules: null,
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