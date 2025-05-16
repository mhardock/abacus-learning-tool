export interface QuestionSettings {
  minNumbers: number
  maxNumbers: number
  scenario: number
}

export interface Question {
  numbers: number[]
  expectedAnswer: number
}

// Define the valid d2 values for each d1 value based on the scenario and operation
const validD2Matrix: Record<string, Record<number, number[]>> = {
  // Scenario 1: Simple 1-4 - Addition
  "1-addition": {
    0: [1, 2, 3, 4],
    1: [1, 2, 3],
    2: [1, 2],
    3: [1],
    4: [],
  },
  // Scenario 1: Simple 1-4 - Subtraction
  "1-subtraction": {
    0: [],
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1, 2, 3, 4],
  },
  // Scenario 2: Simple 1-5 - Addition
  "2-addition": {
    0: [1, 2, 3, 4, 5, 5, 5],
    1: [1, 2, 3, 5, 5, 5],
    2: [1, 2, 5, 5, 5],
    3: [1, 5, 5, 5],
    4: [5, 5, 5],
    5: [1, 2, 3, 4],
    6: [1, 2, 3],
    7: [1, 2],
    8: [1],
    9: [],
  },
  // Scenario 2: Simple 1-5 - Subtraction
  "2-subtraction": {
    0: [],
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1, 2, 3, 4],
    5: [5, 5, 5],
    6: [1, 5, 5, 5],
    7: [1, 2, 5, 5, 5],
    8: [1, 2, 3, 5, 5, 5],
    9: [1, 2, 3, 4, 5, 5, 5],
  },
  // Scenario 3: Simple 1-9 - Addition
  "3-addition": {
    0: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    1: [1, 2, 3, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8],
    2: [1, 2, 5, 6, 6, 6, 7, 7, 7],
    3: [1, 5, 6, 6, 6],
    4: [5],
    5: [1, 2, 3, 4],
    6: [1, 2, 3],
    7: [1, 2],
    8: [1],
    9: [],
  },
  // Scenario 3: Simple 1-9 - Subtraction
  "3-subtraction": {
    0: [],
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1, 2, 3, 4],
    5: [5],
    6: [1, 5, 6, 6, 6],
    7: [1, 2, 5, 6, 6, 6, 7, 7, 7],
    8: [1, 2, 3, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8],
    9: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
  },
  // Scenario 4: Friends + - Addition
  "4-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 4, 4, 5, 6, 7, 8],
    2: [1, 2, 3, 3, 3, 4, 4, 4, 5, 6, 7],
    3: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6],
    4: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
    5: [1, 2, 3, 4],
    6: [1, 2, 3],
    7: [1, 2],
    8: [1],
    9: [],
  },
  // Scenario 4: Friends + - Subtraction (same as Scenario 3 Subtraction)
  "4-subtraction": {
    0: [],
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1, 2, 3, 4],
    5: [5],
    6: [1, 5, 6],
    7: [1, 2, 5, 6, 7],
    8: [1, 2, 3, 5, 6, 7, 8],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 5: Friends +/- - Addition (same as Scenario 4 Addition)
  "5-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 4, 4, 5, 6, 7, 8],
    2: [1, 2, 3, 3, 3, 4, 4, 4, 5, 6, 7],
    3: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6],
    4: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
    5: [1, 2, 3, 4],
    6: [1, 2, 3],
    7: [1, 2],
    8: [1],
    9: [],
  },
  // Scenario 5: Friends +/- - Subtraction
  "5-subtraction": {
    0: [],
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1, 2, 3, 4],
    5: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
    6: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6],
    7: [1, 2, 3, 3, 3, 4, 4, 4, 5, 6, 7],
    8: [1, 2, 3, 4, 4, 4, 5, 6, 7, 8],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 6: Relatives + - Addition
  "6-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 9, 9, 9],
    3: [1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    4: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    5: [1, 2, 3, 4, 5, 5, 5],
    6: [1, 2, 3, 4, 4, 4, 5, 5, 5, 9, 9, 9],
    7: [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 8, 8, 8, 9, 9, 9],
    8: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    9: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
  },
  // Scenario 6: Relatives + - Subtraction (same as Scenario 5 Subtraction)
  "6-subtraction": {
    0: [],
    1: [1],
    2: [1, 2],
    3: [1, 2, 3],
    4: [1, 2, 3, 4],
    5: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
    6: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6],
    7: [1, 2, 3, 3, 3, 4, 4, 4, 5, 6, 7],
    8: [1, 2, 3, 4, 4, 4, 5, 6, 7, 8],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 7: Relatives +/- - Addition (same as Scenario 6 Addition)
  "7-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 9, 9, 9],
    3: [1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    4: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    5: [1, 2, 3, 4, 5, 5, 5],
    6: [1, 2, 3, 4, 4, 4, 5, 5, 5, 9, 9, 9],
    7: [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 8, 8, 8, 9, 9, 9],
    8: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    9: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
  },
  // Scenario 7: Relatives +/- - Subtraction
  "7-subtraction": {
    0: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    1: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    2: [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 8, 8, 8, 9, 9, 9],
    3: [1, 2, 3, 4, 4, 4, 5, 5, 5, 9, 9, 9],
    4: [1, 2, 3, 4, 5, 5, 5],
    5: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 9, 9, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 8: Mix + - Addition
  "8-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    6: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 6, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 8: Mix + - Subtraction (same as Scenario 7 Subtraction)
  "8-subtraction": {
    0: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    1: [1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    2: [1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 8, 8, 8, 9, 9, 9],
    3: [1, 2, 3, 4, 4, 4, 5, 5, 5, 9, 9, 9],
    4: [1, 2, 3, 4, 5, 5, 5],
    5: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 9, 9, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 9: Mix +/- - Addition (all combinations allowed)
  "9-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    6: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 6, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 9: Mix +/- - Subtraction (all combinations allowed)
  "9-subtraction": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 6, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 9],
    3: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 10: All Formulas - Addition (all combinations allowed, no weighting)
  "10-addition": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  // Scenario 10: All Formulas - Subtraction (all combinations allowed, no weighting)
  "10-subtraction": {
    0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
};

// Function to find valid combinations for a specific operation
const findValidPair = (scenario: number, operation: "addition" | "subtraction", currentValue: number) => {
  // Get the valid d2 values matrix for the selected scenario and operation
  const matrixKey = `${scenario}-${operation}`;
  const validD2ForD1 = validD2Matrix[matrixKey];
  
  if (!validD2ForD1) {
    throw new Error(`Scenario ${scenario} is not defined for ${operation}`);
  }
  
  // Valid d1 values are those that have at least one valid d2
  const possibleD1Values = Object.keys(validD2ForD1)
    .map(Number)
    .filter(d1 => validD2ForD1[d1] && validD2ForD1[d1].length > 0);
  
  if (possibleD1Values.length === 0) {
    return null; // No valid d1 values for this operation
  }
  
  // Find a valid d1 from the running total
  const d1 = currentValue % 10; // Get the ones digit
  
  // Check if this d1 has valid d2 values
  if (!possibleD1Values.includes(d1)) {
    return null; // This d1 doesn't have valid d2 values
  }
  
  // Get the valid d2 values for the current d1
  let validD2Values = validD2ForD1[d1];
  
  if (!validD2Values || validD2Values.length === 0) {
    return null; // No valid d2 values for this d1
  }
  
  // For scenarios 6-9, when using subtraction where d2 > d1, we need to ensure
  // currentValue >= 10 to allow borrowing
  if (scenario >= 6 && operation === "subtraction" && currentValue < 10) {
    // Filter out d2 values that are greater than d1 when currentValue < 10
    validD2Values = validD2Values.filter(d2 => d2 <= d1);
    
    if (validD2Values.length === 0) {
      return null; // No valid d2 values after filtering
    }
  }
  
  // Choose a random d2 from valid values
  const d2Index = Math.floor(Math.random() * validD2Values.length);
  const d2 = validD2Values[d2Index];
  
  return { d1, d2, operation };
};

export function generateQuestion(settings: QuestionSettings): Question {
  const { minNumbers, maxNumbers, scenario } = settings;
  
  // Initialize numbers array
  const numbers: number[] = [];
  
  // For the first number, we'll use the scenario's rules
  // Since it's the first number, consider d1 as 0 and find a valid d2
  
  // Get possible values for the first number from the scenario matrix
  const matrixKey = `${scenario}-addition`; // Always use addition for first number
  const validFirstNumberValues = validD2Matrix[matrixKey][0] || [];
  
  if (validFirstNumberValues.length === 0) {
    throw new Error(`Scenario ${scenario} doesn't have valid starting values`);
  }
  
  // Generate the first number from the valid values for the scenario
  const firstNumIndex = Math.floor(Math.random() * validFirstNumberValues.length);
  const firstNum = validFirstNumberValues[firstNumIndex];
  numbers.push(firstNum);
  
  let runningTotal = firstNum;
  
  // Determine how many more numbers to generate based on settings
  const totalNumbers = Math.floor(Math.random() * (maxNumbers - minNumbers + 1)) + minNumbers;
  
  // Generate the rest of the numbers
  for (let i = 1; i < totalNumbers; i++) {
    // Randomly decide between addition and subtraction
    const operations: Array<"addition" | "subtraction"> = ["addition", "subtraction"];
    let validPair = null;
    
    // Try each operation in random order
    operations.sort(() => Math.random() - 0.5);
    
    for (const operation of operations) {
      validPair = findValidPair(scenario, operation, runningTotal);
      if (validPair) break;
    }
    
    // If no valid pair is found for either operation, throw an error
    if (!validPair) {
      throw new Error(`Unable to generate a valid question for scenario ${scenario} with current running total ${runningTotal}`);
    }
    
    // Add the number to the list with appropriate sign
    const nextNum = validPair.operation === "addition" ? validPair.d2 : -validPair.d2;
    numbers.push(nextNum);
    
    // Update the running total
    runningTotal += nextNum;
    
    // Ensure we don't generate negative numbers
    if (runningTotal < 0) {
      throw new Error(`Generated a negative running total: ${runningTotal}`);
    }
  }
  
  // Calculate the expected answer
  const expectedAnswer = numbers.reduce((sum, num) => sum + num, 0);
  
  return {
    numbers,
    expectedAnswer
  };
} 