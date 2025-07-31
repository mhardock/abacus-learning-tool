export enum OperationType {
  ADD_SUBTRACT = 'add_subtract',
  MULTIPLY = 'multiplication',
  DIVIDE = 'division'
}

export interface QuestionSettings {
  operationType: OperationType;

  // Addition/Subtraction specific
  minAddSubTerms?: number;
  maxAddSubTerms?: number;
  addSubScenario?: number;
  addSubWeightingMultiplier?: number;
  minAddSubTermDigits?: number;
  maxAddSubTermDigits?: number;

  // Multiplication specific
  term1DigitsMultiply?: number;
  term2DigitsMultiply?: number;
  ruleString?: string;
  processedRules?: string[] | null;
  isTimesTableMode?: boolean;
  timesTableTerm1Min?: number;
  timesTableTerm1Max?: number;
  timesTableTerm2Min?: number;
  timesTableTerm2Max?: number;

  // Division specific
  divisionFormulaType?: string;
  divisorDigits?: number;
  dividendDigitsMin?: number;
  dividendDigitsMax?: number;
  
  // Random seed
  seed?: string;
  rng: () => number;
  
  // Abacus display settings
  numberOfAbacusColumns?: number;
}

export interface Question {
  operands: number[];
  expectedAnswer: number;
  questionString: string; // e.g., "12 + 34 - 5 =", "12 x 34 =", "100 / 5 ="
  operationType: OperationType;
}