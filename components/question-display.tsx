"use client"

import { forwardRef } from "react"
import React from "react"
import { Question, OperationType } from "../lib/question-types"


interface QuestionDisplayProps {
  question: Question | null
  feedback: string | null
  feedbackType: "success" | "error" | null
  questionNumber: number
}

const QuestionDisplay = forwardRef<HTMLDivElement, QuestionDisplayProps>(({
  question,
  feedback,
  feedbackType,
  questionNumber,
}, ref) => {
  if (!question || (!question.operands.length && !question.questionString)) {
    return <div className="text-center p-4">Loading question...</div>;
  }
  
interface DisplayElement {
  key: string;
  operator: string;
  number: string;
}
  
  // Format numbers for display (only for add_subtract)
  const displayElements: DisplayElement[] = [];
  if (question.operationType === OperationType.ADD_SUBTRACT) {
    question.operands.forEach((num, index) => {
      // Only show '-' operator. '+' is implied by lack of operator.
      const operator = num < 0 ? "-" : "";
      const absNum = Math.abs(num);
      displayElements.push({
        key: `${num}-${index}`,
        operator: operator,
        number: absNum.toString(),
      });
    });
  }

  const questionContainerMinHeight = () => {
    if (feedback && feedback.length > 20) return 'min-h-[320px]';
    if (question.operationType === OperationType.ADD_SUBTRACT && question.operands.length > 3) return 'min-h-[300px]';
    return 'min-h-[250px]';
  };

  return (
    <div ref={ref} className={`bg-white rounded-lg shadow-md p-6 w-full max-w-xs flex flex-col ${questionContainerMinHeight()}`}>
      <h2 className="text-xl font-semibold text-[#5d4037] mb-4 text-center">Question {questionNumber}</h2>
      <div className="flex flex-col items-center space-y-1 font-mono text-2xl md:text-3xl flex-grow justify-center">
        <div className="flex flex-col items-center w-full relative">
          {question.operationType === OperationType.ADD_SUBTRACT ? (
            <div className="flex flex-col items-center w-auto min-w-[5rem] max-w-[10rem]"> {/* Centered alignment for add/sub */}
              {displayElements.map((item) => (
                <div key={item.key} className="py-1 relative flex justify-center items-center w-full">
                  {/* Show '-' sign if present, otherwise ensure space for alignment */}
                  <div className="flex items-center justify-end w-4">
                    {item.operator === "-" && <span className="text-gray-500">{item.operator}</span>}
                  </div>
                  <span className="ml-1">{item.number}</span>
                </div>
              ))}
            </div>
          ) : (
            // Display for multiply/divide
            <div className="flex items-center justify-center text-3xl px-2 break-all">
              {/* Split the string by '=' to separate question from equals */}
              {/* Display the question part */}
              <span>{question.questionString.split('=')[0]?.trim()}</span>
              {/* Display the equals sign with spacing */}
              <span className="ml-2">=</span>
            </div>
          )}
          
          {/* Horizontal line only for add_subtract */}
          {(question.operationType === OperationType.ADD_SUBTRACT) && (
             <div className="border-t-2 border-[#5d4037] w-20 mt-2 pt-1 mx-auto"></div>
          )}
          
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