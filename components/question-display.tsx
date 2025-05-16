"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import React from "react"

interface Question {
  numbers: number[]
}

interface QuestionSettings {
  minNumbers: number
  maxNumbers: number
  minValue: number
  maxValue: number
}

interface QuestionDisplayProps {
  feedback: string | null
  feedbackType: "success" | "error" | null
  generateNew: boolean
  onQuestionGenerated: (expectedAnswer: number) => void
  settings?: QuestionSettings
}

// Export the interface for the ref handle
export interface QuestionDisplayHandle {
  generateSorobanQuestion: (scenario: number) => void;
}

const QuestionDisplay = forwardRef<QuestionDisplayHandle, QuestionDisplayProps>(({ 
  feedback, 
  feedbackType, 
  generateNew,
  onQuestionGenerated,
  settings = {
    minNumbers: 2,
    maxNumbers: 5,
    minValue: 1,
    maxValue: 30
  }
}, ref) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    numbers: [],
  })
  
  // Use refs to track previous values to prevent unnecessary rerenders
  const previousGenerateNew = useRef(generateNew)
  const settingsRef = useRef(settings)
  
  // Calculate the expected answer
  const calculateExpectedAnswer = (): number => {
    return currentQuestion.numbers.reduce((sum, num) => sum + num, 0)
  }

  // Generate a new random question
  const generateNewQuestion = () => {
    const currentSettings = settingsRef.current;
    // Generate numbers for the question based on settings
    const count = Math.floor(Math.random() * (currentSettings.maxNumbers - currentSettings.minNumbers + 1)) + currentSettings.minNumbers
    const numbers: number[] = []
    let runningTotal = 0
    
    for (let i = 0; i < count; i++) {
      if (i === 0) {
        // First number is always positive
        const min = currentSettings.minValue
        const max = currentSettings.maxValue
        const num = Math.floor(Math.random() * (max - min + 1)) + min
        numbers.push(num)
        runningTotal = num
      } else {
        // Decide if this number will be positive or negative
        const isPositive = Math.random() > 0.5
        
        if (isPositive) {
          // Generate a positive number within range
          const num = Math.floor(Math.random() * (currentSettings.maxValue - currentSettings.minValue + 1)) + currentSettings.minValue
          numbers.push(num)
          runningTotal += num
        } else {
          // Generate a negative number, but ensure it doesn't make the running total negative
          // Maximum we can subtract is the running total - 1 to ensure result stays positive
          const maxSubtract = Math.min(runningTotal - 1, currentSettings.maxValue)
          
          if (maxSubtract < currentSettings.minValue) {
            // If we can't subtract enough, add a positive number instead
            const num = Math.floor(Math.random() * (currentSettings.maxValue - currentSettings.minValue + 1)) + currentSettings.minValue
            numbers.push(num)
            runningTotal += num
          } else {
            // Generate a negative number that won't make the total negative
            const negValue = Math.floor(Math.random() * (maxSubtract - currentSettings.minValue + 1)) + currentSettings.minValue
            const num = -negValue
            numbers.push(num)
            runningTotal += num
          }
        }
      }
    }
    
    setCurrentQuestion({
      numbers,
    })
  }

  // New function to generate soroban-based questions according to different scenarios
  const generateSorobanQuestion = (scenario: number = 1) => {
    // Define the valid d2 values for each d1 value based on the scenario and operation
    const validD2Matrix: Record<string, Record<number, number[]>> = {
      // Scenario 1: Simple 1-4 - Addition
      "1-addition": {
        0: [1, 2, 3, 4],
        1: [1, 2, 3],
        2: [1, 2],
        3: [1],
        4: [],
      },
      // Scenario 1: Simple 1-4 - Subtraction
      "1-subtraction": {
        0: [],
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
      },
      // Scenario 2: Simple 1-5 - Addition
      "2-addition": {
        0: [1, 2, 3, 4, 5],
        1: [1, 2, 3, 5],
        2: [1, 2, 5],
        3: [1, 5],
        4: [5],
        5: [1, 2, 3, 4],
        6: [1, 2, 3],
        7: [1, 2],
        8: [1],
        9: [],
      },
      // Scenario 2: Simple 1-5 - Subtraction
      "2-subtraction": {
        0: [],
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
        5: [5],
        6: [1, 5],
        7: [1, 2, 5],
        8: [1, 2, 3, 5],
        9: [1, 2, 3, 4, 5],
      },
      // Scenario 3: Simple 1-9 - Addition
      "3-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 5, 6, 7, 8],
        2: [1, 2, 5, 6, 7],
        3: [1, 5, 6],
        4: [5],
        5: [1, 2, 3, 4],
        6: [1, 2, 3],
        7: [1, 2],
        8: [1],
        9: [],
      },
      // Scenario 3: Simple 1-9 - Subtraction
      "3-subtraction": {
        0: [],
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
        5: [5],
        6: [1, 5, 6],
        7: [1, 2, 5, 6, 7],
        8: [1, 2, 3, 5, 6, 7, 8],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 4: Friends + - Addition
      "4-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8],
        2: [1, 2, 3, 4, 5, 6, 7],
        3: [1, 2, 3, 4, 5, 6],
        4: [1, 2, 3, 4, 5],
        5: [1, 2, 3, 4],
        6: [1, 2, 3],
        7: [1, 2],
        8: [1],
        9: [],
      },
      // Scenario 4: Friends + - Subtraction (same as Scenario 3 Subtraction)
      "4-subtraction": {
        0: [],
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
        5: [5],
        6: [1, 5, 6],
        7: [1, 2, 5, 6, 7],
        8: [1, 2, 3, 5, 6, 7, 8],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 5: Friends +/- - Addition (same as Scenario 4 Addition)
      "5-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8],
        2: [1, 2, 3, 4, 5, 6, 7],
        3: [1, 2, 3, 4, 5, 6],
        4: [1, 2, 3, 4, 5],
        5: [1, 2, 3, 4],
        6: [1, 2, 3],
        7: [1, 2],
        8: [1],
        9: [],
      },
      // Scenario 5: Friends +/- - Subtraction
      "5-subtraction": {
        0: [],
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
        5: [1, 2, 3, 4, 5],
        6: [1, 2, 3, 4, 5, 6],
        7: [1, 2, 3, 4, 5, 6, 7],
        8: [1, 2, 3, 4, 5, 6, 7, 8],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 6: Relatives + - Addition
      "6-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        5: [1, 2, 3, 4, 5],
        6: [1, 2, 3, 4, 5, 9],
        7: [1, 2, 3, 4, 5, 8, 9],
        8: [1, 2, 3, 4, 5, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 6: Relatives + - Subtraction (same as Scenario 5 Subtraction)
      "6-subtraction": {
        0: [],
        1: [1],
        2: [1, 2],
        3: [1, 2, 3],
        4: [1, 2, 3, 4],
        5: [1, 2, 3, 4, 5],
        6: [1, 2, 3, 4, 5, 6],
        7: [1, 2, 3, 4, 5, 6, 7],
        8: [1, 2, 3, 4, 5, 6, 7, 8],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 7: Relatives +/- - Addition (same as Scenario 6 Addition)
      "7-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        5: [1, 2, 3, 4, 5],
        6: [1, 2, 3, 4, 5, 9],
        7: [1, 2, 3, 4, 5, 8, 9],
        8: [1, 2, 3, 4, 5, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 7: Relatives +/- - Subtraction
      "7-subtraction": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 8, 9],
        3: [1, 2, 3, 4, 5, 9],
        4: [1, 2, 3, 4, 5],
        5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 8: Mix + - Addition
      "8-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 8: Mix + - Subtraction (same as Scenario 7 Subtraction)
      "8-subtraction": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 8, 9],
        3: [1, 2, 3, 4, 5, 9],
        4: [1, 2, 3, 4, 5],
        5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 9: Mix +/- - Addition (all combinations allowed)
      "9-addition": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      // Scenario 9: Mix +/- - Subtraction (all combinations allowed)
      "9-subtraction": {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        4: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        5: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        6: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        7: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        8: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    };

    const currentSettings = settingsRef.current;
    
    // Create a function to find valid combinations for a specific operation
    const findValidPair = (operation: "addition" | "subtraction", currentValue: number) => {
      // Get the valid d2 values matrix for the selected scenario and operation
      const matrixKey = `${scenario}-${operation}`;
      const validD2ForD1 = validD2Matrix[matrixKey];
      
      if (!validD2ForD1) {
        throw new Error(`Scenario ${scenario} is not defined for ${operation}`);
      }
      
      // Valid d1 values are those that have at least one valid d2
      const possibleD1Values = Object.keys(validD2ForD1)
        .map(Number)
        .filter(d1 => validD2ForD1[d1] && validD2ForD1[d1].length > 0);
      
      if (possibleD1Values.length === 0) {
        return null; // No valid d1 values for this operation
      }
      
      // Find a valid d1 from the running total
      const d1 = currentValue % 10; // Get the ones digit
      
      // Check if this d1 has valid d2 values
      if (!possibleD1Values.includes(d1)) {
        return null; // This d1 doesn't have valid d2 values
      }
      
      // Get the valid d2 values for the current d1
      let validD2Values = validD2ForD1[d1];
      
      if (!validD2Values || validD2Values.length === 0) {
        return null; // No valid d2 values for this d1
      }
      
      // For scenarios 6-9, when using subtraction where d2 > d1, we need to ensure
      // currentValue >= 10 to allow borrowing
      if (scenario >= 6 && operation === "subtraction" && currentValue < 10) {
        // Filter out d2 values that are greater than d1 when currentValue < 10
        validD2Values = validD2Values.filter(d2 => d2 <= d1);
        
        if (validD2Values.length === 0) {
          return null; // No valid d2 values after filtering
        }
      }
      
      // Choose a random d2 from valid values
      const d2Index = Math.floor(Math.random() * validD2Values.length);
      const d2 = validD2Values[d2Index];
      
      return { d1, d2, operation };
    };
    
    // Initialize numbers array
    const numbers: number[] = [];
    
    // For the first number, we'll use the scenario's rules
    // Since it's the first number, consider d1 as 0 and find a valid d2
    
    // Get possible values for the first number from the scenario matrix
    const matrixKey = `${scenario}-addition`; // Always use addition for first number
    const validFirstNumberValues = validD2Matrix[matrixKey][0] || [];
    
    if (validFirstNumberValues.length === 0) {
      throw new Error(`Scenario ${scenario} doesn't have valid starting values`);
    }
    
    // Generate the first number from the valid values for the scenario
    const firstNumIndex = Math.floor(Math.random() * validFirstNumberValues.length);
    const firstNum = validFirstNumberValues[firstNumIndex];
    numbers.push(firstNum);
    
    let runningTotal = firstNum;
    
    // Determine how many more numbers to generate based on settings
    const totalNumbers = Math.floor(Math.random() * (currentSettings.maxNumbers - currentSettings.minNumbers + 1)) + currentSettings.minNumbers;
    
    // Generate the rest of the numbers
    for (let i = 1; i < totalNumbers; i++) {
      // Randomly decide between addition and subtraction
      const operations: Array<"addition" | "subtraction"> = ["addition", "subtraction"];
      let validPair = null;
      
      // Try each operation in random order
      operations.sort(() => Math.random() - 0.5);
      
      for (const operation of operations) {
        validPair = findValidPair(operation, runningTotal);
        if (validPair) break;
      }
      
      // If no valid pair is found for either operation, throw an error
      if (!validPair) {
        throw new Error(`Unable to generate a valid question for scenario ${scenario} with current running total ${runningTotal}`);
      }
      
      // Add the number to the list with appropriate sign
      const nextNum = validPair.operation === "addition" ? validPair.d2 : -validPair.d2;
      numbers.push(nextNum);
      
      // Update the running total
      runningTotal += nextNum;
      
      // Ensure we don't generate negative numbers
      if (runningTotal < 0) {
        throw new Error(`Generated a negative running total: ${runningTotal}`);
      }
    }
    
    // Set the current question
    setCurrentQuestion({
      numbers,
    });
  }

  // Expose the generateSorobanQuestion function via ref
  useImperativeHandle(ref, () => ({
    generateSorobanQuestion
  }));

  // Effect to handle initialization and settings changes
  useEffect(() => {
    // Update the ref when settings change
    settingsRef.current = settings;
    
    // Initial generation
    if (currentQuestion.numbers.length === 0) {
      generateNewQuestion();
    }
  }, [settings]);

  // Effect to handle the generateNew prop change
  useEffect(() => {
    // Only generate a new question if the generateNew prop actually changed
    if (generateNew !== previousGenerateNew.current) {
      previousGenerateNew.current = generateNew;
      generateNewQuestion();
    }
  }, [generateNew]);

  // Effect to notify parent of the expected answer when the question changes
  useEffect(() => {
    if (currentQuestion.numbers.length > 0) {
      const expectedAnswer = calculateExpectedAnswer();
      onQuestionGenerated(expectedAnswer);
    }
  }, [currentQuestion, onQuestionGenerated]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 w-full max-w-xs ${currentQuestion.numbers.length > 3 ? 'min-h-[300px]' : 'min-h-[250px]'} flex flex-col`}>
      <h2 className="text-xl font-semibold text-[#5d4037] mb-4 text-center">Problem</h2>

      <div className="flex flex-col items-center space-y-1 font-mono text-2xl md:text-3xl flex-grow justify-center">
        {/* Centered outer container */}
        <div className="flex flex-col items-center w-full relative">
          {/* Inner container for right-aligned numbers, shifted left to compensate */}
          <div className="flex flex-col items-end w-20 -ml-14">
            {currentQuestion.numbers.map((num, index) => (
              <div key={index} className="py-1 relative">
                {/* Display the sign directly in the number */}
                <span>{num}</span>
              </div>
            ))}
          </div>
          
          {/* Horizontally centered line */}
          <div className="border-t-2 border-[#5d4037] w-20 mt-2 pt-1"></div>
        </div>
      </div>

      {/* Answer placeholder */}
      <div className="h-8"></div>

      {/* Feedback message */}
      {feedback && (
        <div className={`mt-4 text-center ${feedbackType === "success" ? "text-green-600" : "text-red-600"}`}>
          {feedback}
        </div>
      )}
    </div>
  )
})

QuestionDisplay.displayName = "QuestionDisplay";

export default QuestionDisplay;