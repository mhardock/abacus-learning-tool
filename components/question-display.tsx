"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import React from "react"
import { Question, QuestionSettings, generateQuestion, OperationType } from "@/lib/question-generator"
import { defaultSettings as globalDefaultSettings } from "@/lib/settings-utils"


interface QuestionDisplayProps {
  feedback: string | null
  feedbackType: "success" | "error" | null
  generateNew: boolean
  onQuestionGenerated: (expectedAnswer: number, operationType: OperationType) => void // Pass operationType too
  settings?: QuestionSettings // This should be FullQuestionSettings
}

// Define the handle type for the ref
export interface QuestionDisplayHandle {
  generateSorobanQuestion: (newSettings?: Partial<QuestionSettings>) => void; // Allow passing partial settings
}

const QuestionDisplay = forwardRef<QuestionDisplayHandle, QuestionDisplayProps>(({
  feedback,
  feedbackType,
  generateNew,
  onQuestionGenerated,
  settings: initialSettingsFromProps // Renamed for clarity
}, ref) => {

  // Ensure initialSettingsFromProps is a complete QuestionSettings object
  const [componentSettings, setComponentSettings] = useState<QuestionSettings>(
    initialSettingsFromProps ? { ...globalDefaultSettings, ...initialSettingsFromProps } : { ...globalDefaultSettings }
  );

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    operands: [],
    expectedAnswer: 0,
    questionString: "",
    operationType: componentSettings.operationType || 'add_subtract',
  });
  
  const previousGenerateNew = useRef(generateNew);
  const lastAnswerRef = useRef<number | null>(null);
  const lastSettingsRef = useRef(componentSettings);

  // Update componentSettings when initialSettingsFromProps prop changes
  useEffect(() => {
    if (initialSettingsFromProps) {
      // Basic check to see if settings actually changed to avoid loop with parent if parent derives from this
      if (JSON.stringify(initialSettingsFromProps) !== JSON.stringify(lastSettingsRef.current)) {
         setComponentSettings({ ...globalDefaultSettings, ...initialSettingsFromProps });
      }
    }
  }, [initialSettingsFromProps]);
  
  // Effect to handle initialization or when componentSettings changes
  useEffect(() => {
    // Only regenerate if settings have actually changed, or if it's the first load (operands empty)
    if (currentQuestion.operands.length === 0 || JSON.stringify(componentSettings) !== JSON.stringify(lastSettingsRef.current)) {
      // console.log("Generating question due to init or settings change. New Settings:", componentSettings);
      const newQuestion = generateQuestion(componentSettings);
      setCurrentQuestion(newQuestion);
      lastSettingsRef.current = componentSettings; // Update ref after using new settings
    }
  }, [componentSettings, currentQuestion.operands.length]);

  // Effect to handle the generateNew prop change for manual refresh
  useEffect(() => {
    if (generateNew !== previousGenerateNew.current) {
      // console.log("Generating question due to generateNew toggle. Current Settings:", componentSettings);
      previousGenerateNew.current = generateNew;
      const newQuestion = generateQuestion(componentSettings);
      setCurrentQuestion(newQuestion);
    }
  }, [generateNew, componentSettings]);

  // Effect to notify parent of the expected answer when the question changes
  useEffect(() => {
    if (currentQuestion.operands.length > 0 || currentQuestion.questionString) { // Ensure question is populated
      if (lastAnswerRef.current !== currentQuestion.expectedAnswer || !currentQuestion.operands.length) { // Fire if answer changes or if it was empty before
        lastAnswerRef.current = currentQuestion.expectedAnswer;
        onQuestionGenerated(currentQuestion.expectedAnswer, currentQuestion.operationType);
      }
    }
  }, [currentQuestion, onQuestionGenerated]);

  // Expose generateSorobanQuestion via ref
  useImperativeHandle(ref, () => ({
    generateSorobanQuestion: (newSettings?: Partial<QuestionSettings>) => {
      let settingsToUse = componentSettings;
      if (newSettings) {
        // console.log("generateSorobanQuestion called with new partial settings:", newSettings);
        // It's crucial that QuestionSettingsPage passes validated settings here
        settingsToUse = { ...componentSettings, ...newSettings };
        setComponentSettings(settingsToUse); // This will trigger the useEffect above
      } else {
        // console.log("generateSorobanQuestion called (no new settings). Current settings:", componentSettings);
        // If no new settings, just regenerate with current settings
        // This path might be less used if QuestionSettingsPage always passes settings
        const newQuestion = generateQuestion(settingsToUse);
        setCurrentQuestion(newQuestion);
      }
    }
  }));

  if (!currentQuestion || (!currentQuestion.operands.length && !currentQuestion.questionString)) {
    return <div className="text-center p-4">Loading question...</div>;
  }
  
interface DisplayElement {
  key: string;
  operator: string;
  number: string;
}
  
  // Format numbers for display (only for add_subtract)
  const displayElements: DisplayElement[] = [];
  if (currentQuestion.operationType === 'add_subtract') {
    currentQuestion.operands.forEach((num, index) => {
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
    if (currentQuestion.operationType === 'add_subtract' && currentQuestion.operands.length > 3) return 'min-h-[300px]';
    return 'min-h-[250px]';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 w-full max-w-xs flex flex-col ${questionContainerMinHeight()}`}>
      <h2 className="text-xl font-semibold text-[#5d4037] mb-4 text-center">Problem</h2>

      <div className="flex flex-col items-center space-y-1 font-mono text-2xl md:text-3xl flex-grow justify-center">
        <div className="flex flex-col items-center w-full relative">
          {currentQuestion.operationType === 'add_subtract' ? (
            <div className="flex flex-col items-end w-auto min-w-[5rem] max-w-[10rem]"> {/* Adjusted width for add/sub */}
              {displayElements.map((item, index) => (
                <div key={item.key} className="py-1 relative flex items-center">
                  {/* Show '-' sign if present, otherwise ensure space for alignment if not the first number */}
                  {item.operator === "-" && <span className="mr-2 text-gray-500">{item.operator}</span>}
                  {index > 0 && item.operator !== "-" && <span className="mr-2 text-gray-500 opacity-0">-</span>} {/* Alignment placeholder for non-first positive numbers */}
                  {/* For the first number, if positive, no operator or placeholder before it */}
                   <span>{item.number}</span>
                </div>
              ))}
            </div>
          ) : (
            // Display for multiply/divide
            <div className="flex items-center justify-center text-3xl px-2 break-all">
              {/* Split the string by '=' to separate question from equals */}
              {/* Display the question part */}
              <span>{currentQuestion.questionString.split('=')[0]?.trim()}</span>
              {/* Display the equals sign with spacing */}
              <span className="ml-2">=</span>
            </div>
          )}
          
          {/* Horizontal line only for add_subtract */}
          {(currentQuestion.operationType === 'add_subtract') && (
             <div className="border-t-2 border-[#5d4037] w-20 mt-2 pt-1"></div>
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