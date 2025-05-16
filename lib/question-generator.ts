export interface QuestionSettings {
  minNumbers: number
  maxNumbers: number
  scenario: number
  weightingMultiplier: number
}

export interface Question {
  numbers: number[]
  expectedAnswer: number
}

// Define the base valid d2 values for each d1 value (unweighted)
const validD2Matrix: Record<string, Record<number, number[]>> = {
  // Scenario 1: Simple 1-4 - Addition
  "1-addition": {
    0: [1, 2, 3, 4], 1: [1, 2, 3], 2: [1, 2], 3: [1], 4: [],
  },
  "1-subtraction": {
    0: [], 1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 3, 4],
  },
  // Scenario 2: Simple 1-5 - Addition
  "2-addition": {
    0: [1, 2, 3, 4, 5], 1: [1, 2, 3, 5], 2: [1, 2, 5], 3: [1, 5], 4: [5],
    5: [1, 2, 3, 4], 6: [1, 2, 3], 7: [1, 2], 8: [1], 9: [],
  },
  "2-subtraction": {
    0: [], 1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 3, 4], 5: [5],
    6: [1, 5], 7: [1, 2, 5], 8: [1, 2, 3, 5], 9: [1, 2, 3, 4, 5],
  },
  // Scenario 3: Simple 1-9 - Addition
  "3-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 5, 6, 7, 8], 2: [1, 2, 5, 6, 7],
    3: [1, 5, 6], 4: [5], 5: [1, 2, 3, 4], 6: [1, 2, 3], 7: [1, 2], 8: [1], 9: [],
  },
  "3-subtraction": {
    0: [], 1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 3, 4], 5: [5],
    6: [1, 5, 6], 7: [1, 2, 5, 6, 7], 8: [1, 2, 3, 5, 6, 7, 8],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 4: Friends + - Addition
  "4-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8],
    2: [1, 2, 3, 4, 5, 6, 7], 3: [1, 2, 3, 4, 5, 6], 4: [1, 2, 3, 4, 5],
    5: [1, 2, 3, 4], 6: [1, 2, 3], 7: [1, 2], 8: [1], 9: [],
  },
  "4-subtraction": { // Was same as 3-subtraction - inherits its weightable properties if any
    0: [], 1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 3, 4], 5: [5],
    6: [1, 5, 6], 7: [1, 2, 5, 6, 7], 8: [1, 2, 3, 5, 6, 7, 8],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 5: Friends +/- - Addition
  "5-addition": { // Was same as 4-addition
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8],
    2: [1, 2, 3, 4, 5, 6, 7], 3: [1, 2, 3, 4, 5, 6], 4: [1, 2, 3, 4, 5],
    5: [1, 2, 3, 4], 6: [1, 2, 3], 7: [1, 2], 8: [1], 9: [],
  },
  "5-subtraction": {
    0: [], 1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 3, 4],
    5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [1, 2, 3, 4, 5, 6, 7],
    8: [1, 2, 3, 4, 5, 6, 7, 8], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 6: Relatives + - Addition
  "6-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9], 5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 9], 7: [1, 2, 3, 4, 5, 8, 9],
    8: [1, 2, 3, 4, 5, 7, 8, 9], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  "6-subtraction": { // Was same as 5-subtraction
    0: [], 1: [1], 2: [1, 2], 3: [1, 2, 3], 4: [1, 2, 3, 4],
    5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [1, 2, 3, 4, 5, 6, 7],
    8: [1, 2, 3, 4, 5, 6, 7, 8], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 7: Relatives +/- - Addition
  "7-addition": { // Was same as 6-addition
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9], 5: [1, 2, 3, 4, 5],
    6: [1, 2, 3, 4, 5, 9], 7: [1, 2, 3, 4, 5, 8, 9],
    8: [1, 2, 3, 4, 5, 7, 8, 9], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  "7-subtraction": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 8, 9], 3: [1, 2, 3, 4, 5, 9], 4: [1, 2, 3, 4, 5],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9], 6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9], 8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 8: Mix + - Addition
  "8-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9], 5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9], 7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  "8-subtraction": { // Was same as 7-subtraction
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 8, 9], 3: [1, 2, 3, 4, 5, 9], 4: [1, 2, 3, 4, 5],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9], 6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9], 8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 9: Mix +/- - Addition
  "9-addition": { // Was same as 8-addition
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9], 5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9], 7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  "9-subtraction": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9], 1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9], 5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9], 7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9], 9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 10: All Formulas - Addition & Subtraction (no specific weighting defined here)
  "10-addition": {
    0: [1,2,3,4,5,6,7,8,9], 1: [1,2,3,4,5,6,7,8,9], 2: [1,2,3,4,5,6,7,8,9],
    3: [1,2,3,4,5,6,7,8,9], 4: [1,2,3,4,5,6,7,8,9], 5: [1,2,3,4,5,6,7,8,9],
    6: [1,2,3,4,5,6,7,8,9], 7: [1,2,3,4,5,6,7,8,9], 8: [1,2,3,4,5,6,7,8,9],
    9: [1,2,3,4,5,6,7,8,9],
  },
  "10-subtraction": {
    0: [1,2,3,4,5,6,7,8,9], 1: [1,2,3,4,5,6,7,8,9], 2: [1,2,3,4,5,6,7,8,9],
    3: [1,2,3,4,5,6,7,8,9], 4: [1,2,3,4,5,6,7,8,9], 5: [1,2,3,4,5,6,7,8,9],
    6: [1,2,3,4,5,6,7,8,9], 7: [1,2,3,4,5,6,7,8,9], 8: [1,2,3,4,5,6,7,8,9],
    9: [1,2,3,4,5,6,7,8,9],
  },
};

// Define which d2 values are candidates for weighting
const weightableD2Matrix: Record<string, Record<number, number[]>> = {
  "1-addition": {}, // No d1s have further weightings
  "1-subtraction": {},
  "2-addition": { // d1=1,2,3,4 lead to weighted 5s
    0: [1, 2, 3, 4],
    1: [5], 2: [5], 3: [5], 4: [5]
  },
  "2-subtraction": { 5:[5], 6:[5], 7:[5], 8:[5], 9:[5] },
  "3-addition": { // d1=1,2,3 lead to weighted 6,7,8s
    0: [6,7,8,9],
    1: [6,7,8], 2: [6,7], 3: [6]
  },
  "3-subtraction": { 6:[6], 7:[6,7], 8:[6,7,8], 9:[6,7,8,9] },
  "4-addition": { // d1=1,2,3,4 lead to 5s complement weightings
    0: [1, 2, 3, 4],
    1: [4], 2: [3,4], 3: [2,3,4], 4: [1,2,3,4]
  },
  "4-subtraction": {
    6:[6], 7:[6,7], 8:[6,7,8], 9:[6,7,8,9]
  },
  "5-addition": { // d1=1,2,3,4 lead to 5s complement weightings (same as 4-addition)
    0: [1, 2, 3, 4],
    1: [4], 2: [3,4], 3: [2,3,4], 4: [1,2,3,4]
  },
  "5-subtraction": {
    5:[1,2,3,4], 6:[2,3,4], 7:[3,4], 8:[4]
  },
  "6-addition": { // d1=1 through 9 all lead to 10s complement weightings
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1:[9], 2:[8,9], 3:[7,8,9], 4:[6,7,8,9], 5:[5], 6:[4,5,9],
    7:[3,4,5,8,9], 8:[2,3,4,5,7,8,9], 9:[1,2,3,4,5,6,7,8,9]
  },
  "6-subtraction": {},
  "7-addition": { // d1=1 through 9 all lead to 10s complement weightings (same as 6-addition)
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1:[9], 2:[8,9], 3:[7,8,9], 4:[6,7,8,9], 5:[5], 6:[4,5,9],
    7:[3,4,5,8,9], 8:[2,3,4,5,7,8,9], 9:[1,2,3,4,5,6,7,8,9]
  },
  "7-subtraction": {
    0:[1,2,3,4,5,6,7,8,9], 1:[2,3,4,5,7,8,9], 2:[3,4,5,8,9], 3:[4,5,9], 4:[5],
    5:[6,7,8,9], 6:[7,8,9], 7:[8,9], 8:[9]
  },
  "8-addition": { // d1=5,6,7,8 lead to 5s+10s complement weightings
    0: [5, 6, 7, 8],
    5:[6,7,8,9], 6:[6,7,8], 7:[6,7], 8:[6]
  },
  "8-subtraction": {},
  "9-addition": { // d1=5,6,7,8 lead to 5s+10s complement weightings (same as 8-addition)
    0: [5, 6, 7, 8],
    5:[6,7,8,9], 6:[6,7,8], 7:[6,7], 8:[6]
  },
  "9-subtraction": {
    1:[6], 2:[6,7], 3:[6,7,8], 4:[6,7,8,9]
  },
  "10-addition": {}, // No d1s have further weightings
  "10-subtraction": {},
};

// New helper function to get all potential next numbers (signed)
const getPotentialNextNumbers = (
  settings: QuestionSettings,
  currentValue: number
): number[] => {
  const { scenario, weightingMultiplier } = settings;
  const d1 = currentValue % 10;
  const allPossibleNextNumbers: number[] = [];

  // --- Handle Addition ---
  const addMatrixKey = `${scenario}-addition`;
  const baseD2ValuesForAdd = (validD2Matrix[addMatrixKey] && validD2Matrix[addMatrixKey][d1]) || [];
  if (baseD2ValuesForAdd.length > 0) {
    const weightableForAdd = (weightableD2Matrix[addMatrixKey] && weightableD2Matrix[addMatrixKey][d1]) || [];
    const weightedD2ForAdd = [...baseD2ValuesForAdd];
    if (weightingMultiplier > 1) {
      for (const numToWeight of weightableForAdd) {
        if (baseD2ValuesForAdd.includes(numToWeight)) {
          for (let i = 0; i < weightingMultiplier - 1; i++) {
            weightedD2ForAdd.push(numToWeight);
          }
        }
      }
    }
    allPossibleNextNumbers.push(...weightedD2ForAdd);
  }

  // --- Handle Subtraction ---
  const subMatrixKey = `${scenario}-subtraction`;
  let baseD2ValuesForSub = (validD2Matrix[subMatrixKey] && validD2Matrix[subMatrixKey][d1]) || [];
  if (baseD2ValuesForSub.length > 0) {
    // Apply scenario-specific filtering (borrowing rule for scenarios 6-9)
    // This rule also implicitly handles scenarios 1-5 where d2 > d1 would result in < 0 if not for 10s complement
    // and ensures that for those scenarios, if d2 > d1, the operation isn't allowed if it would go negative without a 10s comp.
    // The matrix for scenarios 1-5 and 10 should ideally not list d2s that would make d1-d2 < 0.
    // The rule `currentValue < 10` is key for 10s complement borrowing.
    if (scenario >= 6 && scenario <= 9 && currentValue < 10) {
      baseD2ValuesForSub = baseD2ValuesForSub.filter(d2 => d2 <= d1);
    } else if (scenario < 6 || scenario === 10) { // For scenarios without 10s complement borrowing explicitly allowed for this rule
        // Ensure d1 - d2 doesn't go negative if it's not a 10s complement scenario (unless allowed by matrix rules)
        // This check might be redundant if matrices for these scenarios are already correct
        // but adds a safeguard. The core idea is that d2 cannot be larger than d1 if currentvalue < 10 AND 10s comp not used for borrowing.
        // However, the critical part is that the sum must not go below zero, which is checked later.
        // The main filtering here is the explicit scenario 6-9 borrowing.
        // Let's rely on the matrices for scenarios 1-5 and 10 to be correct regarding direct subtraction rules.
    }

    if (baseD2ValuesForSub.length > 0) { // Check again after filtering
      const weightableForSub = (weightableD2Matrix[subMatrixKey] && weightableD2Matrix[subMatrixKey][d1]) || [];
      const weightedD2ForSub = [...baseD2ValuesForSub];
      if (weightingMultiplier > 1) {
        for (const numToWeight of weightableForSub) {
          if (baseD2ValuesForSub.includes(numToWeight)) { // Ensure it's still valid after filtering
            for (let i = 0; i < weightingMultiplier - 1; i++) {
              weightedD2ForSub.push(numToWeight);
            }
          }
        }
      }
      allPossibleNextNumbers.push(...weightedD2ForSub.map(d2 => -d2)); // Add as negative
    }
  }
  return allPossibleNextNumbers;
};

export function generateQuestion(settings: QuestionSettings): Question {
  const { minNumbers, maxNumbers, scenario } = settings;

  const numbers: number[] = [];
  
  // For the first number (d1=0, addition)
  const firstNumMatrixKey = `${scenario}-addition`;
  let firstNumBaseD2s = (validD2Matrix[firstNumMatrixKey] && validD2Matrix[firstNumMatrixKey][0]) || [];

  if (firstNumBaseD2s.length === 0 && scenario <=9) { // Allow scenario 10 to have empty initial if matrices are empty
     firstNumBaseD2s = (validD2Matrix[`${scenario}-subtraction`] && validD2Matrix[`${scenario}-subtraction`][0]) || [];
     if (firstNumBaseD2s.length === 0 && scenario <=9) {
        throw new Error(`Scenario ${scenario} doesn't have valid starting values for addition or subtraction at d1=0`);
     }
  }
   if (firstNumBaseD2s.length === 0 && scenario === 10 && !( (validD2Matrix[firstNumMatrixKey] && validD2Matrix[firstNumMatrixKey][0]) || (weightableD2Matrix[firstNumMatrixKey] && weightableD2Matrix[firstNumMatrixKey][0]))){
      throw new Error(`Scenario ${scenario} doesn't have valid starting values for addition at d1=0`);
   }


  let firstNumDynamicallyWeighted = [...firstNumBaseD2s];
  if (settings.weightingMultiplier > 1) {
    const weightableForFirstNum = (weightableD2Matrix[firstNumMatrixKey] && weightableD2Matrix[firstNumMatrixKey][0]) || [];
    for (const numToWeight of weightableForFirstNum) {
      if (firstNumBaseD2s.includes(numToWeight)) {
        for (let i = 0; i < settings.weightingMultiplier - 1; i++) {
          firstNumDynamicallyWeighted.push(numToWeight);
        }
      }
    }
  }

  if (firstNumDynamicallyWeighted.length === 0) {
    // Fallback for scenario 10 if addition has no values but subtraction might (though unlikely with current setup)
     if (scenario === 10) {
        const altKey = `${scenario}-subtraction`;
        firstNumBaseD2s = (validD2Matrix[altKey] && validD2Matrix[altKey][0]) || [];
        firstNumDynamicallyWeighted = [...firstNumBaseD2s];
         if (settings.weightingMultiplier > 1) {
            const weightableForAlt = (weightableD2Matrix[altKey] && weightableD2Matrix[altKey][0]) || [];
            for (const numToWeight of weightableForAlt) {
                if (firstNumBaseD2s.includes(numToWeight)) {
                    for (let i = 0; i < settings.weightingMultiplier - 1; i++) {
                        firstNumDynamicallyWeighted.push(numToWeight);
                    }
                }
            }
        }
    }
    if (firstNumDynamicallyWeighted.length === 0) {
         throw new Error(`Scenario ${scenario} doesn't have valid starting values after weighting for d1=0, operation addition.`);
    }
  }


  const firstNumIndex = Math.floor(Math.random() * firstNumDynamicallyWeighted.length);
  const firstNum = firstNumDynamicallyWeighted[firstNumIndex];
  numbers.push(firstNum);

  let runningTotal = firstNum;
  const totalNumbers = Math.floor(Math.random() * (maxNumbers - minNumbers + 1)) + minNumbers;

  for (let i = 1; i < totalNumbers; i++) {
    const potentialNumbers = getPotentialNextNumbers(settings, runningTotal);

    if (potentialNumbers.length === 0) {
      throw new Error(`Unable to generate a valid next number for scenario ${scenario} with current running total ${runningTotal} (weight: ${settings.weightingMultiplier})`);
    }

    const nextNum = potentialNumbers[Math.floor(Math.random() * potentialNumbers.length)];
    numbers.push(nextNum);
    
    runningTotal += nextNum;
    
    if (runningTotal < 0) {
      // This should ideally be prevented by the logic in getPotentialNextNumbers and matrix definitions.
      // If it still happens, it might indicate a flaw that needs deeper investigation.
      console.warn(`Generated a negative running total: ${runningTotal}. Question numbers: ${numbers.join(', ')}. Settings: ${JSON.stringify(settings)}`);
      throw new Error(`Generated a negative running total: ${runningTotal}. Check scenario rules, borrowing logic, and matrix definitions.`);
    }
  }

  const expectedAnswer = numbers.reduce((sum, num) => sum + num, 0);
  return { numbers, expectedAnswer };
} 