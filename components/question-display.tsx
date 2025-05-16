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

  // Effect to handle initialization
  useEffect(() => {
    settingsRef.current = settings; // Keep settingsRef updated
    if (currentQuestion.numbers.length === 0) {
      generateSorobanQuestion(settings.scenario);
    }
  }, [settings, currentQuestion.numbers.length, generateSorobanQuestion]); // Initial call depends on settings too

  // Effect to handle the generateNew prop change for manual refresh
  useEffect(() => {
    if (generateNew !== previousGenerateNew.current) {
      previousGenerateNew.current = generateNew;
      generateSorobanQuestion(settingsRef.current.scenario); // Use scenario from updated settingsRef
    }
  }, [generateNew, generateSorobanQuestion]);

  // Effect to regenerate question when settings.scenario changes (e.g., from a preset)
  useEffect(() => {
    // Update settingsRef whenever settings prop changes
    settingsRef.current = settings;
    // Check if this is not the initial render (currentQuestion.numbers.length > 0)
    // and if the scenario in the settings prop has actually changed from what's in settingsRef before this update.
    // This check helps avoid double generation on initial load or if other settings parts change.
    // For simplicity and directness with presets, we can tie it to scenario changes.
    // A more robust way would be to compare prevSettings.scenario with settings.scenario.

    // To ensure it runs when scenario changes from a preset:
    if (currentQuestion.numbers.length > 0) { // Avoid running on initial mount if the other effect handles it
        // Check if the incoming settings.scenario is different from the one used for the current question
        // This requires knowing what scenario the currentQuestion was generated with.
        // For now, let's assume any change to settings.scenario after initial load should regenerate.
        // The initial load is handled by the first useEffect.
        generateSorobanQuestion(settings.scenario); 
    }
  }, [settings.scenario, generateSorobanQuestion]); // Add settings.scenario to dependency array

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