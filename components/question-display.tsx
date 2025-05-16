"use client"

import { useState, useEffect, useRef } from "react"
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

const QuestionDisplay = ({ 
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
}: QuestionDisplayProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    numbers: [],
    expectedAnswer: 0
  })
  
  // Use refs to track previous values to prevent unnecessary rerenders
  const previousGenerateNew = useRef(generateNew)
  const settingsRef = useRef(settings)
  const lastAnswerRef = useRef<number | null>(null)

  // Effect to handle initialization
  useEffect(() => {
    settingsRef.current = settings; // Keep settingsRef updated
    if (currentQuestion.numbers.length === 0) {
      const newQuestion = generateQuestion(settings);
      setCurrentQuestion(newQuestion);
    }
  }, [settings, currentQuestion.numbers.length])

  // Effect to handle the generateNew prop change for manual refresh
  useEffect(() => {
    if (generateNew !== previousGenerateNew.current) {
      previousGenerateNew.current = generateNew;
      const newQuestion = generateQuestion(settingsRef.current);
      setCurrentQuestion(newQuestion);
    }
  }, [generateNew, settings])

  // Effect to regenerate question when settings.scenario changes (e.g., from a preset)
  useEffect(() => {
    settingsRef.current = settings;
    if (currentQuestion.numbers.length > 0) {
      const newQuestion = generateQuestion(settings);
      setCurrentQuestion(newQuestion);
    }
  }, [settings.scenario, currentQuestion.numbers.length, settings])

  // Effect to notify parent of the expected answer when the question changes
  useEffect(() => {
    if (currentQuestion.numbers.length > 0) {
      if (lastAnswerRef.current !== currentQuestion.expectedAnswer) {
        lastAnswerRef.current = currentQuestion.expectedAnswer;
        onQuestionGenerated(currentQuestion.expectedAnswer);
      }
    }
  }, [currentQuestion, onQuestionGenerated])

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
}

QuestionDisplay.displayName = "QuestionDisplay"

export default QuestionDisplay