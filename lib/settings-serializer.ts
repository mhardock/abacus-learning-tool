import { QuestionSettings, OperationType } from '../lib/question-types';
import { parseRules } from './multiplication-rules';
import { defaultSettings } from './settings-utils';

type DivisionFormulaType = 'TYPE1_CAT_GT_MICE1_2D' | 'TYPE2_CAT_GT_MICE1_3D' | 'TYPE3_CAT_EQ_MICE1_2OR3D' | 'TYPE4_CAT_LT_MICE1_2D' | 'TYPE5_ANY_DIGITS';

const OPERATION_TYPE_MAP: Record<OperationType, number> = {
  [OperationType.ADD_SUBTRACT]: 0,
  [OperationType.MULTIPLY]: 1,
  [OperationType.DIVIDE]: 2,
};

const REVERSE_OPERATION_TYPE_MAP: Record<number, OperationType> = {
  0: OperationType.ADD_SUBTRACT,
  1: OperationType.MULTIPLY,
  2: OperationType.DIVIDE,
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
 * Serializes a QuestionSettings object into a comma-separated string suitable for URL parameters.
 * The format depends on the `operationType`:
 * - 'add_subtract': operationTypeInt, seed, minAddSubTerms, maxAddSubTerms, addSubScenario, addSubWeightingMultiplier, minAddSubTermDigits, maxAddSubTermDigits
 * - 'multiply': operationTypeInt, seed, term1Digits, term2Digits
 * - 'divide': operationTypeInt, seed, divisionFormulaTypeInt, divisorDigits, dividendDigitsMin, dividendDigitsMax
 * @param settings The QuestionSettings object to serialize.
 * @returns The serialized string.
 */
export function serializeSettingsForUrl(settings: QuestionSettings): string {
  let dataString: string;
  const operationTypeInt = OPERATION_TYPE_MAP[settings.operationType];

  switch (settings.operationType) {
    case OperationType.ADD_SUBTRACT:
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
    case OperationType.MULTIPLY:
      dataString = [
        operationTypeInt,
        settings.seed,
        settings.ruleString,
      ].join(',');
      break;
    case OperationType.DIVIDE:
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
 * Deserializes a comma-separated string from a URL parameter back into a QuestionSettings object.
 * @param serializedString The serialized string to deserialize.
 * @returns The deserialized QuestionSettings object.
 */
export function deserializeSettingsFromUrl(serializedString: string): QuestionSettings {
  const decompressed = serializedString;
  if (decompressed === null) {
    throw new Error("Failed to decompress string. It might be invalid or corrupted.");
  }

  const parts = decompressed.split(',');
  const operationTypeInt = parseInt(parts[0], 10);
  const operationType = REVERSE_OPERATION_TYPE_MAP[operationTypeInt];

  const settings: Partial<QuestionSettings> = { operationType };

  switch (operationType) {
    case OperationType.ADD_SUBTRACT:
      settings.seed = parts[1]; // seed is string
      settings.minAddSubTerms = parseInt(parts[2], 10);
      settings.maxAddSubTerms = parseInt(parts[3], 10);
      settings.addSubScenario = parseInt(parts[4], 10); // addSubScenario is number
      settings.addSubWeightingMultiplier = parseFloat(parts[5]);
      settings.minAddSubTermDigits = parseInt(parts[6], 10);
      settings.maxAddSubTermDigits = parseInt(parts[7], 10);
      break;
    case OperationType.MULTIPLY:
      settings.seed = parts[1]; // seed is string
      settings.ruleString = parts[2];
      settings.processedRules = parseRules(parts[2]);
      break;
    case OperationType.DIVIDE:
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

/**
 * Serializes QuestionSettings into a query string object for URL parameters.
 * @param settings The QuestionSettings object to serialize.
 * @returns An object with URL parameter key-value pairs.
 */
export function serializeSettings(settings: QuestionSettings): Record<string, string> {
  const params: Record<string, string> = {
    nac: (settings.numberOfAbacusColumns ?? defaultSettings.numberOfAbacusColumns ?? 7).toString(),
  };

  const operationTypeInt = OPERATION_TYPE_MAP[settings.operationType];
  params.ot = operationTypeInt.toString();

  if (settings.seed) {
    params.seed = settings.seed;
  }

  switch (settings.operationType) {
    case OperationType.ADD_SUBTRACT:
      params.mint = settings.minAddSubTerms?.toString() || '';
      params.maxt = settings.maxAddSubTerms?.toString() || '';
      params.sc = settings.addSubScenario?.toString() || '';
      params.wm = settings.addSubWeightingMultiplier?.toString() || '';
      params.mind = settings.minAddSubTermDigits?.toString() || '';
      params.maxd = settings.maxAddSubTermDigits?.toString() || '';
      break;
    case OperationType.MULTIPLY:
      if (settings.ruleString) {
        params.rules = settings.ruleString;
      }
      break;
    case OperationType.DIVIDE:
      if (settings.divisionFormulaType) {
        const divisionFormulaTypeInt = DIVISION_FORMULA_TYPE_MAP[settings.divisionFormulaType as DivisionFormulaType];
        params.dft = divisionFormulaTypeInt.toString();
      }
      params.dd = settings.divisorDigits?.toString() || '';
      params.dmin = settings.dividendDigitsMin?.toString() || '';
      params.dmax = settings.dividendDigitsMax?.toString() || '';
      break;
  }

  return params;
}

/**
 * Deserializes URL query parameters back into a QuestionSettings object.
 * @param params The URL search parameters to deserialize.
 * @returns A partial QuestionSettings object that can be merged with defaults.
 */
export function deserializeSettings(params: URLSearchParams): Partial<QuestionSettings> {
  const settings: Partial<QuestionSettings> = {};

  // Parse numberOfAbacusColumns
  const nacParam = params.get('nac');
  if (nacParam !== null) {
    const nacValue = parseInt(nacParam, 10);
    if (!isNaN(nacValue)) {
      settings.numberOfAbacusColumns = nacValue;
    }
  }

  // Parse operation type
  const otParam = params.get('ot');
  if (otParam !== null) {
    const operationTypeInt = parseInt(otParam, 10);
    const operationType = REVERSE_OPERATION_TYPE_MAP[operationTypeInt];
    if (operationType) {
      settings.operationType = operationType;
    }
  }

  // Parse seed
  const seedParam = params.get('seed');
  if (seedParam !== null) {
    settings.seed = seedParam;
  }

  // Parse operation-specific parameters
  if (settings.operationType === OperationType.ADD_SUBTRACT) {
    const mintParam = params.get('mint');
    if (mintParam !== null) {
      const value = parseInt(mintParam, 10);
      if (!isNaN(value)) settings.minAddSubTerms = value;
    }

    const maxtParam = params.get('maxt');
    if (maxtParam !== null) {
      const value = parseInt(maxtParam, 10);
      if (!isNaN(value)) settings.maxAddSubTerms = value;
    }

    const scParam = params.get('sc');
    if (scParam !== null) {
      const value = parseInt(scParam, 10);
      if (!isNaN(value)) settings.addSubScenario = value;
    }

    const wmParam = params.get('wm');
    if (wmParam !== null) {
      const value = parseFloat(wmParam);
      if (!isNaN(value)) settings.addSubWeightingMultiplier = value;
    }

    const mindParam = params.get('mind');
    if (mindParam !== null) {
      const value = parseInt(mindParam, 10);
      if (!isNaN(value)) settings.minAddSubTermDigits = value;
    }

    const maxdParam = params.get('maxd');
    if (maxdParam !== null) {
      const value = parseInt(maxdParam, 10);
      if (!isNaN(value)) settings.maxAddSubTermDigits = value;
    }
  } else if (settings.operationType === OperationType.MULTIPLY) {
    const rulesParam = params.get('rules');
    if (rulesParam !== null) {
      settings.ruleString = rulesParam;
      settings.processedRules = parseRules(rulesParam);
    }
  } else if (settings.operationType === OperationType.DIVIDE) {
    const dftParam = params.get('dft');
    if (dftParam !== null) {
      const divisionFormulaTypeInt = parseInt(dftParam, 10);
      const divisionFormulaType = REVERSE_DIVISION_FORMULA_TYPE_MAP[divisionFormulaTypeInt];
      if (divisionFormulaType) {
        settings.divisionFormulaType = divisionFormulaType;
      }
    }

    const ddParam = params.get('dd');
    if (ddParam !== null) {
      const value = parseInt(ddParam, 10);
      if (!isNaN(value)) settings.divisorDigits = value;
    }

    const dminParam = params.get('dmin');
    if (dminParam !== null) {
      const value = parseInt(dminParam, 10);
      if (!isNaN(value)) settings.dividendDigitsMin = value;
    }

    const dmaxParam = params.get('dmax');
    if (dmaxParam !== null) {
      const value = parseInt(dmaxParam, 10);
      if (!isNaN(value)) settings.dividendDigitsMax = value;
    }
  }

  return settings;
}