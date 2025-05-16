import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import QuestionDisplay, { QuestionDisplayHandle } from '../components/question-display';

// Helper function to extract question numbers from the QuestionDisplay component
const extractQuestionNumbers = (container: HTMLElement): number[] => {
  const numbers: number[] = [];
  // Find the container with the question numbers
  const numberElements = container.querySelectorAll('.py-1 span');
  
  if (numberElements.length > 0) {
    numberElements.forEach(el => {
      const num = parseInt(el.textContent || '0', 10);
      numbers.push(num);
    });
  }
  
  return numbers;
};

describe('QuestionDisplay - generateSorobanQuestion tests', () => {
  // Spy on console to capture output
  let mockConsole: any;
  
  beforeEach(() => {
    // We don't need to mock console.log for this test
    mockConsole = vi.spyOn(console, 'log');
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the component correctly', () => {
    render(<QuestionDisplay 
      feedback={null}
      feedbackType={null}
      generateNew={false}
      onQuestionGenerated={() => {}}
    />);
    
    expect(screen.getByText('Problem')).toBeDefined();
  });

  // For each scenario we want to test
  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(scenario => {
    it(`should generate questions for Scenario ${scenario}`, async () => {
      // Create a mapping of scenario numbers to their names from formulas.md
      const scenarioNames: Record<number, string> = {
        1: "Simple 1-4",
        2: "Simple 1-5",
        3: "Simple 1-9",
        4: "Friends +",
        5: "Friends +/-",
        6: "Relatives +",
        7: "Relatives +/-",
        8: "Mix +",
        9: "Mix +/-"
      };
      
      // Setup random mock for predictable test results
      let randomSequences;
      
      randomSequences = [
        [0.05, 0.15, 0.25, 0.35, 0.45, 0.10], // First question
        [0.20, 0.30, 0.40, 0.50, 0.60, 0.35], // Second question
        [0.55, 0.65, 0.75, 0.85, 0.95, 0.60], // Third question
        [0.10, 0.40, 0.70, 0.25, 0.55, 0.80], // Fourth question
        [0.33, 0.48, 0.63, 0.78, 0.93, 0.22]  // Fifth question
      ];

      
      let callCount = 0;
      const randomMock = vi.spyOn(global.Math, 'random').mockImplementation(() => {
        // Cycle through all sequences in order
        const seqIndex = Math.floor(callCount / 6); // Change sequence every 6 calls
        const valueIndex = callCount % 6;
        const value = randomSequences[seqIndex % randomSequences.length][valueIndex];
        callCount++;
        return value;
      });
      
      try {
        // Array to store all generated questions
        const generatedQuestions: {numbers: number[], answer: number}[] = [];
        
        // Create a ref to access the component instance
        const questionDisplayRef = React.createRef<QuestionDisplayHandle>();
        
        // Flag to track the initial question
        let initialQuestionCaptured = false;
        
        // Function to capture question data when a new question is generated
        const handleQuestionGenerated = (expectedAnswer: number) => {
          // Skip the initial question that comes from generateNewQuestion()
          if (!initialQuestionCaptured) {
            initialQuestionCaptured = true;
            return;
          }
          
          // Don't capture more than our target number of questions
          if (generatedQuestions.length >= targetQuestionCount) return;
          
          // Get the question numbers from the DOM
          const numberElements = document.querySelectorAll('.py-1 span');
          const numbers: number[] = [];
          
          numberElements.forEach(el => {
            const numStr = el.textContent || '0';
            numbers.push(parseInt(numStr, 10));
          });
          
          // Add to our collection of generated questions
          if (numbers.length > 0) {
            generatedQuestions.push({
              numbers,
              answer: expectedAnswer
            });
          }
        };
        
        // Render the component once
        render(
          <QuestionDisplay
            ref={questionDisplayRef}
            feedback={null}
            feedbackType={null}
            generateNew={false}
            onQuestionGenerated={handleQuestionGenerated}
            settings={{
              minNumbers: 5,
              maxNumbers: 5,
              minValue: 1,
              maxValue: 9
            }}
          />
        );
        
        // Generate different questions for this scenario
        // Try up to 5 times for each question to handle potential failures
        const maxAttempts = 5;
        const targetQuestionCount = 5;
        let attempts = 0;
        
        while (generatedQuestions.length < targetQuestionCount && attempts < maxAttempts) {
          try {
            act(() => {
              // Generate a soroban question for this scenario
              if (questionDisplayRef.current) {
                questionDisplayRef.current.generateSorobanQuestion(scenario);
              }
            });
            
            // Wait a moment for the component to update
            await vi.waitFor(() => {
              // If we don't have enough questions yet, wait longer
              return generatedQuestions.length > attempts;
            }, { timeout: 1000 });
          } catch (error) {
            console.log(`Attempt ${attempts+1} for scenario ${scenario} failed. Trying again...`);
            console.log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
          }
          
          attempts++;
        }
        
        // Print out all the generated questions
        console.log(`\n=== SCENARIO ${scenario}: ${scenarioNames[scenario]} ===`);
        generatedQuestions.forEach((q, index) => {
          console.log(`Question ${index+1}: ${q.numbers.join(' ')} = ${q.answer}`);
          
          // Verify the numbers sum to the expected answer
          const calculatedSum = q.numbers.reduce((sum, num) => sum + num, 0);
          expect(calculatedSum).toBe(q.answer);
        });
        
        // Ensure we generated at least one question
        if (generatedQuestions.length === 0) {
          console.log(`Warning: Could not generate any valid questions for scenario ${scenario}`);
        }
        expect(generatedQuestions.length).toBeGreaterThan(0);
        
      } finally {
        randomMock.mockRestore();
      }
    });
  });
}); 