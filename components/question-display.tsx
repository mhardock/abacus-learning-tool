"use client"

import { useState, useEffect } from "react"
import React from "react"

interface Question {
  numbers: number[]
}

interface QuestionDisplayProps {
  feedback: string | null
  feedbackType: "success" | "error" | null
  generateNew: boolean
  onQuestionGenerated: (expectedAnswer: number) => void
}

export default function QuestionDisplay({ 
  feedback, 
  feedbackType, 
  generateNew,
  onQuestionGenerated 
}: QuestionDisplayProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    numbers: [4, 7, 9, 2, -5, 3],
  })

  // Calculate the expected answer
  const calculateExpectedAnswer = (): number => {
    return currentQuestion.numbers.reduce((sum, num) => sum + num, 0)
  }

  // Effect to handle generating a new question when requested by parent
  useEffect(() => {
    if (generateNew) {
      generateNewQuestion();
    }
  }, [generateNew]);

  // Effect to notify parent of the expected answer when the question changes
  useEffect(() => {
    const expectedAnswer = calculateExpectedAnswer();
    onQuestionGenerated(expectedAnswer);
  }, [currentQuestion, onQuestionGenerated]);

  // Generate a new random question
  const generateNewQuestion = () => {
    // Generate 2-5 numbers for the question
    const count = Math.floor(Math.random() * 4) + 2
    const numbers: number[] = []
    let runningTotal = 0
    
    for (let i = 0; i < count; i++) {
      if (i === 0) {
        // First number is always positive
        const num = Math.floor(Math.random() * 20) + 10 // Generate 10 to 29
        numbers.push(num)
        runningTotal = num
      } else {
        // Decide if this number will be positive or negative
        const isPositive = Math.random() > 0.5
        
        if (isPositive) {
          // Generate a positive number (1 to 15)
          const num = Math.floor(Math.random() * 15) + 1
          numbers.push(num)
          runningTotal += num
        } else {
          // Generate a negative number, but ensure it doesn't make the running total negative
          // Maximum we can subtract is the running total - 1 to ensure result stays positive
          const maxSubtract = Math.min(runningTotal - 1, 15) // Limit to -15 at most
          
          if (maxSubtract < 1) {
            // If we can't subtract anything, add a positive number instead
            const num = Math.floor(Math.random() * 15) + 1
            numbers.push(num)
            runningTotal += num
          } else {
            // Generate a negative number that won't make the total negative
            const num = -(Math.floor(Math.random() * maxSubtract) + 1)
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