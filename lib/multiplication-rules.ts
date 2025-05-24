/**
 * Multiplication Rules Library
 * 
 * This library contains all multiplication-specific rule logic including:
 * - Rule string parsing and validation
 * - Rule string generation utilities
 * - Zero pattern analysis for multiplication rules
 */

/**
 * Parses a rule string according to the multiplication rule format.
 * - Converts to lowercase, 'o' to '0'
 * - Splits by '+' and processes each part
 * - Validates consistency across all rule parts
 * @param ruleString The input rule string (e.g., "ss + sd", "0s + d0a")
 * @returns An array of processed, validated rule strings, or null if invalid
 */
export function parseRules(ruleString: string): string[] | null {
    // 1. Initial cleaning and splitting based on PHP's $r processing
    const ruleParts = ruleString
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

    const processedRulePartObjects: ProcessedRulePartObject[] = ruleParts.map(rawPart => {
        // Clean the part: keep only 'a', 's', 'd', '0'
        const cleanedPart = rawPart.replace(/[^asd0]/g, "");
        
        // Cap at 6 characters for both length check and zero pattern check
        const cappedCleanedPart = cleanedPart.substring(0, 6);
        
        // Final output part: ltrim zeros and cap at 6
        const finalOutputPart = cleanedPart.replace(/^0+/, '').substring(0, 6);
        
        // Length and zero pattern should be based on the capped cleaned part (before ltrim)
        const lengthForCheck = cappedCleanedPart.length;
        const zeroPatternStringForCheck = cappedCleanedPart;
        
        return {
            finalOutputPart,
            lengthForCheck,
            zeroPatternStringForCheck
        };
    });

    // 3. Filter out objects where lengthForCheck is 0 (invalid parts)
    const validProcessedObjects = processedRulePartObjects.filter(obj => obj.lengthForCheck > 0);
    
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
    const finalRuleArray = validProcessedObjects.map(obj => obj.finalOutputPart);
    
    // Ensure final array is not empty (though previous checks should cover this)
    if (finalRuleArray.length === 0) {
        return null;
    }

    return finalRuleArray;
}

/**
 * Generates all possible rule strings for given term digit counts.
 * This is a brute-force approach that generates all combinations and validates them.
 * @param term1Digits Number of digits for the first term (1-4)
 * @param term2Digits Number of digits for the second term (1-4)
 * @returns Array of valid rule strings
 */
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
 * @param term1Digits Number of digits for the first term (1-3)
 * @param term2Digits Number of digits for the second term (1-3)
 * @returns Array of valid rule strings
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