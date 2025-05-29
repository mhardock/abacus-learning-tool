import { describe, it, expect, beforeEach } from 'vitest';
import { generateDivisionQuestion } from './question-generator-divide';
import { QuestionSettings, OperationType, Question } from './question-types';

// Helper functions (copied from question-generator-divide.ts for test validation)
function get_first_digit(n: number): number {
  if (n <= 0) {
    if (n === 0) return 0;
    return parseInt(Math.abs(n).toString()[0], 10);
  }
  return parseInt(n.toString()[0], 10);
}

function get_num_digits(n: number): number {
  if (n === 0) return 1;
  return Math.abs(n).toString().length;
}

describe('generateDivisionQuestion', () => {
  const mockRng = () => Math.random();
  let baseSettings: QuestionSettings;

  beforeEach(() => {
    baseSettings = {
      operationType: OperationType.DIVIDE,
      rng: mockRng,
    };
  });

  const divisionTestCases = [
    {
      formulaType: 'TYPE1_CAT_GT_MICE1_2D',
      description: '2 digits / 1 digit (cat > first digit of mice)',
      specificChecks: (question: Question) => {
        const [dividend, divisor] = question.operands;
        expect(get_num_digits(dividend)).toBe(2);
        expect(get_num_digits(divisor)).toBe(1);
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
        expect(get_first_digit(dividend)).toBeLessThan(divisor);
      },
    },
    {
      formulaType: 'TYPE2_CAT_GT_MICE1_3D',
      description: '3 digits / 1 digit (cat > first digit of mice)',
      specificChecks: (question: Question) => {
        const [dividend, divisor] = question.operands;
        expect(get_num_digits(dividend)).toBe(3);
        expect(get_num_digits(divisor)).toBe(1);
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
        expect(get_first_digit(dividend)).toBeLessThan(divisor);
      },
    },
    {
      formulaType: 'TYPE3_CAT_EQ_MICE1_2OR3D',
      description: '2 or 3 digits / 1 digit (cat = first digit of mice)',
      specificChecks: (question: Question) => {
        const [dividend, divisor] = question.operands;
        expect([2, 3]).toContain(get_num_digits(dividend));
        expect(get_num_digits(divisor)).toBe(1);
        expect(divisor).toBeGreaterThanOrEqual(2); // As per generator logic change
        expect(divisor).toBeLessThanOrEqual(9);
        expect(get_first_digit(dividend)).toBe(divisor);
      },
    },
    {
      formulaType: 'TYPE4_CAT_LT_MICE1_2D',
      description: '2 digits / 1 digit (cat < first digit of mice)',
      specificChecks: (question: Question) => {
        const [dividend, divisor] = question.operands;
        expect(get_num_digits(dividend)).toBe(2);
        expect(get_num_digits(divisor)).toBe(1);
        expect(divisor).toBeGreaterThanOrEqual(2); // As per generator logic change
        expect(divisor).toBeLessThanOrEqual(8);
        expect(get_first_digit(dividend)).toBeGreaterThan(divisor);
      },
    },
    // TYPE5 needs multiple sub-cases
    {
      formulaType: 'TYPE5_ANY_DIGITS',
      description: 'TYPE5: 2-3 digit dividend / 1 digit divisor',
      settingsOverride: {
        divisorDigits: 1,
        dividendDigitsMin: 2,
        dividendDigitsMax: 3,
      },
      specificChecks: (question: Question, settings?: Partial<QuestionSettings>) => {
        const [dividend, divisor] = question.operands;
        expect(get_num_digits(divisor)).toBe(settings?.divisorDigits || 1);
        expect(get_num_digits(dividend)).toBeGreaterThanOrEqual(settings?.dividendDigitsMin || 2);
        expect(get_num_digits(dividend)).toBeLessThanOrEqual(settings?.dividendDigitsMax || 3);
        expect(divisor).toBeGreaterThanOrEqual(2); // Min divisor is 2
      },
    },
    {
      formulaType: 'TYPE5_ANY_DIGITS',
      description: 'TYPE5: 3-4 digit dividend / 2 digit divisor',
      settingsOverride: {
        divisorDigits: 2,
        dividendDigitsMin: 3,
        dividendDigitsMax: 4,
      },
      specificChecks: (question: Question, settings?: Partial<QuestionSettings>) => {
        const [dividend, divisor] = question.operands;
        expect(get_num_digits(divisor)).toBe(settings?.divisorDigits || 2);
        expect(get_num_digits(dividend)).toBeGreaterThanOrEqual(settings?.dividendDigitsMin || 3);
        expect(get_num_digits(dividend)).toBeLessThanOrEqual(settings?.dividendDigitsMax || 4);
        expect(divisor).toBeGreaterThanOrEqual(10);
      },
    },
     {
      formulaType: 'TYPE5_ANY_DIGITS',
      description: 'TYPE5: 4 digit dividend / 1 digit divisor (minDivisor=2)',
      settingsOverride: {
        divisorDigits: 1,
        dividendDigitsMin: 4,
        dividendDigitsMax: 4,
      },
      specificChecks: (question: Question, settings?: Partial<QuestionSettings>) => {
        const [dividend, divisor] = question.operands;
        expect(get_num_digits(divisor)).toBe(settings?.divisorDigits || 1);
        expect(get_num_digits(dividend)).toBe(settings?.dividendDigitsMin || 4);
         expect(divisor).toBeGreaterThanOrEqual(2);
      },
    },
  ];

  divisionTestCases.forEach(testCase => {
    describe(`Formula Type: ${testCase.formulaType} (${testCase.description})`, () => {
      it('should generate 100 questions without errors and meeting criteria', () => {
const currentSettings: QuestionSettings = {
          ...baseSettings,
          divisionFormulaType: testCase.formulaType,
          ...(testCase.settingsOverride || {}),
        };
        for (let i = 0; i < 100; i++) {
          let question: Question | null = null;
          let generationError: any = null;

          try {
            question = generateDivisionQuestion(currentSettings);
          } catch (e) {
            generationError = e;
          }

          expect(generationError, `Generation failed for ${testCase.formulaType} on attempt ${i + 1}: ${generationError?.message}`).toBeNull();
          expect(question).not.toBeNull();

          if (question) {
            const [dividend, divisor] = question.operands;

            // Basic sanity checks for all division questions
            expect(question.operands).toBeInstanceOf(Array);
            expect(question.operands.length).toBe(2);
            expect(question.expectedAnswer).toBeTypeOf('number');
            expect(question.questionString).toBeTypeOf('string');
            expect(question.operationType).toBe(OperationType.DIVIDE);

            expect(divisor, `Divisor cannot be zero. Dividend: ${dividend}, Divisor: ${divisor}`).not.toBe(0);
            expect(dividend % divisor, `Dividend ${dividend} should be perfectly divisible by divisor ${divisor}. Remainder: ${dividend % divisor}`).toBe(0);
            expect(question.expectedAnswer).toBe(dividend / divisor);
            expect(question.questionString).toBe(`${dividend} ÷ ${divisor} =`);

            // Specific checks for the formula type
            if (testCase.specificChecks) {
              testCase.specificChecks(question, currentSettings);
            }
          }
        }
      });
    });
  });

  it('should use fallback if an unknown formula type is provided', () => {
    const settings: QuestionSettings = {
      ...baseSettings,
      divisionFormulaType: 'UNKNOWN_TYPE_XYZ',
    };
    // Suppress console.warn for this specific test
    const originalWarn = console.warn;
    console.warn = () => {};

    const question = generateDivisionQuestion(settings);
    
    console.warn = originalWarn; // Restore console.warn

    expect(question).toBeDefined();
    expect(question.operands[0]).toBe(10); // Default fallback dividend
    expect(question.operands[1]).toBe(2);  // Default fallback divisor
    expect(question.expectedAnswer).toBe(5);
  });

   it('should handle absolute fallback if divisor somehow becomes zero before final check', () => {
    // This test is tricky to set up perfectly as the generator functions have their own fallbacks.
    // We rely on the final check in generateDivisionQuestion.
    // Forcing a zero divisor from a sub-generator is complex without mocks.
    // Instead, we trust the final safety net.
    // A more direct test would involve mocking a formula generator to return divisor = 0.
    const settings: QuestionSettings = {
      ...baseSettings,
      divisionFormulaType: 'TYPE1_CAT_GT_MICE1_2D', // Any valid type
       // Intentionally try to create a scenario where a generator might fail badly
       // This is more of a conceptual test for the final safety net
      rng: () => 0, // Force predictable "bad" choices if possible
    };

    // Suppress console.error for this specific test
    const originalError = console.error;
    let errorCalled = false;
    console.error = (message) => {
        if (message.includes("Divisor is zero")) errorCalled = true;
    };

    const question = generateDivisionQuestion(settings);
    
    console.error = originalError; // Restore console.error

    // If the internal logic somehow resulted in divisor 0, the final fallback (10/2) is used.
    // This test primarily ensures the function doesn't crash and has a hard fallback.
    // The actual conditions for hitting the specific "Divisor is zero" error are hard to force externally.
    expect(question).toBeDefined();
    if (errorCalled) { // If the specific error was logged
        expect(question.operands[0]).toBe(10);
        expect(question.operands[1]).toBe(2);
    } else { // Otherwise, a normal question or a formula-specific fallback was generated
        expect(question.operands[1]).not.toBe(0);
    }
  });
});