"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Question, QuestionSettings, SpeechSettings, OperationType } from "../lib/question-types"
import { generateQuestion } from "../lib/question-generator"
import { useSpeechSynthesis } from "./SpeechSynthesisProvider"

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
  repeatQuestionAudio: () => void
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
  const { voices } = useSpeechSynthesis();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const currentQuestionRef = useRef<Question | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const defaultSpeechSettings = useMemo((): SpeechSettings => ({
    isEnabled: false,
    rate: 1,
    voiceURI: null,
  }), []);

  const [speechSettings, setSpeechSettings] = useState<SpeechSettings>(() => ({
    ...defaultSpeechSettings,
    ...initialSettings.speechSettings,
  }));

  const [internalSettings, setInternalSettings] = useState<Omit<QuestionSettings, "speechSettings">>(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { speechSettings, ...rest } = initialSettings;
    return rest;
  });

  const combinedSettings: QuestionSettings = useMemo(() => ({
    ...internalSettings,
    speechSettings,
  }), [internalSettings, speechSettings]);

  const settingsRef = useRef<QuestionSettings>(combinedSettings);

  const speakQuestion = useCallback(async (question: Question) => {
    const { speechSettings } = settingsRef.current;
    if (!speechSettings.isEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const plusTranslations: { [key: string]: string } = {
      'en': 'plus',
      'es': 'más',
      'fr': 'plus',
      'ru': 'плюс',
      'zh': '加',
      'cmn': '加',
      'yue': '加'
    };
    const minusTranslations: { [key: string]: string } = {
      'en': 'minus',
      'es': 'menos',
      'fr': 'moins',
      'ru': 'минус',
      'zh': '减',
      'cmn': '减',
      'yue': '减'
    };

    const availableVoices = voices;
    const selectedVoice = speechSettings.voiceURI ? availableVoices.find(voice => voice.voiceURI === speechSettings.voiceURI) : null;

    const lang = selectedVoice && selectedVoice.lang ? selectedVoice.lang.split('-')[0] : 'en';
    const plusWord = plusTranslations[lang] || 'plus';
    const minusWord = minusTranslations[lang] || 'minus';

    let textToSpeak = "";
    if (question.operationType === OperationType.ADD_SUBTRACT) {
      textToSpeak = question.operands.map((op, index) => {
        if (index === 0) return `${op}`;
        return op < 0 ? `${minusWord} ${Math.abs(op)}` : `${plusWord} ${op}`;
      }).join(" ");
    } else {
      textToSpeak = question.questionString.replace("=", "").trim();
    }

    const utterance = new SpeechSynthesisUtterance(`${textToSpeak} =`);
    utterance.rate = speechSettings.rate;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const playSound = useCallback((soundFile: string) => {
    if (typeof window === 'undefined') return;
    const audio = new Audio(soundFile);
    audio.play().catch(error => console.error("Error playing sound:", error));
  }, []);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    if (isWorksheetFinished && currentQuestionRef.current !== null) {
      return;
    }
    
    const settingsToUse = settingsRef.current;
    const newQuestion = generateQuestion(settingsToUse);
    setCurrentQuestion(newQuestion);
    setFeedback(null);
    setFeedbackType(null);
    speakQuestion(newQuestion);
  }, [isWorksheetFinished, speakQuestion]);

  useEffect(() => {
    const { speechSettings: newSpeechSettings, ...newRest } = initialSettings;

    setSpeechSettings({
      ...defaultSpeechSettings,
      ...newSpeechSettings,
    });

    setInternalSettings(newRest);
    setQuestionNumber(1);
  }, [initialSettings, defaultSpeechSettings]);

  const questionGenerationSettingsKey = useMemo(() => {
    return JSON.stringify(internalSettings);
  }, [internalSettings]);

  useEffect(() => {
    settingsRef.current = combinedSettings;
  }, [combinedSettings]);

  useEffect(() => {
    // This effect now only runs when the core question settings change,
    // because questionGenerationSettingsKey is stable across speechSettings changes.
    nextQuestion();
  }, [questionGenerationSettingsKey, nextQuestion]);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const refreshQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const checkAnswer = useCallback((userAnswer: number) => {
    if (!currentQuestion) return;

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    const isCorrect = userAnswer === currentQuestion.expectedAnswer;

    if (isCorrect) {
      setFeedback("Correct!");
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
      setFeedback(`Try again`);
      setFeedbackType("error");
      playSound('/sounds/wrong.wav');
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        setFeedbackType(null);
      }, 1000);
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

  const updateSpeechSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSpeechSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  }, []);

  const repeatQuestionAudio = useCallback(() => {
    if (currentQuestionRef.current) {
      speakQuestion(currentQuestionRef.current);
    }
  }, [speakQuestion]);

  const contextValue = {
    questionToDisplay: currentQuestion,
    feedback,
    feedbackType,
    refreshQuestion,
    checkAnswer,
    settings: combinedSettings,
    speechSettings: speechSettings,
    questionNumber,
    nextQuestion,
    updateSpeechSettings,
    repeatQuestionAudio,
  };

  return (
    <QuestionStateContext.Provider value={contextValue}>
      {children}
    </QuestionStateContext.Provider>
  );
};

export const useQuestionState = () => {
  const context = useContext(QuestionStateContext);
  if (context === undefined) {
    throw new Error("useQuestionState must be used within a QuestionStateProvider");
  }
  return context;
};