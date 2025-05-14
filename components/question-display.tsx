"use client"

import { useState, useEffect, useRef } from "react"
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

export default function QuestionDisplay({ 
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
}: QuestionDisplayProps) {
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
}