"use client"

import { useRef, useState } from "react"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import FormulaDisplay from "@/components/FormulaDisplay"
import { QuestionStateProvider, useQuestionState } from "@/components/QuestionStateProvider"
import { SpeechSettingsControl } from "@/components/SpeechSettingsControl"
import { PlaySpeechButton } from "@/components/PlaySpeechButton"

export default function Home() {
  const [currentValue, setCurrentValue] = useState<number>(0)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)
  const { settings } = useSettings() // Get settings from the provider
  
  const handleValueChange = (value: number) => {
    setCurrentValue(value)
  }

  const handleCorrectAnswer = (nextQuestion: () => void) => {
    setCurrentValue(0)
    setTimeout(() => {
      nextQuestion()
    }, 1000)
  }

  const handleAbacusSizeChange = () => {
    // Size change handling can be added here if needed in the future
  }
 
   const handleIncorrectAnswer = () => {
     setCurrentValue(0)
     abacusRef.current?.resetAbacus()
   }
 
   return (
     <SidebarProvider>
       <AppSidebar />
       <SidebarInset>
         <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
           <h1 className="text-3xl font-bold text-[#5d4037] mb-8">Abacus Practice</h1>
           
           <QuestionStateProvider
             initialSettings={settings}
             abacusRef={abacusRef}
             onCorrectAnswer={handleCorrectAnswer}
             onIncorrectAnswer={handleIncorrectAnswer}
           >
             <QuestionContent
               currentValue={currentValue}
              handleValueChange={handleValueChange}
              abacusRef={abacusRef}
              handleAbacusSizeChange={handleAbacusSizeChange}
            />
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
  handleAbacusSizeChange: (size: { width: number; height: number }) => void;
}

const QuestionContent: React.FC<QuestionContentProps> = ({ currentValue, handleValueChange, abacusRef, handleAbacusSizeChange }) => {
  const { settings, updateSettings } = useSettings(); // Re-get settings within the component that uses it
  const { questionToDisplay, feedback, feedbackType, checkAnswer, questionNumber } = useQuestionState();

  return (
    <div className="w-full max-w-6xl flex flex-col items-center gap-8 relative">
      <FormulaDisplay settings={settings} />
      
      {settings.speechSettings.isEnabled && (
        <div className="flex flex-col items-center gap-2">
          <SpeechSettingsControl
            settings={settings.speechSettings}
            onSettingsChange={(updatedSpeechSettings) => {
              updateSettings({ speechSettings: updatedSpeechSettings });
            }}
          />
          {questionToDisplay && <PlaySpeechButton />}
        </div>
      )}

      {/* Main content area with flexbox layout */}
      <div className="w-full flex flex-col md:flex-row gap-8 items-center">
        {/* Question display - left side, takes remaining space */}
        <div className="flex flex-col items-center justify-center flex-grow md:min-w-80">
          <QuestionDisplay
            question={questionToDisplay}
            feedback={feedback}
            feedbackType={feedbackType}
            questionNumber={questionNumber}
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
            isImage={settings.isImage}
            value={currentValue}
          />
        </div>
      </div>
    </div>
  );
};
