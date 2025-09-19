"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { Question, QuestionSettings } from "../lib/question-types"
import { generateQuestion } from "../lib/question-generator"

// Define the shape of the context
interface QuestionStateContextType {
  questionToDisplay: Question | null
  feedback: string | null
  feedbackType: "success" | "error" | null
  refreshQuestion: () => void
  checkAnswer: (userAnswer: number) => void
  settings: QuestionSettings
  questionNumber: number
}

// Create the context
const QuestionStateContext = createContext<QuestionStateContextType | undefined>(undefined)

// Props for the provider
interface QuestionStateProviderProps {
  children: React.ReactNode
  initialSettings: QuestionSettings
  abacusRef?: React.RefObject<{ resetAbacus: () => void } | null>
  onCorrectAnswer?: () => void
  isWorksheetFinished?: boolean
}

export const QuestionStateProvider: React.FC<QuestionStateProviderProps> = ({
  children,
  initialSettings,
  abacusRef,
  onCorrectAnswer,
  isWorksheetFinished = false,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)

  // Use a ref to store the latest settings to avoid stale closures in effects
  const settingsRef = useRef<QuestionSettings>(initialSettings);
  const [internalSettings, setInternalSettings] = useState<QuestionSettings>(initialSettings);

  // Function to generate a new question
  const generateNewQuestion = useCallback(() => {
    if (isWorksheetFinished && currentQuestion !== null) {
      // If worksheet is finished and a question has already been generated, do not generate new ones
      return;
    }
    
    // Ensure settingsRef.current is up-to-date before generating
    const settingsToUse = settingsRef.current;
    const newQuestion = generateQuestion(settingsToUse);
    setCurrentQuestion(newQuestion);
    setFeedback(null);
    setFeedbackType(null);
  }, [isWorksheetFinished, currentQuestion]);

  // Effect to update internalSettings state when initialSettings prop changes
  // Deep comparison to avoid unnecessary re-renders and question generations
  useEffect(() => {
    if (JSON.stringify(initialSettings) !== JSON.stringify(settingsRef.current)) {
      settingsRef.current = initialSettings;
      setInternalSettings(initialSettings);
      setQuestionNumber(1)
      generateNewQuestion();
    }
  }, [initialSettings, generateNewQuestion]);

  // Effect to generate the first question when internalSettings are available
  useEffect(() => {
    if (internalSettings && currentQuestion === null) {
      generateNewQuestion();
    }
  }, [internalSettings, currentQuestion, generateNewQuestion]);

  // Public function to refresh the question
  const refreshQuestion = useCallback(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  // Public function to check the answer
  const checkAnswer = useCallback((userAnswer: number) => {
    if (!currentQuestion) return;

    const isCorrect = userAnswer === currentQuestion.expectedAnswer;

    if (isCorrect) {
      setFeedback("Correct! Well done!");
      setFeedbackType("success");
      setQuestionNumber(prev => prev + 1)
      onCorrectAnswer?.(); // Call the provided callback for correct answers

      setTimeout(() => {
        abacusRef?.current?.resetAbacus();
        generateNewQuestion(); // Generate a new question after delay
      }, 1000);
    } else {
      setFeedback(`Not quite. Try again!`);
      setFeedbackType("error");
    }
  }, [currentQuestion, abacusRef, onCorrectAnswer, generateNewQuestion]);

  const contextValue = {
    questionToDisplay: currentQuestion,
    feedback,
    feedbackType,
    refreshQuestion,
    checkAnswer,
    settings: internalSettings,
    questionNumber,
  };

  return (
    <QuestionStateContext.Provider value={contextValue}>
      {children}
    </QuestionStateContext.Provider>
  );
};

// Custom hook to use the QuestionStateContext
export const useQuestionState = () => {
  const context = useContext(QuestionStateContext);
  if (context === undefined) {
    throw new Error("useQuestionState must be used within a QuestionStateProvider");
  }
  return context;
};