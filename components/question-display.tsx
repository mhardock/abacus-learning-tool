"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react"
import React from "react"
import { Question, QuestionSettings, generateQuestion } from "@/lib/question-generator"

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
    scenario: 1,
    weightingMultiplier: 3
  }
}, ref) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    numbers: [],
    expectedAnswer: 0
  })
  
  // Use refs to track previous values to prevent unnecessary rerenders
  const previousGenerateNew = useRef(generateNew)
  const settingsRef = useRef(settings)
  const lastAnswerRef = useRef<number | null>(null)
  
  // New function to generate soroban-based questions
  const generateSorobanQuestion = useCallback((scenario: number = 1) => {
    try {
      const newQuestion = generateQuestion({
        ...settingsRef.current,
        scenario: scenario || settingsRef.current.scenario
      });
      
      setCurrentQuestion(newQuestion);
    } catch (error) {
      console.error("Error generating question:", error);
      // Try again with a different scenario if there's an error
      if (scenario > 1) {
        generateSorobanQuestion(scenario - 1);
      } else {
        // Fallback to a simple question if all else fails
        setCurrentQuestion({
          numbers: [1, 2],
          expectedAnswer: 3
        });
      }
    }
  }, []);

  // Expose the generateSorobanQuestion function via ref
  useImperativeHandle(ref, () => ({
    generateSorobanQuestion
  }), [generateSorobanQuestion]);

  // Effect to handle initialization and settings changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Update the ref when settings change
    settingsRef.current = settings;
    
    // Initial generation
    if (currentQuestion.numbers.length === 0) {
      generateSorobanQuestion(settings.scenario);
    }
  }, [settings]);

  // Effect to handle the generateNew prop change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Only generate a new question if the generateNew prop actually changed
    if (generateNew !== previousGenerateNew.current) {
      previousGenerateNew.current = generateNew;
      generateSorobanQuestion(settingsRef.current.scenario);
    }
  }, [generateNew]);

  // Effect to notify parent of the expected answer when the question changes
  useEffect(() => {
    if (currentQuestion.numbers.length > 0) {
      // Only notify if the answer has changed
      if (lastAnswerRef.current !== currentQuestion.expectedAnswer) {
        lastAnswerRef.current = currentQuestion.expectedAnswer;
        onQuestionGenerated(currentQuestion.expectedAnswer);
      }
    }
  }, [currentQuestion, onQuestionGenerated]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 w-full max-w-xs flex flex-col ${
      feedback && feedback.length > 20 
        ? 'min-h-[320px]' 
        : currentQuestion.numbers.length > 3 
          ? 'min-h-[300px]' 
          : 'min-h-[250px]'
    }`}>
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
          
          {/* Answer placeholder */}
          <div className="min-h-8 mt-1 w-full">
            {feedback && (
              <div className={`py-1 text-center text-base md:text-lg break-words px-2 w-full ${feedbackType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

QuestionDisplay.displayName = "QuestionDisplay"

export default QuestionDisplay