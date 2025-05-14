"use client"

import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function QuestionSettings() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f5f0e6] p-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-[#5d4037] mb-8">Question Settings</h1>
          
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
            <p className="text-[#5d4037] mb-6">
              Configure what type of questions appear in the practice sessions.
            </p>
            
            {/* Content will be added here */}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
} 