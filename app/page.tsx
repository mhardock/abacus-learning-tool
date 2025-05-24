"use client"

import { useRef, useState } from "react"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import FormulaDisplay from "@/components/FormulaDisplay"
import { QuestionStateProvider, useQuestionState } from "@/components/QuestionStateProvider"

export default function Home() {
  const [currentValue, setCurrentValue] = useState<number>(0)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)
  const { settings } = useSettings() // Get settings from the provider
  
  const handleValueChange = (value: number) => {
    setCurrentValue(value)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#5d4037] mb-8">Abacus Practice</h1>
          
          <QuestionStateProvider initialSettings={settings} abacusRef={abacusRef}>
            <QuestionContent currentValue={currentValue} handleValueChange={handleValueChange} abacusRef={abacusRef} />
          </QuestionStateProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

interface QuestionContentProps {
  currentValue: number;
  handleValueChange: (value: number) => void;
  abacusRef: React.RefObject<{ resetAbacus: () => void } | null>;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ currentValue, handleValueChange, abacusRef }) => {
  const { settings } = useSettings(); // Re-get settings within the component that uses it
  const { questionToDisplay, feedback, feedbackType, checkAnswer } = useQuestionState();

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-8">
      <FormulaDisplay settings={settings} />
      
      {/* Main content area with two columns on larger screens */}
      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column - Question display */}
        <div className="md:col-span-2 flex flex-col items-center justify-center">
          <QuestionDisplay 
            question={questionToDisplay}
            feedback={feedback}
            feedbackType={feedbackType}
          />
        </div>

        {/* Right column - Abacus */}
        <div className="md:col-span-3 flex flex-col items-center">
          <AbacusDisplay
            ref={abacusRef}
            onValueChange={handleValueChange}
            onCheckAnswer={() => checkAnswer(currentValue)}
          />
        </div>
      </div>
    </div>
  );
};
