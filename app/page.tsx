"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import { getFormulaNameById, getDivisionFormulaNameByType } from "@/lib/formulas"
import { DivisionFormulaType } from "@/lib/settings-utils"
// import { OperationType } from "@/lib/question-generator"; // Moved import to top

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

      // Clear the abacus and generate a new question after a 1-second delay
      setTimeout(() => {
        if (abacusRef.current) {
          abacusRef.current.resetAbacus()
        }
        // Signal QuestionDisplay to generate a new question
        setQuestionData(prev => ({
          ...prev,
          feedback: null, // Clear feedback for the new question
          feedbackType: null,
          generateNew: !prev.generateNew // Toggle to generate new question
        }))
      }, 1000) // 1000 milliseconds = 1 second
    } else {
      setQuestionData(prev => ({
        ...prev,
        feedback: `Not quite. Try again!`,
        feedbackType: "error"
      }))
    }
  }, [currentValue, questionData.expectedAnswer]);


// ... (other code) ...

  // Called by QuestionDisplay when a new question is generated
  const onQuestionGenerated = useCallback((expectedAnswer: number) => {
    
    // Only update if the expected answer has actually changed
    setQuestionData(prev => {
      if (prev.expectedAnswer === expectedAnswer && prev.generateNew === false) {
        // No changes needed, return the previous state to avoid a re-render
        return prev;
      }
      // Otherwise, update with the new answer
      return {
        ...prev,
        expectedAnswer,
        feedback: prev.feedback, // Keep existing feedback until explicitly cleared
        feedbackType: prev.feedbackType, // Keep existing feedback type
        generateNew: false // Reset generateNew flag
      };
    });
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#5d4037] mb-8">Abacus Practice</h1>
          
          <div className="w-full max-w-4xl flex flex-col items-center gap-8">
            {/* Current formula display */}
            <div className="text-sm font-medium text-[#5d4037] mb-2">
              Current formula: {
                settings.operationType === 'add_subtract' && settings.addSubScenario
                  ? getFormulaNameById(settings.addSubScenario)
                  : settings.operationType === 'divide' && settings.divisionFormulaType
                    ? getDivisionFormulaNameByType(settings.divisionFormulaType as DivisionFormulaType)
                    : "N/A"
              }
            </div>
            
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
