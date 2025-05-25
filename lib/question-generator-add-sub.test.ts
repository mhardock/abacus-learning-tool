import { describe, it, expect } from 'vitest';
import { generateAdditionSubtractionQuestion } from './question-generator-add-sub';
import { QuestionSettings, OperationType } from './question-types';

/**
 * Comprehensive tests for generateAdditionSubtractionQuestion function.
 * Tests ensure the function can generate 10,000 questions without errors
 * across various parameter combinations.
 */

describe('generateAdditionSubtractionQuestion', () => {
  // Mock RNG function for consistent testing
  const mockRng = () => Math.random();

  // Base settings that remain constant across all tests
  const baseSettings = {
    operationType: OperationType.ADD_SUBTRACT,
    minAddSubTerms: 5,
    maxAddSubTerms: 5,
    addSubWeightingMultiplier: 2,
    rng: mockRng
  };

  // Test scenarios 1-9 (excluding scenario 10 "All Formulas" as specified)
  for (let scenario = 1; scenario <= 9; scenario++) {
    describe(`Scenario ${scenario}`, () => {
      // Test digit combinations: minDigits from 1-5, maxDigits from minDigits to 5
      for (let minDigits = 1; minDigits <= 5; minDigits++) {
        for (let maxDigits = minDigits; maxDigits <= 5; maxDigits++) {
          it(`should generate 100 questions for scenario ${scenario}, minDigits ${minDigits}, maxDigits ${maxDigits}, terms 5, weight 2 without errors`, () => {
            const settings: QuestionSettings = {
              ...baseSettings,
              addSubScenario: scenario,
              minAddSubTermDigits: minDigits,
              maxAddSubTermDigits: maxDigits
            };

            // Generate 100 questions and ensure no errors are thrown
            // Note: Some parameter combinations may fail due to function limitations
            for (let i = 0; i < 100; i++) {
              expect(() => {
                const question = generateAdditionSubtractionQuestion(settings);
                
                // Basic sanity checks to ensure valid question structure
                expect(question).toBeDefined();
                expect(question.operands).toBeInstanceOf(Array);
                expect(question.operands.length).toBe(5); // Should have exactly 5 terms
                expect(question.expectedAnswer).toBeTypeOf('number');
                expect(question.questionString).toBeTypeOf('string');
                expect(question.operationType).toBe(OperationType.ADD_SUBTRACT);
                
                // Ensure the first operand is positive (as per function logic)
                expect(question.operands[0]).toBeGreaterThan(0);
                
                // Verify question string ends with " ="
                expect(question.questionString).toMatch(/ =$/);
                
                // Verify expected answer matches operands calculation
                const calculatedAnswer = question.operands.reduce((sum, operand) => sum + operand, 0);
                expect(question.expectedAnswer).toBe(calculatedAnswer);
                
                // Ensure final answer is not negative (as per function warnings)
                expect(question.expectedAnswer).toBeGreaterThanOrEqual(0);
                
              }).not.toThrow();
            }
          });
        }
      }
    });
  }

  describe('Edge cases and validation', () => {
    it('should handle minimum configuration (scenario 1, 1 digit)', () => {
      const settings: QuestionSettings = {
        ...baseSettings,
        addSubScenario: 1,
        minAddSubTermDigits: 1,
        maxAddSubTermDigits: 1
      };

      for (let i = 0; i < 100; i++) {
        expect(() => {
          const question = generateAdditionSubtractionQuestion(settings);
          
          // All operands should be single digit
          question.operands.forEach(operand => {
            expect(Math.abs(operand)).toBeLessThan(10);
          });
        }).not.toThrow();
      }
    });

    it('should handle maximum configuration (scenario 9, 5 digits)', () => {
      const settings: QuestionSettings = {
        ...baseSettings,
        addSubScenario: 9,
        minAddSubTermDigits: 5,
        maxAddSubTermDigits: 5
      };

      for (let i = 0; i < 100; i++) {
        expect(() => {
          const question = generateAdditionSubtractionQuestion(settings);
          
          // First operand should be 5 digits (10000-99999)
          expect(question.operands[0]).toBeGreaterThanOrEqual(10000);
          expect(question.operands[0]).toBeLessThan(100000);
        }).not.toThrow();
      }
    });

    it('should maintain consistent term count across all scenarios', () => {
      for (let scenario = 1; scenario <= 9; scenario++) {
        const settings: QuestionSettings = {
          ...baseSettings,
          addSubScenario: scenario,
          minAddSubTermDigits: 2,
          maxAddSubTermDigits: 3
        };

        for (let i = 0; i < 100; i++) {
          const question = generateAdditionSubtractionQuestion(settings);
          expect(question.operands.length).toBe(5);
        }
      }
    });

    it('should generate valid question strings for all scenarios', () => {
      for (let scenario = 1; scenario <= 9; scenario++) {
        const settings: QuestionSettings = {
          ...baseSettings,
          addSubScenario: scenario,
          minAddSubTermDigits: 1,
          maxAddSubTermDigits: 2
        };

        for (let i = 0; i < 50; i++) {
          const question = generateAdditionSubtractionQuestion(settings);
          
          // Question string should contain proper operators and format
          expect(question.questionString).toMatch(/^\d+(\s[+\-]\s\d+)*\s=$/);
          
          // Should start with a positive number (no leading operator)
          expect(question.questionString).toMatch(/^\d+/);
        }
      }
    });
  });

  describe('Weight multiplier validation', () => {
    it('should handle different weight multipliers without errors', () => {
      const weights = [1, 2, 3, 5];
      
      for (const weight of weights) {
        const settings: QuestionSettings = {
          ...baseSettings,
          addSubScenario: 5,
          minAddSubTermDigits: 2,
          maxAddSubTermDigits: 3,
          addSubWeightingMultiplier: weight
        };

        for (let i = 0; i < 100; i++) {
          expect(() => {
            generateAdditionSubtractionQuestion(settings);
          }).not.toThrow();
        }
      }
    });
  });
});