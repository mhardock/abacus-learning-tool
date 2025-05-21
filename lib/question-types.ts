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
}

export interface Question {
  operands: number[];
  expectedAnswer: number;
  questionString: string; // e.g., "12 + 34 - 5 =", "12 x 34 =", "100 / 5 ="
  operationType: OperationType;
}

export function grabOperationSettings(settings: QuestionSettings): Partial<QuestionSettings> {
  const baseSettings: Partial<QuestionSettings> = {
    operationType: settings.operationType,
    seed: settings.seed,
  };

  switch (settings.operationType) {
    case 'add_subtract':
      return {
        ...baseSettings,
        minAddSubTerms: settings.minAddSubTerms,
        maxAddSubTerms: settings.maxAddSubTerms,
        addSubScenario: settings.addSubScenario,
        addSubWeightingMultiplier: settings.addSubWeightingMultiplier,
        minAddSubTermDigits: settings.minAddSubTermDigits,
        maxAddSubTermDigits: settings.maxAddSubTermDigits,
      };
    case 'multiply':
      return {
        ...baseSettings,
        term1Digits: settings.term1Digits,
        term2Digits: settings.term2Digits,
      };
    case 'divide':
      return {
        ...baseSettings,
        divisionFormulaType: settings.divisionFormulaType,
        divisorDigits: settings.divisorDigits,
        dividendDigitsMin: settings.dividendDigitsMin,
        dividendDigitsMax: settings.dividendDigitsMax,
      };
    default:
      return baseSettings;
  }
}