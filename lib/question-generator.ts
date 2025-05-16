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
  // Scenario 1: No specific weighting defined in prompt
  "1-addition": {}, "1-subtraction": {},
  // Scenario 2: 5 is more frequent
  "2-addition": { 0:[5], 1:[5], 2:[5], 3:[5], 4:[5] },
  "2-subtraction": { 5:[5], 6:[5], 7:[5], 8:[5], 9:[5] },
  // Scenario 3: 6,7,8,9 are more frequent
  "3-addition": { 0:[6,7,8,9], 1:[6,7,8], 2:[6,7], 3:[6] },
  "3-subtraction": { 6:[6], 7:[6,7], 8:[6,7,8], 9:[6,7,8,9] },
  // Scenario 4 & 5 Addition: d2 values requiring 5s complement
  "4-addition": { 1:[4], 2:[3,4], 3:[2,3,4], 4:[1,2,3,4] },
  "4-subtraction": { // Based on Scenario 3 Subtraction's weighted numbers
    6:[6], 7:[6,7], 8:[6,7,8], 9:[6,7,8,9]
  },
  "5-addition": { 1:[4], 2:[3,4], 3:[2,3,4], 4:[1,2,3,4] }, // Same as 4-addition
  "5-subtraction": { // d2 values requiring 5s complement
    5:[1,2,3,4], 6:[2,3,4], 7:[3,4], 8:[4]
  },
  // Scenario 6 & 7 Addition: d2 values requiring 10s complement
  "6-addition": {
    1:[9], 2:[8,9], 3:[7,8,9], 4:[6,7,8,9], 5:[5], 6:[4,5,9],
    7:[3,4,5,8,9], 8:[2,3,4,5,7,8,9], 9:[1,2,3,4,5,6,7,8,9] // All were 10s comp
  },
  "6-subtraction": { // Based on Scenario 5 Subtraction's weighted numbers
    5:[1,2,3,4], 6:[2,3,4], 7:[3,4], 8:[4]
  },
  "7-addition": { // Same as 6-addition
    1:[9], 2:[8,9], 3:[7,8,9], 4:[6,7,8,9], 5:[5], 6:[4,5,9],
    7:[3,4,5,8,9], 8:[2,3,4,5,7,8,9], 9:[1,2,3,4,5,6,7,8,9]
  },
  "7-subtraction": { // d2 values requiring 10s complement
    0:[1,2,3,4,5,6,7,8,9], 1:[2,3,4,5,7,8,9], 2:[3,4,5,8,9], 3:[4,5,9], 4:[5],
    5:[6,7,8,9], 6:[7,8,9], 7:[8,9], 8:[9]
  },
  // Scenario 8 & 9 Addition: d2 values requiring 5s and 10s complement
  "8-addition": { 5:[6,7,8,9], 6:[6,7,8], 7:[6,7], 8:[6] },
  "8-subtraction": { // Same as 7-subtraction
    0:[1,2,3,4,5,6,7,8,9], 1:[2,3,4,5,7,8,9], 2:[3,4,5,8,9], 3:[4,5,9], 4:[5],
    5:[6,7,8,9], 6:[7,8,9], 7:[8,9], 8:[9]
  },
  "9-addition": { // Same as 8-addition
    5:[6,7,8,9], 6:[6,7,8], 7:[6,7], 8:[6]
  },
  "9-subtraction": { // d2 values requiring 5s and 10s complement
    1:[6], 2:[6,7], 3:[6,7,8], 4:[6,7,8,9]
  },
  // Scenario 10: No specific weighting defined
  "10-addition": {}, "10-subtraction": {},
};

// Function to find valid combinations for a specific operation
const findValidPair = (
  settings: QuestionSettings, // Pass full settings object
  operation: "addition" | "subtraction",
  currentValue: number
) => {
  const { scenario, weightingMultiplier } = settings;
  const matrixKey = `${scenario}-${operation}`;
  const validD2ForD1 = validD2Matrix[matrixKey];
  const weightableD2ForD1 = weightableD2Matrix[matrixKey] || {};

  if (!validD2ForD1) {
    throw new Error(`Scenario ${scenario} is not defined for ${operation}`);
  }

  const possibleD1Values = Object.keys(validD2ForD1)
    .map(Number)
    .filter(d1 => validD2ForD1[d1] && validD2ForD1[d1].length > 0);

  if (possibleD1Values.length === 0) {
    return null;
  }

  const d1 = currentValue % 10;

  if (!possibleD1Values.includes(d1)) {
    return null;
  }

  let baseD2Values = validD2ForD1[d1];
  if (!baseD2Values || baseD2Values.length === 0) {
    return null;
  }

  // Apply scenario-specific filtering (e.g., borrowing rule)
  if (scenario >= 6 && scenario <= 9 && operation === "subtraction" && currentValue < 10) {
    baseD2Values = baseD2Values.filter(d2 => d2 <= d1);
    if (baseD2Values.length === 0) {
      return null;
    }
  }
  
  // Apply dynamic weighting
  let dynamicallyWeightedD2Values = [...baseD2Values];
  if (weightingMultiplier > 1) {
    const weightableNumbersForCurrentD1 = weightableD2ForD1[d1] || [];
    for (const numToWeight of weightableNumbersForCurrentD1) {
      if (baseD2Values.includes(numToWeight)) { // Check if the weightable number is in the base valid list
        for (let i = 0; i < weightingMultiplier - 1; i++) {
          dynamicallyWeightedD2Values.push(numToWeight);
        }
      }
    }
  }
  
  if (dynamicallyWeightedD2Values.length === 0) {
    // This can happen if baseD2Values was filtered to empty and no weightable numbers were applicable
    return null;
  }

  const d2Index = Math.floor(Math.random() * dynamicallyWeightedD2Values.length);
  const d2 = dynamicallyWeightedD2Values[d2Index];

  return { d1, d2, operation };
};

export function generateQuestion(settings: QuestionSettings): Question {
  const { minNumbers, maxNumbers, scenario } = settings; // weightingMultiplier is in settings

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
    const operations: Array<"addition" | "subtraction"> = ["addition", "subtraction"];
    operations.sort(() => Math.random() - 0.5);
    let validPair = null;

    for (const operation of operations) {
      validPair = findValidPair(settings, operation, runningTotal); // Pass full settings
      if (validPair) break;
    }

    if (!validPair) {
      throw new Error(`Unable to generate a valid question for scenario ${scenario} with current running total ${runningTotal} (weight: ${settings.weightingMultiplier})`);
    }

    const nextNum = validPair.operation === "addition" ? validPair.d2 : -validPair.d2;
    numbers.push(nextNum);
    runningTotal += nextNum;

    if (runningTotal < 0) {
      // This should ideally be prevented by findValidPair's logic for subtraction
      // or the rules in validD2Matrix ensuring d1-d2 >= 0 for non-10s-complement scenarios.
      // If it still happens, it might indicate a flaw in matrix definitions or borrowing logic.
      console.warn(`Generated a negative running total: ${runningTotal}. Question numbers: ${numbers.join(', ')}. Settings: ${JSON.stringify(settings)}`)
      // For now, let's try to recover by backtracking or regenerating, or throw.
      // Simplest for now is to throw, as the question is invalid.
      throw new Error(`Generated a negative running total: ${runningTotal}. Check scenario rules and borrowing logic.`);
    }
  }

  const expectedAnswer = numbers.reduce((sum, num) => sum + num, 0);
  return { numbers, expectedAnswer };
} 