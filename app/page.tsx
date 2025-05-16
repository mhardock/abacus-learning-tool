"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"

export default function Home() {
  const [currentValue, setCurrentValue] = useState<number>(0)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)
  const { settings } = useSettings() // Get settings from the provider
  
  // State to track the current question and expected answer
  const [questionData, setQuestionData] = useState({
    expectedAnswer: 20, // Initial value
    feedback: null as string | null,
    feedbackType: null as "success" | "error" | null,
    generateNew: false // Flag to generate new question
  })

  // Force a refresh of the question with current settings
  const refreshQuestion = useCallback(() => {
    setQuestionData(prev => ({
      ...prev,
      generateNew: !prev.generateNew
    }));
  }, []);

  // Force initial question generation when the component mounts
  useEffect(() => {
    // Create the initial question when the component mounts
    refreshQuestion();
  }, [refreshQuestion]);

  const handleValueChange = (value: number) => {
    setCurrentValue(value)
  }

  // This function will be passed to the AbacusDisplay component
  const handleCheckAnswer = useCallback(() => {
    const isCorrect = currentValue === questionData.expectedAnswer
    
    if (isCorrect) {
      setQuestionData(prev => ({
        ...prev,
        feedback: "Correct! Well done!",
        feedbackType: "success"
      }))

      // Clear the abacus and generate a new question after a delay
      setTimeout(() => {
        if (abacusRef.current) {
          abacusRef.current.resetAbacus()
        }
        // Signal QuestionDisplay to generate a new question
        setQuestionData(prev => ({
          ...prev,
          feedback: null,
          feedbackType: null,
          generateNew: !prev.generateNew // Toggle to generate new question
        }))
      }, 2000)
    } else {
      setQuestionData(prev => ({
        ...prev,
        feedback: `Not quite. Try again!`,
        feedbackType: "error"
      }))
    }
  }, [currentValue, questionData.expectedAnswer]);

  // Called by QuestionDisplay when a new question is generated
  const onQuestionGenerated = useCallback((expectedAnswer: number) => {
    setQuestionData(prev => ({
      ...prev,
      expectedAnswer,
      feedback: prev.feedback,
      feedbackType: prev.feedbackType,
      generateNew: false
    }));
  }, []);

  // Display current settings in the UI for debugging
  const formulaNames: Record<number, string> = {
    1: "Simple 1-4",
    2: "Simple 1-5",
    3: "Simple 1-9",
    4: "Friends +",
    5: "Friends +/-",
    6: "Relatives +",
    7: "Relatives +/-",
    8: "Mix +",
    9: "Mix +/-"
  };
  
  const settingsDebug = `Min Teams: ${settings.minNumbers}, Max Teams: ${settings.maxNumbers}, Formula: ${formulaNames[settings.scenario] || settings.scenario}`;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#5d4037] mb-8">Abacus Practice</h1>

          <div className="w-full max-w-4xl flex flex-col items-center gap-8">
            {/* Debug info - can be removed later */}
            <div className="text-sm text-gray-600 mb-2">{settingsDebug}</div>
            
            {/* Main content area with two columns on larger screens */}
            <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Left column - Question display */}
              <div className="md:col-span-2 flex flex-col items-center justify-center">
                <QuestionDisplay 
                  feedback={questionData.feedback}
                  feedbackType={questionData.feedbackType}
                  generateNew={questionData.generateNew}
                  onQuestionGenerated={onQuestionGenerated}
                  settings={settings}
                />
              </div>

              {/* Right column - Abacus */}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
