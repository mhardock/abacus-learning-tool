export type OperationType = 'add_subtract' | 'multiply' | 'divide';

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
  term1Digits?: number;
  term2Digits?: number;

  // Division specific
  divisionFormulaType?: string;
  divisorDigits?: number;
  dividendDigitsMin?: number;
  dividendDigitsMax?: number;
  
  // Random seed
  seed?: string;
  rng: () => number;
}

export interface Question {
  operands: number[];
  expectedAnswer: number;
  questionString: string; // e.g., "12 + 34 - 5 =", "12 x 34 =", "100 / 5 ="
  operationType: OperationType;
}