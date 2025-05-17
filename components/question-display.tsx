"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import React from "react"
import { Question, QuestionSettings, generateQuestion } from "@/lib/question-generator"

interface QuestionDisplayProps {
  feedback: string | null
  feedbackType: "success" | "error" | null
  generateNew: boolean
  onQuestionGenerated: (expectedAnswer: number) => void
  settings?: QuestionSettings
}

// Define the handle type for the ref
export interface QuestionDisplayHandle {
  generateSorobanQuestion: (scenario: number) => void;
}

const QuestionDisplay = forwardRef<QuestionDisplayHandle, QuestionDisplayProps>(({ 
  feedback, 
  feedbackType, 
  generateNew,
  onQuestionGenerated,
  settings: initialSettings = {
    minNumbers: 2,
    maxNumbers: 5,
    scenario: 1,
    weightingMultiplier: 3,
    minOperandDigits: 1,
    maxOperandDigits: 1,
  }
}, ref) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    numbers: [],
    expectedAnswer: 0
  })
  
  // Use settings from props, which might be updated by parent
  const [componentSettings, setComponentSettings] = useState(initialSettings);

  // Use refs to track previous values to prevent unnecessary rerenders
  const previousGenerateNew = useRef(generateNew)
  // const settingsRef = useRef(componentSettings) // settingsRef will now point to componentSettings
  const lastAnswerRef = useRef<number | null>(null)

  // Update componentSettings when initialSettings prop changes
  useEffect(() => {
    setComponentSettings(initialSettings);
  }, [initialSettings]);
  

  // Effect to handle initialization or when componentSettings changes
  useEffect(() => {
    // settingsRef.current = componentSettings; // Keep settingsRef updated
    if (currentQuestion.numbers.length === 0 || componentSettings !== lastSettingsRef.current) {
      console.log("Generating question due to init or settings change. New Settings:", componentSettings);
      const newQuestion = generateQuestion(componentSettings);
      setCurrentQuestion(newQuestion);
    }
  }, [componentSettings, currentQuestion.numbers.length]) // Depend on componentSettings

  // Effect to handle the generateNew prop change for manual refresh
  useEffect(() => {
    if (generateNew !== previousGenerateNew.current) {
      console.log("Generating question due to generateNew toggle. Current Settings:", componentSettings);
      previousGenerateNew.current = generateNew;
      const newQuestion = generateQuestion(componentSettings); // Use current componentSettings
      setCurrentQuestion(newQuestion);
    }
  }, [generateNew, componentSettings]) // Depend on componentSettings

  // Effect to regenerate question when settings.scenario changes specifically
  // This might be redundant if the main componentSettings effect handles it,
  // but can be kept if scenario changes need specific immediate regeneration logic.
  // We also need a ref to track the last settings to compare for actual changes
  const lastSettingsRef = useRef(componentSettings);
  useEffect(() => {
    if (componentSettings.scenario !== lastSettingsRef.current.scenario) {
       console.log("Generating question due to SCENARIO change. New Settings:", componentSettings);
       const newQuestion = generateQuestion(componentSettings);
       setCurrentQuestion(newQuestion);
    }
    lastSettingsRef.current = componentSettings; // Update ref after comparison
  }, [componentSettings]);


  // Effect to notify parent of the expected answer when the question changes
  useEffect(() => {
    if (currentQuestion.numbers.length > 0) {
      if (lastAnswerRef.current !== currentQuestion.expectedAnswer) {
        lastAnswerRef.current = currentQuestion.expectedAnswer;
        onQuestionGenerated(currentQuestion.expectedAnswer);
      }
    }
  }, [currentQuestion, onQuestionGenerated])

  // Expose generateSorobanQuestion via ref
  useImperativeHandle(ref, () => ({
    generateSorobanQuestion: (newScenario?: number) => {
      // If a new scenario is provided, update settings first
      // This will trigger the useEffect that depends on componentSettings.scenario
      if (newScenario !== undefined) {
         console.log("generateSorobanQuestion called with new scenario:", newScenario, "Current settings:", componentSettings);
         setComponentSettings(prevSettings => ({ ...prevSettings, scenario: newScenario }));
      } else {
        // If no new scenario, just regenerate with current settings
        console.log("generateSorobanQuestion called (no new scenario). Current settings:", componentSettings);
        const newQuestion = generateQuestion(componentSettings);
        setCurrentQuestion(newQuestion);
      }
    }
  }));

  // Defensive check in case numbers array is empty (should not happen if logic is correct)
  if (!currentQuestion || currentQuestion.numbers.length === 0) {
    return <div className="text-center p-4">Loading question...</div>;
  }
  
  // Format numbers for display
  const displayNumbers = currentQuestion.numbers.map((num, index) => {
    const isLastPositive = index === currentQuestion.numbers.length - 1 && num > 0;
    const operator = num < 0 ? "-" : "";
    const absNum = Math.abs(num);
    
    return {
      key: `${num}-${index}`, 
      operator: operator,
      number: absNum,
      isLastPositive: isLastPositive // Not currently used but available
    };
  });

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
            {displayNumbers.map((item) => (
              <div key={item.key} className="py-1 relative">
                {/* Display the sign directly in the number */}
                {item.operator && <span className="mr-2 text-gray-500">{item.operator}</span>}
                <span>{item.number}</span>
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