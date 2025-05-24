import { QuestionSettings, Question, OperationType } from '../lib/question-types';

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

export function generateDivisionQuestion(settings: QuestionSettings): Question {
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
    operationType: OperationType.DIVIDE,
  };
}