export interface QuestionSettings {
  minNumbers: number
  maxNumbers: number
  scenario: number
  weightingMultiplier: number
  minOperandDigits: number
  maxOperandDigits: number
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

// New helper function to get a digit from a number
const getDigit = (num: number, place: number): number => Math.floor(Math.abs(num) / Math.pow(10, place)) % 10;

// New helper function to get weighted d2s for a column operation
const getWeightedD2sForColumn = (
  matrixKey: string,
  d1ForMatrix: number,
  weightingMultiplier: number,
  scenario: number,
  currentOverallRunningTotal: number, // Used for scenario-specific rules
  columnIndex: number, // 0 for ones, 1 for tens, etc.
  operationType: "addition" | "subtraction"
): number[] => {
  let baseD2s = (validD2Matrix[matrixKey] && validD2Matrix[matrixKey][d1ForMatrix]) || [];

  if (operationType === "subtraction" && scenario >= 6) {
    // Apply borrowing rule: if no higher digits exist to borrow from, d2 cannot be > d1
    // This means currentOverallRunningTotal < 10^(columnIndex + 1)
    if (currentOverallRunningTotal < Math.pow(10, columnIndex + 1)) {
      baseD2s = baseD2s.filter(d2Val => d2Val <= d1ForMatrix);
    }
  }

  if (baseD2s.length === 0) return [];

  const weightable = (weightableD2Matrix[matrixKey] && weightableD2Matrix[matrixKey][d1ForMatrix]) || [];
  const weightedD2s = [...baseD2s];

  if (weightingMultiplier > 1) {
    for (const numToWeight of weightable) {
      if (baseD2s.includes(numToWeight)) {
        for (let i = 0; i < weightingMultiplier - 1; i++) {
          weightedD2s.push(numToWeight);
        }
      }
    }
  }
  return weightedD2s;
};

// Helper to generate ONE valid multi-digit ADDITION operand
const generateSingleFullAddOperand = (
  settings: QuestionSettings,
  currentRunningTotal: number,
  numDigitsForOperand: number
): number | null => {
  const { scenario, weightingMultiplier } = settings;
  let N_add_val = 0;
  let current_R_N_sum_carry = 0;
  let place_value = 1;

  for (let j = 0; j < numDigitsForOperand; j++) { // j is columnIndex
    const r_j = getDigit(currentRunningTotal, j);
    const d1_for_matrix = (r_j + current_R_N_sum_carry) % 10;
    const matrixKey = `${scenario}-addition`;
    
    const possible_n_j_digits = getWeightedD2sForColumn(
      matrixKey, d1_for_matrix, weightingMultiplier, scenario, currentRunningTotal, j, "addition"
    );

    if (possible_n_j_digits.length === 0) return null; // Cannot form operand
    
    let n_j = possible_n_j_digits[Math.floor(Math.random() * possible_n_j_digits.length)];
    if (j === numDigitsForOperand - 1 && n_j === 0 && numDigitsForOperand > 1) { // Leading zero avoidance
      const nonZeroDigits = possible_n_j_digits.filter(d => d !== 0);
      if (nonZeroDigits.length > 0) {
        n_j = nonZeroDigits[Math.floor(Math.random() * nonZeroDigits.length)];
      } else {
        return null; // Only 0 possible for leading digit of multi-digit number
      }
    }

    N_add_val += n_j * place_value;
    const sum_on_this_col = (r_j + current_R_N_sum_carry) + n_j;
    current_R_N_sum_carry = Math.floor(sum_on_this_col / 10);
    place_value *= 10;
  }
  return N_add_val > 0 ? N_add_val : null; // Ensure operand is not zero
};

// Helper to generate ONE valid multi-digit SUBTRACTION operand (returns absolute value)
const generateSingleFullSubOperand = (
  settings: QuestionSettings,
  currentRunningTotal: number,
  numDigitsForOperand: number
): number | null => {
  const { scenario, weightingMultiplier } = settings;
  let N_sub_val = 0;
  let current_R_N_sub_borrow = 0;
  let place_value = 1;

  for (let j = 0; j < numDigitsForOperand; j++) { // j is columnIndex
    const r_j = getDigit(currentRunningTotal, j);
    const val_on_rod_before_n_j_op = r_j - current_R_N_sub_borrow;
    const d1_for_matrix = (val_on_rod_before_n_j_op + 1000) % 10;
    const matrixKey = `${scenario}-subtraction`;

    const possible_n_j_digits = getWeightedD2sForColumn(
      matrixKey, d1_for_matrix, weightingMultiplier, scenario, currentRunningTotal, j, "subtraction"
    );
    
    if (possible_n_j_digits.length === 0) return null; // Cannot form operand

    let n_j = possible_n_j_digits[Math.floor(Math.random() * possible_n_j_digits.length)];
    if (j === numDigitsForOperand - 1 && n_j === 0 && numDigitsForOperand > 1) { // Leading zero avoidance
      const nonZeroDigits = possible_n_j_digits.filter(d => d !== 0);
      if (nonZeroDigits.length > 0) {
        n_j = nonZeroDigits[Math.floor(Math.random() * nonZeroDigits.length)];
      } else {
        return null; // Only 0 possible for leading digit
      }
    }

    N_sub_val += n_j * place_value;
    const diff_on_this_col = val_on_rod_before_n_j_op - n_j;
    current_R_N_sub_borrow = diff_on_this_col < 0 ? 1 : 0;
    place_value *= 10;
  }
  return N_sub_val > 0 ? N_sub_val : null; // Ensure operand is not zero
};

// New function to generate potential multi-digit operands
const generatePotentialMultiDigitOperands = (
  settings: QuestionSettings,
  currentRunningTotal: number,
  numDigitsForOperand: number
): number[] => {
  const { scenario, weightingMultiplier } = settings;
  const potentialOperands: number[] = [];
  const TARGET_CANDIDATES_IN_LIST = 15; // How many candidates we try to generate for the list

  // Calculate probabilities based on ones-column options (d1 for this is current ones digit)
  const d1_for_prob_calc = getDigit(currentRunningTotal, 0);

  const add_options_col0 = getWeightedD2sForColumn(
    `${scenario}-addition`, d1_for_prob_calc, weightingMultiplier, scenario, currentRunningTotal, 0, "addition"
  );
  const sub_options_col0 = getWeightedD2sForColumn(
    `${scenario}-subtraction`, d1_for_prob_calc, weightingMultiplier, scenario, currentRunningTotal, 0, "subtraction"
  );

  const num_add_col0_options = add_options_col0.length;
  // For sub_options, only consider those that wouldn't immediately make the ones digit negative without a 10s comp for this rough estimate.
  // This is an approximation; the full check `currentRunningTotal - N_sub_val >= 0` is done later.
  const num_sub_col0_viable_options = sub_options_col0.filter(d2 => 
    (d1_for_prob_calc >= d2) || // Direct subtraction possible on the ones digit
    (scenario >= 6 && d1_for_prob_calc < d2) // Or, it's a 10s complement scenario (scenarios 6-9 allow d2>d1 with 10s comp)
  ).length;
  
  let prob_add = 0.5; // Default if both counts are zero (though unlikely)
  if (num_add_col0_options > 0 || num_sub_col0_viable_options > 0) {
    prob_add = num_add_col0_options / (num_add_col0_options + num_sub_col0_viable_options);
  }
  // Edge cases for probability
  if (num_add_col0_options === 0 && num_sub_col0_viable_options > 0) prob_add = 0;
  if (num_sub_col0_viable_options === 0 && num_add_col0_options > 0) prob_add = 1;
  if (num_add_col0_options === 0 && num_sub_col0_viable_options === 0) return []; // No options at all

  let attempts = 0;
  const MAX_TOTAL_ATTEMPTS = TARGET_CANDIDATES_IN_LIST * 2; // Give more total attempts to fill the list

  while(potentialOperands.length < TARGET_CANDIDATES_IN_LIST && attempts < MAX_TOTAL_ATTEMPTS) {
    const isAddOperation = Math.random() < prob_add;
    attempts++;

    if (isAddOperation && num_add_col0_options > 0) {
      const N_add = generateSingleFullAddOperand(settings, currentRunningTotal, numDigitsForOperand);
      if (N_add !== null) { // Already ensures N_add > 0
        potentialOperands.push(N_add);
      }
    } else if (!isAddOperation && num_sub_col0_viable_options > 0) {
      const N_sub_abs = generateSingleFullSubOperand(settings, currentRunningTotal, numDigitsForOperand);
      if (N_sub_abs !== null) { // Already ensures N_sub_abs > 0
        if (currentRunningTotal - N_sub_abs >= 0) { // Crucial check
          potentialOperands.push(-N_sub_abs);
        }
      }
    }
  }
  return potentialOperands;
};

export function generateQuestion(settings: QuestionSettings): Question {
  const { minNumbers, maxNumbers, scenario, minOperandDigits, maxOperandDigits, weightingMultiplier } = settings;

  if (!minOperandDigits || !maxOperandDigits || minOperandDigits <= 0 || maxOperandDigits < minOperandDigits) {
    throw new Error("Invalid minOperandDigits or maxOperandDigits. Please set them in QuestionSettings.");
  }

  const numbers: number[] = [];
  
  // --- Generate firstNum (multi-digit) using generatePotentialMultiDigitOperands ---
  let firstNum = 0;
  const initialNumDigitsForFirstNum = Math.floor(Math.random() * (maxOperandDigits - minOperandDigits + 1)) + minOperandDigits;
  let firstNumFound = false;

  // Try generating with initial number of digits, then try fewer if it fails
  for (let d = initialNumDigitsForFirstNum; d >= Math.max(1, minOperandDigits); d--) {
    const potentialFirstOperands = generatePotentialMultiDigitOperands(settings, 0, d)
                                    .filter(op => op > 0); // First number must be positive
    if (potentialFirstOperands.length > 0) {
      firstNum = potentialFirstOperands[Math.floor(Math.random() * potentialFirstOperands.length)];
      firstNumFound = true;
      break;
    }
  }

  if (!firstNumFound) {
    // Final fallback to a single digit first number from d1=0 if all multi-digit attempts failed
    // This ensures minOperandDigits = 1 can always produce something if rules allow
    console.warn(`Multi-digit firstNum generation failed for scenario ${scenario}, digits ${initialNumDigitsForFirstNum}. Falling back to single digit.`);
    const simpleFirstNumDigits = getWeightedD2sForColumn(`${scenario}-addition`, 0, weightingMultiplier, scenario, 0, 0, "addition")
                                  .filter(dVal => dVal > 0);
    if (simpleFirstNumDigits.length > 0) {
        firstNum = simpleFirstNumDigits[Math.floor(Math.random() * simpleFirstNumDigits.length)];
        firstNumFound = true;
    } else {
        throw new Error(`Scenario ${scenario} doesn\'t have valid starting values for d1=0, operation addition, to form even a single-digit first number.`);
    }
  }
  
  if (!firstNumFound || firstNum <= 0) { // Should be caught by filter(op > 0) or the error above
    throw new Error(`Failed to generate a valid positive first number for scenario ${scenario}.`);
  }

  numbers.push(firstNum);
  let runningTotal = firstNum;
  const totalNumbersInSequence = Math.floor(Math.random() * (maxNumbers - minNumbers + 1)) + minNumbers;

  for (let i = 1; i < totalNumbersInSequence; i++) {
    const numDigitsForNextOperand = Math.floor(Math.random() * (maxOperandDigits - minOperandDigits + 1)) + minOperandDigits;
    const potentialOperands = generatePotentialMultiDigitOperands(settings, runningTotal, numDigitsForNextOperand);

    if (potentialOperands.length === 0) {
      // Try with fewer digits if possible, down to 1 digit, before failing
      let foundFallback = false;
      for (let d = numDigitsForNextOperand - 1; d >= Math.max(1, minOperandDigits) ; d--) {
        const fallbackOperands = generatePotentialMultiDigitOperands(settings, runningTotal, d);
        if (fallbackOperands.length > 0) {
          const nextNum = fallbackOperands[Math.floor(Math.random() * fallbackOperands.length)];
          numbers.push(nextNum);
          runningTotal += nextNum;
          if (runningTotal < 0) { // Should be prevented by generatePotentialMultiDigitOperands for subtractions
             console.warn(`Generated a negative running total (fallback): ${runningTotal}. Question: ${numbers.join(', ')}. Settings: ${JSON.stringify(settings)}`);
             throw new Error(`Generated a negative running total (fallback): ${runningTotal}.`);
          }
          foundFallback = true;
          break;
        }
      }
      if (!foundFallback) {
         throw new Error(`Unable to generate a valid next multi-digit number for scenario ${scenario} with current running total ${runningTotal} (digits: ${numDigitsForNextOperand}, weight: ${settings.weightingMultiplier})`);
      }
      continue; // Continue to next iteration of the main loop
    }

    const nextNum = potentialOperands[Math.floor(Math.random() * potentialOperands.length)];
    numbers.push(nextNum);
    runningTotal += nextNum; // nextNum is already signed
    
    if (runningTotal < 0) {
      // This path should ideally not be hit if generatePotentialMultiDigitOperands correctly filters subtractions.
      console.warn(`Generated a negative running total: ${runningTotal}. Question numbers: ${numbers.join(', ')}. Settings: ${JSON.stringify(settings)}`);
      throw new Error(`Generated a negative running total: ${runningTotal}. Check operand generation logic, especially for subtractions.`);
    }
  }

  const expectedAnswer = numbers.reduce((sum, num) => sum + num, 0);
  // Final check, sum of numbers should not be negative if abacus implies non-negative results
  if (expectedAnswer < 0) {
      // This can happen if a sequence of valid steps leads to a negative final sum.
      // Depending on requirements, either allow this or regenerate. For now, log and allow.
      console.warn(`Generated a question with a negative final answer: ${expectedAnswer}. Question: ${numbers.join(', ')}`);
      // To strictly prevent negative final answers, you might need to regenerate the entire question or adjust the last term.
      // For now, we'll allow it, as individual steps were valid and runningTotal was kept >= 0.
  }

  return { numbers, expectedAnswer };
} 