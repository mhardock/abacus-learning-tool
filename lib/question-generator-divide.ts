import { QuestionSettings, Question, OperationType } from '../lib/question-types';

// Helper functions for division
function get_first_digit(n: number): number {
  if (n <= 0) {
    console.warn("get_first_digit called with non-positive number:", n);
    if (n === 0) return 0;
    return parseInt(Math.abs(n).toString()[0], 10);
  }
  return parseInt(n.toString()[0], 10);
}

function get_num_digits(n: number): number {
  if (n === 0) return 1;
  return Math.abs(n).toString().length;
}

const maxAttemptsPerQuestion = 500; // Safety break for finding a question

// Interface for individual formula generation logic
interface DivisionFormulaGenerator {
  (settings: QuestionSettings, getRandomInt: (min: number, max: number) => number): { dividend: number; divisor: number };
}

// Registry of formula generators
const formulaGenerators: Record<string, DivisionFormulaGenerator> = {
  'TYPE1_CAT_GT_MICE1_2D': (settings, getRandomInt) => {
    let dividend = 0;
    let divisor = 0;
    // Mice: 2 digits (10-99), Cat: 1 digit (2-9)
    // Condition: Cat > first digit of Mice
    for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
      const cat = getRandomInt(2, 9);
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
    if (dividend === 0) {
      console.warn(`Failed to generate TYPE1 division question after ${maxAttemptsPerQuestion} attempts. Using fallback.`);
      return { divisor: 2, dividend: 10 };
    }
    return { dividend, divisor };
  },

  'TYPE2_CAT_GT_MICE1_3D': (settings, getRandomInt) => {
    let dividend = 0;
    let divisor = 0;
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
      return { divisor: 2, dividend: 100 };
    }
    return { dividend, divisor };
  },

  'TYPE3_CAT_EQ_MICE1_2OR3D': (settings, getRandomInt) => {
    let dividend = 0;
    let divisor = 0;
    // Cat: 1-9. Mice: 2 or 3 digits.
    for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
      const catCand = getRandomInt(2, 9);
      const numMiceDigits = getRandomInt(0, 1) === 0 ? 2 : 3;

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
      const fbDivisor = getRandomInt(2,9); // Ensure divisor is not 1 for fallback too
      const fbDividend = fbDivisor * (10 + getRandomInt(0, Math.floor(99/fbDivisor)-10));
      if(get_first_digit(fbDividend) !== fbDivisor || get_num_digits(fbDividend) !== 2) {
          return { divisor: 2, dividend: 24 };
      }
      return { divisor: fbDivisor, dividend: fbDividend };
    }
    return { dividend, divisor };
  },

  'TYPE4_CAT_LT_MICE1_2D': (settings, getRandomInt) => {
    let dividend = 0;
    let divisor = 0;
    // Cat: 1-8 (if cat is 9, first_digit(mice) cannot be > cat)
    // Mice: 2 digits (10-99)
    for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
      const catCand = getRandomInt(2, 8);
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
      return { divisor: 2, dividend: 42 }; // 4 > 2
    }
    return { dividend, divisor };
  },

  'TYPE5_ANY_DIGITS': (settings, getRandomInt) => {
    let dividend = 0;
    let divisor = 0;
    const {
      divisorDigits: type5DivisorDigits,
      dividendDigitsMin: type5DividendDigitsMin,
      dividendDigitsMax: type5DividendDigitsMax,
    } = settings;

    const numCatDigits = type5DivisorDigits || 1;
    const minMiceDigits = type5DividendDigitsMin || 2;
    const maxMiceDigits = type5DividendDigitsMax || Math.max(2, minMiceDigits + 1);

    const divisorMin = Math.max(2, Math.pow(10, numCatDigits - 1));
    const divisorMax = Math.pow(10, numCatDigits) - 1;
    let catType5 = getRandomInt(divisorMin, divisorMax);

    for (let attempt = 0; attempt < maxAttemptsPerQuestion; attempt++) {
      const numMiceSelectedDigits = getRandomInt(minMiceDigits, maxMiceDigits);
      const minMiceVal = Math.pow(10, numMiceSelectedDigits - 1);
      const maxMiceVal = Math.pow(10, numMiceSelectedDigits) - 1;

      const minQuotient = Math.max(2, Math.ceil(minMiceVal / catType5));
      const maxQuotient = Math.floor(maxMiceVal / catType5);

      if (minQuotient > maxQuotient) {
        if (attempt % 10 === 0) {
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
      const fallbackDivisorMin = Math.max(2, Math.pow(10, numCatDigits - 1));
      const fallbackDivisorMax = Math.pow(10, numCatDigits) - 1;
      const fbDivisor = getRandomInt(fallbackDivisorMin, fallbackDivisorMax);
      
      let tempDividend = fbDivisor * getRandomInt(2, 15);
      while(get_num_digits(tempDividend) < minMiceDigits && minMiceDigits > 0) {
        tempDividend *= 10; // Increase magnitude to meet minMiceDigits
        if (tempDividend > Math.pow(10, maxMiceDigits)) { // Avoid excessively large numbers
            tempDividend = Math.pow(10, minMiceDigits); // Reset to min if it grows too large
            break;
        }
      }
      // Ensure it's perfectly divisible and meets digit criteria as best as possible
      let fbDividend = Math.ceil(tempDividend/fbDivisor) * fbDivisor;
      // If dividend became too small due to ceiling, try to make it larger
      if (minMiceDigits > 0 && get_num_digits(fbDividend) < minMiceDigits) {
          fbDividend = fbDivisor * Math.pow(10, minMiceDigits - get_num_digits(fbDivisor) > 0 ? minMiceDigits - get_num_digits(fbDivisor) : 1 );
          fbDividend = Math.ceil(fbDividend/fbDivisor) * fbDivisor; // ensure divisibility
      }


      return { divisor: fbDivisor, dividend: fbDividend };
    }
    return { dividend, divisor };
  },
};

export function generateDivisionQuestion(settings: QuestionSettings): Question {
  const {
    divisionFormulaType = 'TYPE1_CAT_GT_MICE1_2D',
  } = settings;

  const getRandomInt = (min: number, max: number) => Math.floor(settings.rng!() * (max - min + 1)) + min;

  let dividend = 0;
  let divisor = 0;

  const generator = formulaGenerators[divisionFormulaType];

  if (generator) {
    const result = generator(settings, getRandomInt);
    dividend = result.dividend;
    divisor = result.divisor;
  } else {
    console.warn(`Division formula type ${divisionFormulaType} not implemented or unknown. Using fallback 10 / 2.`);
    divisor = 2;
    dividend = 10;
  }

  if (divisor === 0) { // Absolute fallback to prevent division by zero
    console.error("Divisor is zero in generateDivisionQuestion, this should not happen. Fallback to 10/2");
    divisor = 2;
    dividend = 10;
  }
  
  let expectedAnswer = dividend / divisor;
  // Ensure expectedAnswer is an integer
  if (Math.floor(expectedAnswer) !== expectedAnswer) {
      // This case should ideally be prevented by generators ensuring dividend is a multiple of divisor.
      // If it still happens, adjust dividend to make the answer an integer.
      console.warn(`Non-integer answer for ${dividend}/${divisor}. Adjusting dividend to ${Math.floor(expectedAnswer) * divisor}.`);
      dividend = Math.floor(expectedAnswer) * divisor;
      if (divisor === 0) { // Rec-check after adjustment, though primary check should catch this
          console.error("Divisor became zero after adjustment. Critical error. Fallback to 10/2");
          divisor = 2; dividend = 10;
      }
      expectedAnswer = dividend / divisor; // Recalculate
  }

  const questionString = `${dividend} ÷ ${divisor} =`;
  
  return {
    operands: [dividend, divisor],
    expectedAnswer,
    questionString,
    operationType: OperationType.DIVIDE,
  };
}

/**
 * How to add new division formula types:
 * 1. Define a new key for your formula type (e.g., 'TYPE6_NEW_LOGIC'). This key will be used
 *    in the 'divisionFormulaType' property of the QuestionSettings.
 *
 * 2. Implement a new generator function that matches the DivisionFormulaGenerator interface:
 *    (settings: QuestionSettings, getRandomInt: (min: number, max: number) => number): { dividend: number; divisor: number };
 *    This function should:
 *      - Take 'settings' (of type QuestionSettings) and 'getRandomInt' (a random number generator function) as arguments.
 *      - Contain all logic to generate the 'dividend' and 'divisor' according to the new formula.
 *      - Include any necessary retry loops (e.g., using the 'maxAttemptsPerQuestion' constant).
 *      - Implement a specific fallback mechanism if the primary generation logic fails after all attempts,
 *        returning a valid { dividend, divisor } pair for that fallback.
 *      - Ensure the returned 'divisor' is never zero.
 *      - Ensure the returned 'dividend' is a multiple of the 'divisor' (so the answer is an integer).
 *
 * 3. Add this new key and your implemented generator function to the 'formulaGenerators' object.
 *    For example:
 *    // formulaGenerators['TYPE6_NEW_LOGIC'] = (settings, getRandomInt) => {
 *    //   // ... your logic ...
 *    //   return {dividend: generatedDividend, divisor: generatedDivisor};
 *    // };
 *
 * 4. If your new formula type requires specific parameters not already present in the
 *    QuestionSettings interface (defined in the file lib/question-types.ts),
 *    you should add these new parameters to the QuestionSettings interface.
 *    These parameters can then be accessed via the 'settings' object within your new generator function.
 */