import { QuestionSettings, Question } from '../lib/question-types';

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

// Helper functions for division, translated from division.py
function get_first_digit(n: number): number {
  if (n <= 0) {
    // Or handle as per TypeScript/JS conventions, e.g., return NaN or throw specific error
    console.warn("get_first_digit called with non-positive number:", n);
    if (n === 0) return 0; // Or based on desired behavior for 0
    return parseInt(Math.abs(n).toString()[0], 10); // Or throw error
  }
  return parseInt(n.toString()[0], 10);
}

function get_num_digits(n: number): number {
  if (n === 0) return 1;
  return Math.abs(n).toString().length;
}

// New helper function to get weighted d2s for a column operation
const getWeightedD2sForColumn = (
  matrixKey: string,
  d1ForMatrix: number,
  weightingMultiplier: number, // now addSubWeightingMultiplier
  scenario: number, // now addSubScenario
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
  settings: QuestionSettings, // Specifically needs addSub settings
  currentRunningTotal: number,
  numDigitsForOperand: number,
): number | null => {
  const { addSubScenario, addSubWeightingMultiplier } = settings;
  if (addSubScenario === undefined || addSubWeightingMultiplier === undefined) {
    throw new Error("Missing addSubScenario or addSubWeightingMultiplier in settings for add operation.");
  }
  let N_add_val = 0;
  let current_R_N_sum_carry = 0;
  let place_value = 1;

  for (let j = 0; j < numDigitsForOperand; j++) { // j is columnIndex
    const r_j = getDigit(currentRunningTotal, j);
    const d1_for_matrix = (r_j + current_R_N_sum_carry) % 10;
    const matrixKey = `${addSubScenario}-addition`;
    
    const possible_n_j_digits = getWeightedD2sForColumn(
      matrixKey, d1_for_matrix, addSubWeightingMultiplier, addSubScenario, currentRunningTotal, j, "addition"
    );

    if (possible_n_j_digits.length === 0) return null; // Cannot form operand
    
    let n_j = possible_n_j_digits[Math.floor(settings.rng!() * possible_n_j_digits.length)];
    if (j === numDigitsForOperand - 1 && n_j === 0 && numDigitsForOperand > 1) { // Leading zero avoidance
      const nonZeroDigits = possible_n_j_digits.filter(d => d !== 0);
      if (nonZeroDigits.length > 0) {
        n_j = nonZeroDigits[Math.floor(settings.rng!() * nonZeroDigits.length)];
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
  settings: QuestionSettings, // Specifically needs addSub settings
  currentRunningTotal: number,
  numDigitsForOperand: number,
): number | null => {
  const { addSubScenario, addSubWeightingMultiplier } = settings;
  if (addSubScenario === undefined || addSubWeightingMultiplier === undefined) {
    throw new Error("Missing addSubScenario or addSubWeightingMultiplier in settings for sub operation.");
  }
  let N_sub_val = 0;
  let current_R_N_sub_borrow = 0;
  let place_value = 1;

  for (let j = 0; j < numDigitsForOperand; j++) { // j is columnIndex
    const r_j = getDigit(currentRunningTotal, j);
    const val_on_rod_before_n_j_op = r_j - current_R_N_sub_borrow;
    const d1_for_matrix = (val_on_rod_before_n_j_op + 1000) % 10;
    const matrixKey = `${addSubScenario}-subtraction`;

    const possible_n_j_digits = getWeightedD2sForColumn(
      matrixKey, d1_for_matrix, addSubWeightingMultiplier, addSubScenario, currentRunningTotal, j, "subtraction"
    );
    
    if (possible_n_j_digits.length === 0) return null; // Cannot form operand

    let n_j = possible_n_j_digits[Math.floor(settings.rng!() * possible_n_j_digits.length)];
    if (j === numDigitsForOperand - 1 && n_j === 0 && numDigitsForOperand > 1) { // Leading zero avoidance
      const nonZeroDigits = possible_n_j_digits.filter(d => d !== 0);
      if (nonZeroDigits.length > 0) {
        n_j = nonZeroDigits[Math.floor(settings.rng!() * nonZeroDigits.length)];
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

// New function to generate potential multi-digit operands (for Add/Sub)
const generatePotentialAddSubOperands = (
  settings: QuestionSettings, // Specifically needs addSub settings
  currentRunningTotal: number,
  numDigitsForOperand: number,
): number[] => {
  const { addSubScenario, addSubWeightingMultiplier } = settings;
  if (addSubScenario === undefined || addSubWeightingMultiplier === undefined) {
    throw new Error("Missing addSubScenario or addSubWeightingMultiplier in settings for potential operands.");
  }
  const potentialOperands: number[] = [];
  const TARGET_CANDIDATES_IN_LIST = 15; // How many candidates we try to generate for the list

  // Calculate probabilities based on ones-column options (d1 for this is current ones digit)
  const d1_for_prob_calc = getDigit(currentRunningTotal, 0);

  const add_options_col0 = getWeightedD2sForColumn(
    `${addSubScenario}-addition`, d1_for_prob_calc, addSubWeightingMultiplier, addSubScenario, currentRunningTotal, 0, "addition"
  );
  const sub_options_col0 = getWeightedD2sForColumn(
    `${addSubScenario}-subtraction`, d1_for_prob_calc, addSubWeightingMultiplier, addSubScenario, currentRunningTotal, 0, "subtraction"
  );

  const num_add_col0_options = add_options_col0.length;
  const num_sub_col0_viable_options = sub_options_col0.filter(d2 =>
    (d1_for_prob_calc >= d2) ||
    (addSubScenario >= 6 && d1_for_prob_calc < d2)
  ).length;
  
  let prob_add = 0.5;
  if (num_add_col0_options > 0 || num_sub_col0_viable_options > 0) {
    prob_add = num_add_col0_options / (num_add_col0_options + num_sub_col0_viable_options);
  }
  if (num_add_col0_options === 0 && num_sub_col0_viable_options > 0) prob_add = 0;
  if (num_sub_col0_viable_options === 0 && num_add_col0_options > 0) prob_add = 1;
  if (num_add_col0_options === 0 && num_sub_col0_viable_options === 0) return [];

  let attempts = 0;
  const MAX_TOTAL_ATTEMPTS = TARGET_CANDIDATES_IN_LIST * 2;

  while(potentialOperands.length < TARGET_CANDIDATES_IN_LIST && attempts < MAX_TOTAL_ATTEMPTS) {
    const isAddOperation = settings.rng!() < prob_add;
    attempts++;

    if (isAddOperation && num_add_col0_options > 0) {
      const N_add = generateSingleFullAddOperand(settings, currentRunningTotal, numDigitsForOperand);
      if (N_add !== null) {
        potentialOperands.push(N_add);
      }
    } else if (!isAddOperation && num_sub_col0_viable_options > 0) {
      const N_sub_abs = generateSingleFullSubOperand(settings, currentRunningTotal, numDigitsForOperand);
      if (N_sub_abs !== null) {
        if (currentRunningTotal - N_sub_abs >= 0) {
          potentialOperands.push(-N_sub_abs);
        }
      }
    }
  }
  return potentialOperands;
};

function generateAdditionSubtractionQuestion(settings: QuestionSettings): Question {
  const {
    minAddSubTerms,
    maxAddSubTerms,
    addSubScenario,
    minAddSubTermDigits,
    maxAddSubTermDigits,
    addSubWeightingMultiplier,
  } = settings;

  if (minAddSubTerms === undefined || maxAddSubTerms === undefined || addSubScenario === undefined ||
      minAddSubTermDigits === undefined || maxAddSubTermDigits === undefined || addSubWeightingMultiplier === undefined) {
    throw new Error("Missing required addition/subtraction settings.");
  }

  if (!minAddSubTermDigits || !maxAddSubTermDigits || minAddSubTermDigits <= 0 || maxAddSubTermDigits < minAddSubTermDigits) {
    throw new Error("Invalid minAddSubTermDigits or maxAddSubTermDigits.");
  }
  

  const operands: number[] = [];
  
  let firstNum = 0;
  const initialNumDigitsForFirstNum = Math.floor(settings.rng!() * (maxAddSubTermDigits - minAddSubTermDigits + 1)) + minAddSubTermDigits;
  let firstNumFound = false;

  for (let d = initialNumDigitsForFirstNum; d >= Math.max(1, minAddSubTermDigits); d--) {
    const potentialFirstOperands = generatePotentialAddSubOperands(settings, 0, d)
                                    .filter(op => op > 0);
    if (potentialFirstOperands.length > 0) {
      firstNum = potentialFirstOperands[Math.floor(settings.rng!() * potentialFirstOperands.length)];
      firstNumFound = true;
      break;
    }
  }

  if (!firstNumFound) {
    console.warn(`Multi-digit firstNum generation failed for addSubScenario ${addSubScenario}, digits ${initialNumDigitsForFirstNum}. Falling back to single digit.`);
    const simpleFirstNumDigits = getWeightedD2sForColumn(`${addSubScenario}-addition`, 0, addSubWeightingMultiplier, addSubScenario, 0, 0, "addition")
                                  .filter(dVal => dVal > 0);
    if (simpleFirstNumDigits.length > 0) {
        firstNum = simpleFirstNumDigits[Math.floor(settings.rng!() * simpleFirstNumDigits.length)];
        firstNumFound = true;
    } else {
        throw new Error(`addSubScenario ${addSubScenario} doesn\'t have valid starting values for d1=0, operation addition, to form even a single-digit first number.`);
    }
  }
  
  if (!firstNumFound || firstNum <= 0) {
    throw new Error(`Failed to generate a valid positive first number for addSubScenario ${addSubScenario}.`);
  }

  operands.push(firstNum);
  let runningTotal = firstNum;
  const totalOperandsInSequence = Math.floor(settings.rng!() * (maxAddSubTerms - minAddSubTerms + 1)) + minAddSubTerms;

  for (let i = 1; i < totalOperandsInSequence; i++) {
    const numDigitsForNextOperand = Math.floor(settings.rng!() * (maxAddSubTermDigits - minAddSubTermDigits + 1)) + minAddSubTermDigits;
    const potentialOperands = generatePotentialAddSubOperands(settings, runningTotal, numDigitsForNextOperand);

    if (potentialOperands.length === 0) {
      let foundFallback = false;
      for (let d = numDigitsForNextOperand - 1; d >= Math.max(1, minAddSubTermDigits) ; d--) {
        const fallbackOperands = generatePotentialAddSubOperands(settings, runningTotal, d);
        if (fallbackOperands.length > 0) {
          const nextNum = fallbackOperands[Math.floor(settings.rng!() * fallbackOperands.length)];
          operands.push(nextNum);
          runningTotal += nextNum;
          if (runningTotal < 0) {
             console.warn(`Generated a negative running total (fallback): ${runningTotal}. Question: ${operands.join(', ')}. Settings: ${JSON.stringify(settings)}`);
             throw new Error(`Generated a negative running total (fallback): ${runningTotal}.`);
          }
          foundFallback = true;
          break;
        }
      }
      if (!foundFallback) {
         throw new Error(`Unable to generate a valid next multi-digit number for addSubScenario ${addSubScenario} with current running total ${runningTotal} (digits: ${numDigitsForNextOperand}, weight: ${addSubWeightingMultiplier})`);
      }
      continue;
    }

    const nextNum = potentialOperands[Math.floor(settings.rng!() * potentialOperands.length)];
    operands.push(nextNum);
    runningTotal += nextNum;
    
    if (runningTotal < 0) {
      console.warn(`Generated a negative running total: ${runningTotal}. Question operands: ${operands.join(', ')}. Settings: ${JSON.stringify(settings)}`);
      throw new Error(`Generated a negative running total: ${runningTotal}. Check operand generation logic, especially for subtractions.`);
    }
  }

  const expectedAnswer = operands.reduce((sum, num) => sum + num, 0);
  if (expectedAnswer < 0) {
      console.warn(`Generated a question with a negative final answer: ${expectedAnswer}. Question: ${operands.join(', ')}`);
  }
  
  const questionString = operands.map((op, index) => {
    if (index === 0) return op.toString();
    return (op < 0 ? " - " : " + ") + Math.abs(op).toString();
  }).join("") + " =";

  return { operands, expectedAnswer, questionString, operationType: 'add_subtract' };
}

// Placeholder for Multiplication
function generateMultiplicationQuestion(settings: QuestionSettings): Question {
  const { term1Digits = 2, term2Digits = 2 } = settings; // Default values
  
  
  const factor1 = Math.floor(settings.rng!() * (Math.pow(10, term1Digits) - Math.pow(10, term1Digits -1))) + Math.pow(10, term1Digits -1);
  const factor2 = Math.floor(settings.rng!() * (Math.pow(10, term2Digits) - Math.pow(10, term2Digits -1))) + Math.pow(10, term2Digits -1);
  
  const expectedAnswer = factor1 * factor2;
  const questionString = `${factor1} x ${factor2} =`;
  
  return {
    operands: [factor1, factor2],
    expectedAnswer,
    questionString,
    operationType: 'multiply',
  };
}

// Translated and adapted division logic from python script
function generateDivisionQuestion(settings: QuestionSettings): Question {
  const {
    divisionFormulaType = 'TYPE1_CAT_GT_MICE1_2D', // Default if not provided
    // These are primarily for TYPE5_ANY_DIGITS, other types have implicit digit counts.
    divisorDigits: type5DivisorDigits,
    dividendDigitsMin: type5DividendDigitsMin,
    dividendDigitsMax: type5DividendDigitsMax,
  } = settings;

  let dividend = 0; // "mice"
  let divisor = 0;  // "cat"
  const maxAttemptsPerQuestion = 500; // Safety break for finding a question
  

  // Helper to get a random integer between min (inclusive) and max (inclusive)
  const getRandomInt = (min: number, max: number) => Math.floor(settings.rng!() * (max - min + 1)) + min;

  switch (divisionFormulaType) {
    case 'TYPE1_CAT_GT_MICE1_2D': // 2 digits / 1 digit (cat > first digit of mice)
      // Mice: 2 digits (10-99), Cat: 1 digit (2-9)
      // Condition: Cat > first digit of Mice
      for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
        const cat = getRandomInt(2, 9); // Cat must be at least 2
        const minQuotient = Math.ceil(10 / cat);
        const maxQuotient = Math.floor(99 / cat);

        if (minQuotient > maxQuotient) continue;

        const possibleQuotients: number[] = [];
        for (let qCand = minQuotient; qCand <= maxQuotient; qCand++) {
          const miceCand = cat * qCand;
          if (miceCand >= 10 && miceCand <= 99) {
            if (get_first_digit(miceCand) < cat) {
              possibleQuotients.push(qCand);
            }
          }
        }
        if (possibleQuotients.length > 0) {
          const quotient = possibleQuotients[getRandomInt(0, possibleQuotients.length - 1)];
          dividend = cat * quotient;
          divisor = cat;
          break;
        }
      }
      if (dividend === 0) { // Fallback if no question found
        console.warn(`Failed to generate TYPE1 division question after ${maxAttemptsPerQuestion} attempts. Using fallback.`);
        divisor = 2; dividend = 10; // Simple fallback 10 / 2
      }
      break;

    case 'TYPE2_CAT_GT_MICE1_3D': // 3 digits / 1 digit (cat > first digit of mice)
      // Mice: 3 digits (100-999), Cat: 1 digit (2-9)
      for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
        const catCand = getRandomInt(2, 9);
        const minQuotient = Math.ceil(100 / catCand);
        const maxQuotient = Math.floor(999 / catCand);

        if (minQuotient > maxQuotient) continue;

        const possibleQuotients: number[] = [];
        for (let qCand = minQuotient; qCand <= maxQuotient; qCand++) {
          const miceCand = catCand * qCand;
          if (miceCand >= 100 && miceCand <= 999) {
            if (get_first_digit(miceCand) < catCand) {
              possibleQuotients.push(qCand);
            }
          }
        }
        if (possibleQuotients.length > 0) {
          const quotient = possibleQuotients[getRandomInt(0, possibleQuotients.length - 1)];
          dividend = catCand * quotient;
          divisor = catCand;
          break;
        }
      }
      if (dividend === 0) {
        console.warn(`Failed to generate TYPE2 division. Fallback.`);
        divisor = 2; dividend = 100;
      }
      break;

    case 'TYPE3_CAT_EQ_MICE1_2OR3D': // 2 or 3 digits / 1 digit (cat = first digit of mice)
      // Cat: 1-9. Mice: 2 or 3 digits.
      for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
        const catCand = getRandomInt(2, 9); // Changed from 1-9 to 2-9 to exclude divisor of 1
        const numMiceDigits = getRandomInt(0, 1) === 0 ? 2 : 3; // 50/50 chance for 2 or 3 digits

        const minMiceVal = Math.pow(10, numMiceDigits - 1);
        const maxMiceVal = Math.pow(10, numMiceDigits) - 1;
        
        const minQuotient = Math.ceil(minMiceVal / catCand);
        const maxQuotient = Math.floor(maxMiceVal / catCand);

        if (minQuotient > maxQuotient) continue;

        const possibleQuotients: number[] = [];
        for (let qCand = minQuotient; qCand <= maxQuotient; qCand++) {
          const miceCand = catCand * qCand;
          if (get_num_digits(miceCand) === numMiceDigits) {
            if (get_first_digit(miceCand) === catCand) {
              possibleQuotients.push(qCand);
            }
          }
        }
        if (possibleQuotients.length > 0) {
          const quotient = possibleQuotients[getRandomInt(0, possibleQuotients.length - 1)];
          dividend = catCand * quotient;
          divisor = catCand;
          break;
        }
      }
      if (dividend === 0) {
        console.warn(`Failed to generate TYPE3 division. Fallback.`);
        // Try to make a simple one where cat = first_digit(mice)
        divisor = getRandomInt(1,9);
        dividend = divisor * (10 + getRandomInt(0, (99/divisor)-10)); // for 2-digit
        if(get_first_digit(dividend) !== divisor || get_num_digits(dividend) !== 2) { // if that failed, more basic
            divisor = 2; dividend = 24;
        }
      }
      break;

    case 'TYPE4_CAT_LT_MICE1_2D': // 2 digits / 1 digit (cat < first digit of mice)
      // Cat: 1-8 (if cat is 9, first_digit(mice) cannot be > cat)
      // Mice: 2 digits (10-99)
      for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
        const catCand = getRandomInt(2, 8); // Changed from 1-8 to 2-8 to exclude divisor of 1
        const minQuotient = Math.ceil(10 / catCand);
        const maxQuotient = Math.floor(99 / catCand);

        if (minQuotient > maxQuotient) continue;

        const possibleQuotients: number[] = [];
        for (let qCand = minQuotient; qCand <= maxQuotient; qCand++) {
          const miceCand = catCand * qCand;
          if (miceCand >= 10 && miceCand <= 99) {
            if (get_first_digit(miceCand) > catCand) {
              possibleQuotients.push(qCand);
            }
          }
        }
        if (possibleQuotients.length > 0) {
          const quotient = possibleQuotients[getRandomInt(0, possibleQuotients.length - 1)];
          dividend = catCand * quotient;
          divisor = catCand;
          break;
        }
      }
      if (dividend === 0) {
        console.warn(`Failed to generate TYPE4 division. Fallback.`);
        divisor = 2; dividend = 42; // 4 > 2
      }
      break;

    case 'TYPE5_ANY_DIGITS': // Any number of digits for both divisor and dividend
      const numCatDigits = type5DivisorDigits || 1;
      const minMiceDigits = type5DividendDigitsMin || 2;
      const maxMiceDigits = type5DividendDigitsMax || Math.max(2, minMiceDigits + 1);

      // Generate divisor with specified number of digits
      const divisorMin = Math.max(2, Math.pow(10, numCatDigits - 1)); // Ensure at least 2 to avoid divisor of 1
      const divisorMax = Math.pow(10, numCatDigits) - 1;
      let catType5 = getRandomInt(divisorMin, divisorMax);

      for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
        const numMiceSelectedDigits = getRandomInt(minMiceDigits, maxMiceDigits);
        const minMiceVal = Math.pow(10, numMiceSelectedDigits - 1);
        const maxMiceVal = Math.pow(10, numMiceSelectedDigits) - 1;

        // For multi-digit divisors, we need to be careful with ranges to ensure valid division
        const minQuotient = Math.max(2, Math.ceil(minMiceVal / catType5)); // Ensure quotient is at least 2
        const maxQuotient = Math.floor(maxMiceVal / catType5);

        if (minQuotient > maxQuotient) {
          // If we can't find a valid quotient with current constraints, try another divisor
          if (attempt % 10 === 0) { // Every 10 attempts, try a new divisor
            catType5 = getRandomInt(divisorMin, divisorMax);
          }
          continue;
        }
        
        const quotient = getRandomInt(minQuotient, maxQuotient);
        const miceCand = catType5 * quotient;

        if (get_num_digits(miceCand) === numMiceSelectedDigits) {
          dividend = miceCand;
          divisor = catType5;
          break;
        }
      }
      
      if (dividend === 0) {
        console.warn(`Failed to generate TYPE5 division question. Using fallback.`);
        // Generate a fallback with the specified number of digits for divisor
        const fallbackDivisorMin = Math.max(2, Math.pow(10, numCatDigits - 1));
        const fallbackDivisorMax = Math.pow(10, numCatDigits) - 1;
        divisor = getRandomInt(fallbackDivisorMin, fallbackDivisorMax);
        
        // Generate a dividend that's divisible by the divisor
        let tempDividend = divisor * getRandomInt(2, 15); // basic fallback
        // Try to match min digits at least
        while(get_num_digits(tempDividend) < minMiceDigits && minMiceDigits > 0) {
          tempDividend *= 10;
        }
        dividend = Math.ceil(tempDividend/divisor) * divisor;
      }
      break;
    default:
      console.warn(`Division formula type ${divisionFormulaType} not implemented or unknown. Using fallback 10 / 2.`);
      divisor = 2;
      dividend = 10;
  }

  if (divisor === 0) { // Absolute fallback to prevent division by zero
    console.error("Divisor is zero in generateDivisionQuestion, this should not happen. Fallback to 10/2");
    divisor = 2;
    dividend = 10;
  }
  
  const expectedAnswer = dividend / divisor;
  // Ensure expectedAnswer is an integer, adjust dividend if necessary (though logic above should handle it)
  if (Math.floor(expectedAnswer) !== expectedAnswer) {
      console.warn(`Non-integer answer for ${dividend}/${divisor}. Adjusting dividend.`);
      dividend = Math.floor(expectedAnswer) * divisor; // This might change dividend from intended type
      // A better approach for non-integer would be to regenerate or use specific "allow remainder" logic
  }


  const questionString = `${dividend} ÷ ${divisor} =`;
  
  return {
    operands: [dividend, divisor],
    expectedAnswer: dividend / divisor, // Recalculate in case dividend was adjusted
    questionString,
    operationType: 'divide',
  };
}

export function generateQuestion(settings: QuestionSettings): Question {
  switch (settings.operationType) {
    case 'add_subtract':
      return generateAdditionSubtractionQuestion(settings);
    case 'multiply':
      return generateMultiplicationQuestion(settings);
    case 'divide':
      return generateDivisionQuestion(settings);
    default:
      // Fallback or error, though TypeScript should ensure operationType is valid
      console.error("Unknown operation type:", settings.operationType);
      // As a fallback, generate an add/subtract question if settings are somewhat compatible
      // Or throw an error if settings are completely incompatible.
      // For now, simple fallback with a warning.
      if(settings.minAddSubTerms !== undefined) { // A loose check
         return generateAdditionSubtractionQuestion(settings);
      }
      throw new Error(`Unsupported operation type: ${settings.operationType}`);
  }
}