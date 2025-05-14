"use client"

import { useRef, useState } from "react"
import AbacusDisplay from "@/components/abacus-display"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Home() {
  const [currentValue, setCurrentValue] = useState<number>(0)
  const abacusRef = useRef<{ resetAbacus: () => void } | null>(null)

  const handleValueChange = (value: number) => {
    setCurrentValue(value)
  }

  const handleCheckAnswer = (isCorrect: boolean) => {
    if (isCorrect && abacusRef.current) {
      // Clear the abacus when the answer is correct
      setTimeout(() => {
        abacusRef.current?.resetAbacus()
      }, 1000) // Small delay to let the user see the correct answer
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#5d4037] mb-8">Soroban Abacus Practice</h1>

          <div className="w-full max-w-4xl flex flex-col items-center gap-8">
            {/* Main content area with two columns on larger screens */}
            <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Left column - Question display */}
              <div className="md:col-span-2 flex flex-col items-center justify-center">
                <QuestionDisplay currentValue={currentValue} onCheckAnswer={handleCheckAnswer} />
              </div>

              {/* Right column - Abacus */}
              <div className="md:col-span-3 flex flex-col items-center">
                <AbacusDisplay ref={abacusRef} onValueChange={handleValueChange} />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
