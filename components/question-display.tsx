"use client"

import { useState } from "react"

interface Question {
  numbers: number[]
  operation: "add" | "subtract"
}

interface QuestionDisplayProps {
  currentValue: number
  onCheckAnswer: (isCorrect: boolean) => void
}

export default function QuestionDisplay({ currentValue, onCheckAnswer }: QuestionDisplayProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    numbers: [4, 7, 9, 2, -5, 3],
    operation: "add",
  })

  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)

  // Calculate the expected answer
  const calculateExpectedAnswer = (): number => {
    if (currentQuestion.operation === "add") {
      return currentQuestion.numbers.reduce((sum, num) => sum + num, 0)
    } else {
      // For subtraction, start with the first number and subtract the rest
      return currentQuestion.numbers.reduce((result, num, index) => (index === 0 ? num : result - num), 0)
    }
  }

  // Check if the student's answer is correct
  const checkAnswer = () => {
    const expectedAnswer = calculateExpectedAnswer()
    const isCorrect = currentValue === expectedAnswer

    if (isCorrect) {
      setFeedback("Correct! Well done!")
      setFeedbackType("success")

      // Generate a new question after a delay
      setTimeout(() => {
        generateNewQuestion()
        setFeedback(null)
      }, 2000)
    } else {
      setFeedback(`Not quite. Try again! The answer should be ${expectedAnswer}.`)
      setFeedbackType("error")
    }

    onCheckAnswer(isCorrect)
  }

  // Generate a new random question
  const generateNewQuestion = () => {
    const operations = ["add", "subtract"] as const
    const operation = operations[Math.floor(Math.random() * operations.length)]

    // Generate 2-5 numbers for the question
    const count = Math.floor(Math.random() * 4) + 2
    const numbers = Array(count)
      .fill(0)
      .map(() => Math.floor(Math.random() * 20) - 5)

    setCurrentQuestion({
      numbers,
      operation,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xs">
      <h2 className="text-xl font-semibold text-[#5d4037] mb-4 text-center">Problem</h2>

      <div className="flex flex-col items-end space-y-1 font-mono text-xl">
        {/* Display the operation symbol before the numbers (except the first) */}
        {currentQuestion.numbers.map((num, index) => (
          <div key={index} className="flex items-center w-full justify-end">
            {index > 0 && currentQuestion.operation === "subtract" && <span className="mr-4">-</span>}
            <span>{num}</span>
          </div>
        ))}

        {/* Horizontal line */}
        <div className="border-t-2 border-[#5d4037] w-full mt-2 pt-1"></div>

        {/* Answer placeholder */}
        <div className="h-7"></div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className={`mt-4 text-center ${feedbackType === "success" ? "text-green-600" : "text-red-600"}`}>
          {feedback}
        </div>
      )}

      {/* Submit button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={checkAnswer}
          className="px-4 py-2 bg-[#8d6e63] hover:bg-[#6d4c41] text-white font-medium rounded-lg shadow-md transition-colors"
        >
          Check Answer
        </button>
      </div>
    </div>
  )
}
