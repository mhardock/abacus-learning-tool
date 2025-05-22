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

export function generateAdditionSubtractionQuestion(settings: QuestionSettings): Question {
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