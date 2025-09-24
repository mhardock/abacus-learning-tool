"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Question, QuestionSettings, SpeechSettings, OperationType } from "../lib/question-types"
import { generateQuestion } from "../lib/question-generator"

// Define the shape of the context
interface QuestionStateContextType {
  questionToDisplay: Question | null
  feedback: string | null
  feedbackType: "success" | "error" | null
  refreshQuestion: () => void
  checkAnswer: (userAnswer: number) => void
  settings: QuestionSettings
  speechSettings: SpeechSettings
  questionNumber: number
  nextQuestion: () => void
  updateSpeechSettings: (settings: Partial<SpeechSettings>) => void
}

// Create the context
const QuestionStateContext = createContext<QuestionStateContextType | undefined>(undefined)

// Props for the provider
interface QuestionStateProviderProps {
  children: React.ReactNode
  initialSettings: QuestionSettings
  abacusRef?: React.RefObject<{ resetAbacus: () => void } | null>
  onCorrectAnswer?: (nextQuestion: () => void) => void;
  onIncorrectAnswer?: () => void;
  isWorksheetFinished?: boolean
}

export const QuestionStateProvider: React.FC<QuestionStateProviderProps> = ({
  children,
  initialSettings,
  abacusRef,
  onCorrectAnswer,
  onIncorrectAnswer,
  isWorksheetFinished = false,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const currentQuestionRef = useRef<Question | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1);
  const [, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const defaultSpeechSettings = useMemo((): SpeechSettings => ({
    isEnabled: false,
    rate: 1,
    voiceURI: null,
  }), []);

  const [internalSettings, setInternalSettings] = useState<QuestionSettings>(() => {
    const mergedSettings = {
      ...initialSettings,
      speechSettings: {
        ...defaultSpeechSettings,
        ...initialSettings.speechSettings,
      },
    };
    return mergedSettings;
  });

  const settingsRef = useRef<QuestionSettings>(internalSettings);

  // Effect to load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    // Load voices immediately if they are already available
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }

    // Listen for voices changed event
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speakQuestion = useCallback(async (question: Question) => {
    const { speechSettings } = settingsRef.current;
    if (!speechSettings.isEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    // Helper to get voices, waiting if necessary
    const getVoicesAsync = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        const currentVoices = window.speechSynthesis.getVoices();
        if (currentVoices.length > 0) {
          resolve(currentVoices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
            window.speechSynthesis.onvoiceschanged = null; // Clean up
          };
        }
      });
    };

    const availableVoices = await getVoicesAsync();

    let textToSpeak = "";
    if (question.operationType === OperationType.ADD_SUBTRACT) {
      textToSpeak = question.operands.map((op, index) => {
        if (index === 0) return `${op}`;
        return op < 0 ? `minus ${Math.abs(op)}` : `plus ${op}`;
      }).join(" ");
    } else {
      textToSpeak = question.questionString.replace("=", "").trim();
    }

    const utterance = new SpeechSynthesisUtterance(`${textToSpeak} =`);
    utterance.rate = speechSettings.rate;

    if (speechSettings.voiceURI) {
      const selectedVoice = availableVoices.find(voice => voice.voiceURI === speechSettings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []); // No dependency on 'voices' state anymore, as it's handled internally

  const playSound = useCallback((soundFile: string) => {
    if (typeof window === 'undefined') return;
    const audio = new Audio(soundFile);
    audio.play().catch(error => console.error("Error playing sound:", error));
  }, []);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // Function to generate a new question
  const nextQuestion = useCallback(() => {
    if (isWorksheetFinished && currentQuestionRef.current !== null) {
      // If worksheet is finished and a question has already been generated, do not generate new ones
      return;
    }
    
    // Ensure settingsRef.current is up-to-date before generating
    const settingsToUse = settingsRef.current;
    const newQuestion = generateQuestion(settingsToUse);
    setCurrentQuestion(newQuestion);
    setFeedback(null);
    setFeedbackType(null);
    speakQuestion(newQuestion);
  }, [isWorksheetFinished, speakQuestion]);

  useEffect(() => {
    const newSettings = {
      ...initialSettings,
      speechSettings: {
        ...defaultSpeechSettings,
        ...initialSettings.speechSettings,
      },
    };
    if (JSON.stringify(newSettings) !== JSON.stringify(internalSettings)) {
      setInternalSettings(newSettings);
      setQuestionNumber(1);
    }
  }, [initialSettings, defaultSpeechSettings, internalSettings]);

  useEffect(() => {
    settingsRef.current = internalSettings;
    nextQuestion();
  }, [internalSettings, nextQuestion]);

  // Public function to refresh the question
  const refreshQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  // Public function to check the answer
  const checkAnswer = useCallback((userAnswer: number) => {
    if (!currentQuestion) return;

    const isCorrect = userAnswer === currentQuestion.expectedAnswer;

    if (isCorrect) {
      setFeedback("Correct! Well done!");
      setFeedbackType("success");
      playSound('/sounds/correct.mp3');
      setQuestionNumber(prev => prev + 1)
      
      const handleNextQuestion = () => {
        abacusRef?.current?.resetAbacus();
        nextQuestion();
      };

      if (onCorrectAnswer) {
        onCorrectAnswer(handleNextQuestion);
      } else {
        setTimeout(handleNextQuestion, 1000);
      }
    } else {
      setFeedback(`Not quite. Try again!`);
      setFeedbackType("error");
      playSound('/sounds/wrong.wav');
      if (settingsRef.current.speechSettings.isEnabled) {
        setTimeout(() => {
          if (currentQuestionRef.current) {
            speakQuestion(currentQuestionRef.current);
          }
        }, 1000);
      }
      if (onIncorrectAnswer) {
        setTimeout(() => {
          onIncorrectAnswer();
        }, 1000);
      }
    }
  }, [currentQuestion, abacusRef, onCorrectAnswer, onIncorrectAnswer, nextQuestion, speakQuestion, playSound]);

  const updateSpeechSettings = useCallback((newSpeechSettings: Partial<SpeechSettings>) => {
    setInternalSettings(prevSettings => ({
      ...prevSettings,
      speechSettings: {
        ...prevSettings.speechSettings,
        ...newSpeechSettings,
      },
    }));
  }, []);

  const contextValue = {
    questionToDisplay: currentQuestion,
    feedback,
    feedbackType,
    refreshQuestion,
    checkAnswer,
    settings: internalSettings,
    speechSettings: internalSettings.speechSettings,
    questionNumber,
    nextQuestion,
    updateSpeechSettings,
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