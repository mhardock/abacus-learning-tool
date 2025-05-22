"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import { QuestionSettings } from "@/lib/question-types"
import { getFormulaNameById, getDivisionFormulaNameByType } from "@/lib/formulas"
import { DivisionFormulaType } from "@/lib/settings-utils"
import { deserializeSettingsFromUrl } from "@/lib/settings-serializer"
import { initializeRNG } from "@/lib/settings-utils"

export default function DigitalWorksheetPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentValue, setCurrentValue] = useState<number>(0)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)

  const [settings, setSettings] = useState<QuestionSettings | null>(null)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [completedQuestions, setCompletedQuestions] = useState<number>(0)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const [questionData, setQuestionData] = useState({
    expectedAnswer: 0,
    feedback: null as string | null,
    feedbackType: null as "success" | "error" | null,
    generateNew: false
  })

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

  // Force initial question generation when settings are loaded
  useEffect(() => {
    if (settings) {
      setQuestionData(prev => ({
        ...prev,
        generateNew: !prev.generateNew
      }));
    }
  }, [settings]);

  // Effect to redirect when finished
  useEffect(() => {
    if (isFinished) {
      router.push('/worksheet-complete');
    }
  }, [isFinished, router]);


  const handleValueChange = (value: number) => {
    setCurrentValue(value)
  }

  const handleCheckAnswer = useCallback(() => {
    const isCorrect = currentValue === questionData.expectedAnswer

    if (isCorrect) {
      const newCompletedQuestions = completedQuestions + 1;
      setCompletedQuestions(newCompletedQuestions);

      const finished = newCompletedQuestions >= totalQuestions && totalQuestions > 0;
      setIsFinished(finished);

      setQuestionData(prev => ({
        ...prev,
        feedback: "Correct! Well done!",
        feedbackType: "success"
      }));

      setTimeout(() => {
        if (abacusRef.current) {
          abacusRef.current.resetAbacus();
        }
        setQuestionData(prev => ({
          ...prev,
          feedback: null,
          feedbackType: null,
          generateNew: !finished && !prev.generateNew // Only generate new if not finished
        }));
      }, 1000);
    } else {
      setQuestionData(prev => ({
        ...prev,
        feedback: `Not quite. Try again!`,
        feedbackType: "error"
      }));
    }
  }, [currentValue, questionData.expectedAnswer, completedQuestions, totalQuestions]);

  const onQuestionGenerated = useCallback((expectedAnswer: number) => {
    setQuestionData(prev => {
      if (prev.expectedAnswer === expectedAnswer && prev.generateNew === false) {
        return prev;
      }
      return {
        ...prev,
        expectedAnswer,
        feedback: prev.feedback,
        feedbackType: prev.feedbackType,
        generateNew: false
      };
    });
  }, []);

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

      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        {/* Current formula display - similar to app/page.tsx */}
        <div className="text-sm font-medium text-[#5d4037] mb-2">
          Current formula: {
            settings.operationType === 'add_subtract' && settings.addSubScenario
              ? getFormulaNameById(settings.addSubScenario)
              : settings.operationType === 'divide' && settings.divisionFormulaType
                ? getDivisionFormulaNameByType(settings.divisionFormulaType as DivisionFormulaType)
                : "N/A"
          }
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <QuestionDisplay
              feedback={questionData.feedback}
              feedbackType={questionData.feedbackType}
              generateNew={questionData.generateNew && !isFinished}
              onQuestionGenerated={onQuestionGenerated}
              settings={settings} // Use the decoded settings
            />
          </div>

          <div className="md:col-span-3 flex flex-col items-center">
            <AbacusDisplay
              ref={abacusRef}
              onValueChange={handleValueChange}
              onCheckAnswer={handleCheckAnswer}
            />
          </div>
        </div>
      </div>
    </main>
  )
}