"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import FormulaDisplay from "@/components/FormulaDisplay"
import { QuestionSettings } from "@/lib/question-types"
import { deserializeSettingsFromUrl } from "@/lib/settings-serializer"
import { initializeRNG } from "@/lib/settings-utils"
import { QuestionStateProvider, useQuestionState } from "@/components/QuestionStateProvider"
import { useSettings } from "@/components/settings-provider"

export default function DigitalWorksheetPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentValue, setCurrentValue] = useState<number>(0)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)

  const [settings, setSettings] = useState<QuestionSettings | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [completedQuestions, setCompletedQuestions] = useState<number>(0)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  // Effect to parse URL parameters and set initial state
  useEffect(() => {
    const encodedSettings = searchParams.get('settings')
    const countParam = searchParams.get('count')

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


  const handleValueChange = (value: number) => {
    setCurrentValue(value)
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

  // Determine the title dynamically
  const pageTitle = settings ? `Digital Worksheet - ${settings.operationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : "Digital Worksheet";

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading worksheet or invalid settings...</p>
      </div>
    )
  }

  return (
    // Removed SidebarProvider, AppSidebar, SidebarInset
    <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
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
          onCorrectAnswer={handleCorrectWorksheetAnswer}
          isWorksheetFinished={isFinished}
        >
          <WorksheetContent
            currentValue={currentValue}
            handleValueChange={handleValueChange}
            abacusRef={abacusRef}
            handleAbacusSizeChange={handleAbacusSizeChange}
          />
        </QuestionStateProvider>
      )}
    </main>
  )
}

interface WorksheetContentProps {
  currentValue: number;
  handleValueChange: (value: number) => void;
  abacusRef: React.RefObject<{ resetAbacus: () => void } | null>;
  handleAbacusSizeChange: (size: { width: number; height: number }) => void;
}

const WorksheetContent: React.FC<WorksheetContentProps> = ({ currentValue, handleValueChange, abacusRef, handleAbacusSizeChange }) => {
  const { questionToDisplay, feedback, feedbackType, checkAnswer } = useQuestionState();
  const { settings } = useSettings(); // Re-get settings for display purposes

  return (
    <div className="w-full max-w-6xl flex flex-col items-center gap-8">
      <FormulaDisplay settings={settings} />

      {/* Main content area with flexbox layout */}
      <div className="w-full flex flex-col md:flex-row gap-8 items-center">
        {/* Question display - left side, takes remaining space */}
        <div className="flex flex-col items-center justify-center flex-grow md:min-w-80">
          <QuestionDisplay
            question={questionToDisplay}
            feedback={feedback}
            feedbackType={feedbackType}
          />
        </div>

        {/* Abacus - right side, determines its own width with fixed margin */}
        <div
          className="flex flex-col items-center flex-shrink-0"
          style={{
            marginLeft: '20px'
          }}
        >
          <AbacusDisplay
            ref={abacusRef}
            onValueChange={handleValueChange}
            onCheckAnswer={() => checkAnswer(currentValue)}
            numberOfAbacusColumns={settings.numberOfAbacusColumns}
            onSizeChange={handleAbacusSizeChange}
          />
        </div>
      </div>
    </div>
  );
};