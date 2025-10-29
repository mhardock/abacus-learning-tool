"use client"

import { useRef, useState } from "react"
import AbacusDisplay from "@/components/abacus-display"
import Keypad from "@/components/keypad";
import { AnswerInput } from "@/components/answer-input";
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import FormulaDisplay from "@/components/FormulaDisplay"
import { QuestionStateProvider, useQuestionState } from "@/components/QuestionStateProvider"
import { SpeechSettingsControl } from "@/components/SpeechSettingsControl"
import { PlaySpeechButton } from "@/components/PlaySpeechButton"

export default function Home() {
  const [abacusValue, setAbacusValue] = useState<number>(0)
  const [currentValue, setCurrentValue] = useState<number | null>(null)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)
  const { settings } = useSettings() // Get settings from the provider

  const handleAnswerChange = (value: number | null) => {
    setCurrentValue(value)
  }

  const handleAbacusChange = (value: number) => {
    setAbacusValue(value)
  }

  const handleCorrectAnswer = (nextQuestion: () => void) => {
    setCurrentValue(null)
    setAbacusValue(0)
    setTimeout(() => {
      nextQuestion()
    }, 1000)
  }

  const handleAbacusSizeChange = () => {
    // Size change handling can be added here if needed in the future
  }

  const handleIncorrectAnswer = () => {
    setCurrentValue(null)
    setAbacusValue(0)
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
               abacusValue={abacusValue}
               handleAnswerChange={handleAnswerChange}
               handleAbacusChange={handleAbacusChange}
               abacusRef={abacusRef}
               handleAbacusSizeChange={handleAbacusSizeChange}
               setCurrentValue={setCurrentValue}
             />
          </QuestionStateProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

interface QuestionContentProps {
  currentValue: number | null
  abacusValue: number
  handleAnswerChange: (value: number | null) => void
  handleAbacusChange: (value: number) => void
  abacusRef: React.RefObject<{ resetAbacus: () => void } | null>
  handleAbacusSizeChange: (size: { width: number; height: number }) => void
  setCurrentValue: (value: number | null) => void
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  currentValue,
  abacusValue,
  handleAnswerChange,
  handleAbacusChange,
  abacusRef,
  handleAbacusSizeChange,
  setCurrentValue,
}) => {
  const { settings, updateSettings } = useSettings(); // Re-get settings within the component that uses it
  const { questionToDisplay, feedback, feedbackType, checkAnswer, questionNumber } = useQuestionState();

  return (
    <div className="w-full max-w-6xl flex flex-col items-center gap-8 relative">
      <FormulaDisplay settings={settings} />
      
      {settings.speechSettings.isEnabled && (
        <div className="flex flex-col items-center gap-2">
          <SpeechSettingsControl
            settings={settings.speechSettings}
            updateSpeechSettings={(updatedSpeechSettings) => {
              updateSettings({
                speechSettings: {
                  ...settings.speechSettings,
                  ...updatedSpeechSettings,
                },
              });
            }}
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
