"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image" // Import Image component
import AbacusDisplay from "@/components/abacus-display"
import Keypad from "@/components/keypad";
import { AnswerInput } from "@/components/answer-input";
import QuestionDisplay from "@/components/question-display"
import FormulaDisplay from "@/components/FormulaDisplay"
import { QuestionSettings } from "@/lib/question-types"
import { deserializeSettingsFromUrl } from "@/lib/settings-serializer"
import { initializeRNG } from "@/lib/settings-utils"
import { QuestionStateProvider, useQuestionState } from "@/components/QuestionStateProvider"
import { SpeechSettingsControl } from "@/components/SpeechSettingsControl"
import { PlaySpeechButton } from "@/components/PlaySpeechButton"

export default function DigitalWorksheetPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentValue, setCurrentValue] = useState<number | null>(null)
  const [abacusValue, setAbacusValue] = useState<number>(0)
  const [customPageTitle, setCustomPageTitle] = useState<string>('');
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)

  const [settings, setSettings] = useState<QuestionSettings | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [completedQuestions, setCompletedQuestions] = useState<number>(0)
  const [isFinished, setIsFinished] = useState<boolean>(false)


  // Effect to parse URL parameters and set initial state
  useEffect(() => {
    const encodedSettings = searchParams.get('settings')
    const countParam = searchParams.get('count')
    const titleParam = searchParams.get('title')

    if (titleParam) {
      setCustomPageTitle(titleParam);
    }

    let decompressedSettings: QuestionSettings | null = null;
    if (encodedSettings) {
      try {
        decompressedSettings = deserializeSettingsFromUrl(encodedSettings);
      } catch (error) {
        console.error("Failed to decompress settings:", error);
      }
    }

    if (decompressedSettings && typeof decompressedSettings === 'object' && 'operationType' in decompressedSettings) {
      initializeRNG(decompressedSettings);
      setSettings(decompressedSettings);
    } else {
      console.error("Invalid or missing settings in URL.");
      // Optionally, redirect to an error page or homepage
      // router.push('/')
    }

    const count = parseInt(countParam || '0', 10)
    if (!isNaN(count) && count > 0) {
      setTotalQuestions(count)
    } else {
      console.warn("Invalid or missing count in URL, defaulting to 0.")
    }
  }, [searchParams])

  // Effect to redirect when finished
  useEffect(() => {
    if (isFinished) {
      router.push('/worksheet-complete');
    }
  }, [isFinished, router]);


  const handleAnswerChange = (value: number | null) => {
    setCurrentValue(value)
  }

  const handleAbacusChange = (value: number) => {
    setAbacusValue(value)
  }

  const handleAbacusSizeChange = () => {
    // Size change handling can be added here if needed in the future
  }

  const handleCorrectWorksheetAnswer = useCallback(() => {
    const newCompleted = completedQuestions + 1;
    setCompletedQuestions(newCompleted);
    if (totalQuestions > 0 && newCompleted >= totalQuestions) {
      setIsFinished(true);
    }
  }, [completedQuestions, totalQuestions]);

  const handleCorrectAnswer = (nextQuestion: () => void) => {
    handleCorrectWorksheetAnswer();
    setCurrentValue(null);
    setAbacusValue(0);
    setTimeout(() => {
      abacusRef?.current?.resetAbacus();
      nextQuestion();
    }, 1000);
  };

  const handleIncorrectAnswer = () => {
    setCurrentValue(null)
    setAbacusValue(0)
    abacusRef?.current?.resetAbacus()
  }
 
   // Determine the title dynamically
   const pageTitle = customPageTitle || (settings ? `Digital Worksheet - ${settings.operationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : "Digital Worksheet");
 
   if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading worksheet or invalid settings...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0e6]">
      <main className="flex-grow p-8 flex flex-col items-center relative">
        {/* Logo at top-left */}
        <div className="absolute top-4 left-4">
          <Image src="/easymath_logo.jpg" alt="Easy Math Logo" width={100} height={100} />
        </div>

        <h1 className="text-3xl font-bold text-[#5d4037] mb-4">{pageTitle}</h1>
        
        {totalQuestions > 0 && !isFinished && (
          <div className="text-lg font-semibold text-[#5d4037] mb-8">
            Questions Completed: {completedQuestions}/{totalQuestions}
          </div>
        )}

        {settings && (
          <QuestionStateProvider
            initialSettings={settings}
            abacusRef={abacusRef}
            onCorrectAnswer={handleCorrectAnswer}
            onIncorrectAnswer={handleIncorrectAnswer}
            isWorksheetFinished={isFinished}
          >
            <WorksheetContent
              currentValue={currentValue}
              abacusValue={abacusValue}
              handleAnswerChange={handleAnswerChange}
              handleAbacusChange={handleAbacusChange}
              abacusRef={abacusRef}
              handleAbacusSizeChange={handleAbacusSizeChange}
              setCurrentValue={setCurrentValue}
            />
          </QuestionStateProvider>
        )}
      </main>
      <Footer />
    </div>
  )
}

interface WorksheetContentProps {
  currentValue: number | null;
  abacusValue: number;
  handleAnswerChange: (value: number | null) => void;
  handleAbacusChange: (value: number) => void;
  abacusRef: React.RefObject<{ resetAbacus: () => void } | null>;
  handleAbacusSizeChange: (size: { width: number; height: number }) => void;
  setCurrentValue: (value: number | null) => void;
}

const WorksheetContent: React.FC<WorksheetContentProps> = ({
  currentValue,
  abacusValue,
  handleAnswerChange,
  handleAbacusChange,
  abacusRef,
  handleAbacusSizeChange,
  setCurrentValue,
}) => {
  const { questionToDisplay, feedback, feedbackType, checkAnswer, settings, questionNumber, speechSettings, updateSpeechSettings } = useQuestionState();

  return (
    <div className="w-full max-w-6xl flex flex-col items-center gap-8">
      <FormulaDisplay settings={settings} />

      {settings.speechSettings?.isEnabled && (
        <div className="flex flex-col items-center gap-2">
          <SpeechSettingsControl
            settings={speechSettings}
            updateSpeechSettings={updateSpeechSettings}
          />
          {questionToDisplay && <PlaySpeechButton />}
        </div>
      )}

      {/* Main content area with three-column layout */}
      <div className="w-full flex flex-row justify-between items-start gap-8">
        {/* Left Column (Abacus) */}
        <div className="w-1/3">
          {!settings.isImage && (
            <AbacusDisplay
              ref={abacusRef}
              onValueChange={handleAbacusChange}
              numberOfAbacusColumns={settings.numberOfAbacusColumns}
              onSizeChange={handleAbacusSizeChange}
            />
          )}
        </div>

        {/* Middle Column (Question & Answer) */}
        <div className="flex-grow flex flex-col items-center gap-4">
          <div className="flex flex-col items-center justify-center flex-grow">
            <QuestionDisplay
              question={questionToDisplay}
              feedback={feedback}
              feedbackType={feedbackType}
              questionNumber={questionNumber}
            />
          </div>
          <AnswerInput
            value={currentValue}
            onValueChange={handleAnswerChange}
            onCheckAnswer={() => {
              if (currentValue !== null) {
                checkAnswer(currentValue)
              } else {
                checkAnswer(abacusValue)
              }
            }}
            onClearAbacus={() => {
              abacusRef.current?.resetAbacus()
              setCurrentValue(null)
            }}
          />
        </div>

        {/* Right Column (Keypad) */}
        <div className="w-1/3">
          <Keypad
            value={currentValue ?? 0}
            onValueChange={handleAnswerChange}
          />
        </div>
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="w-full text-center text-sm text-[#5d4037] py-4">
    © 2025 Easy Math for Kids
  </footer>
);