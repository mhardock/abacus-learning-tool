import { QuestionSettings, OperationType } from '../lib/question-types';

type DivisionFormulaType = 'TYPE1_CAT_GT_MICE1_2D' | 'TYPE2_CAT_GT_MICE1_3D' | 'TYPE3_CAT_EQ_MICE1_2OR3D' | 'TYPE4_CAT_LT_MICE1_2D' | 'TYPE5_ANY_DIGITS';

const OPERATION_TYPE_MAP: Record<OperationType, number> = {
  'add_subtract': 0,
  'multiply': 1,
  'divide': 2,
};

const REVERSE_OPERATION_TYPE_MAP: Record<number, OperationType> = {
  0: 'add_subtract',
  1: 'multiply',
  2: 'divide',
};

const DIVISION_FORMULA_TYPE_MAP: Record<DivisionFormulaType, number> = {
  'TYPE1_CAT_GT_MICE1_2D': 0,
  'TYPE2_CAT_GT_MICE1_3D': 1,
  'TYPE3_CAT_EQ_MICE1_2OR3D': 2,
  'TYPE4_CAT_LT_MICE1_2D': 3,
  'TYPE5_ANY_DIGITS': 4,
};

const REVERSE_DIVISION_FORMULA_TYPE_MAP: Record<number, DivisionFormulaType> = {
  0: 'TYPE1_CAT_GT_MICE1_2D',
  1: 'TYPE2_CAT_GT_MICE1_3D',
  2: 'TYPE3_CAT_EQ_MICE1_2OR3D',
  3: 'TYPE4_CAT_LT_MICE1_2D',
  4: 'TYPE5_ANY_DIGITS',
};

/**
 * Compresses a QuestionSettings object into a string using lz-string.
 * @param settings The QuestionSettings object to compress.
 * @returns The compressed string.
 */
export function compressSettings(settings: QuestionSettings): string {
  let dataString: string;
  const operationTypeInt = OPERATION_TYPE_MAP[settings.operationType];

  switch (settings.operationType) {
    case 'add_subtract':
      dataString = [
        operationTypeInt,
        settings.seed,
        settings.minAddSubTerms,
        settings.maxAddSubTerms,
        settings.addSubScenario,
        settings.addSubWeightingMultiplier,
        settings.minAddSubTermDigits,
        settings.maxAddSubTermDigits,
      ].join(',');
      break;
    case 'multiply':
      dataString = [
        operationTypeInt,
        settings.seed,
        settings.term1Digits,
        settings.term2Digits,
      ].join(',');
      break;
    case 'divide':
      if (settings.divisionFormulaType === undefined) {
        throw new Error("divisionFormulaType is undefined for divide operation.");
      }
      const divisionFormulaTypeInt = DIVISION_FORMULA_TYPE_MAP[settings.divisionFormulaType as DivisionFormulaType];
      dataString = [
        operationTypeInt,
        settings.seed,
        divisionFormulaTypeInt,
        settings.divisorDigits,
        settings.dividendDigitsMin,
        settings.dividendDigitsMax,
      ].join(',');
      break;
    default:
      throw new Error(`Unknown operation type: ${settings.operationType}`);
  }

  return dataString;
}

/**
 * Decompresses a string into a QuestionSettings object using lz-string.
 * @param compressedString The compressed string to decompress.
 * @returns The decompressed QuestionSettings object.
 */
export function decompressSettings(compressedString: string): QuestionSettings {
  const decompressed = compressedString;
  if (decompressed === null) {
    throw new Error("Failed to decompress string. It might be invalid or corrupted.");
  }

  const parts = decompressed.split(',');
  const operationTypeInt = parseInt(parts[0], 10);
  const operationType = REVERSE_OPERATION_TYPE_MAP[operationTypeInt];

  const settings: Partial<QuestionSettings> = { operationType };

  switch (operationType) {
    case 'add_subtract':
      settings.seed = parts[1]; // seed is string
      settings.minAddSubTerms = parseInt(parts[2], 10);
      settings.maxAddSubTerms = parseInt(parts[3], 10);
      settings.addSubScenario = parseInt(parts[4], 10); // addSubScenario is number
      settings.addSubWeightingMultiplier = parseFloat(parts[5]);
      settings.minAddSubTermDigits = parseInt(parts[6], 10);
      settings.maxAddSubTermDigits = parseInt(parts[7], 10);
      break;
    case 'multiply':
      settings.seed = parts[1]; // seed is string
      settings.term1Digits = parseInt(parts[2], 10);
      settings.term2Digits = parseInt(parts[3], 10);
      break;
    case 'divide':
      settings.seed = parts[1]; // seed is string
      const divisionFormulaTypeInt = parseInt(parts[2], 10);
      settings.divisionFormulaType = REVERSE_DIVISION_FORMULA_TYPE_MAP[divisionFormulaTypeInt];
      settings.divisorDigits = parseInt(parts[3], 10);
      settings.dividendDigitsMin = parseInt(parts[4], 10);
      settings.dividendDigitsMax = parseInt(parts[5], 10);
      break;
    default:
      throw new Error(`Unknown operation type: ${operationType}`);
  }

  return settings as QuestionSettings;
}