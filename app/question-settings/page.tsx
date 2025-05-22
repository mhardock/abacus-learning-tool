"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import QuestionDisplay from "@/components/question-display"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import { QuestionSettings as FullQuestionSettings } from "@/lib/question-types"
import { QuestionStateProvider, useQuestionState } from "@/components/QuestionStateProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionSettingsForm from "@/components/question-settings-form"


export default function QuestionSettingsPage() {
  const router = useRouter()
  const { settings: globalSettings, saveSettings } = useSettings()
  
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [settingsForPreview, setSettingsForPreview] = useState<FullQuestionSettings>(globalSettings);

  useEffect(() => {
    setSettingsForPreview(globalSettings);
  }, [globalSettings]);

  const handleSaveSettings = (updatedSettings: FullQuestionSettings) => {
    try {
      saveSettings(updatedSettings);
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error saving settings. Please try again.");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f5f0e6] p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#5d4037]">Question Settings</h1>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <QuestionSettingsForm
              initialSettings={globalSettings}
              onSave={handleSaveSettings}
              onCancel={handleCancel}
              onSettingsChange={setSettingsForPreview}
              showActionButtons={true}
              saveMessage={saveMessage}
            />
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Question Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <QuestionStateProvider initialSettings={settingsForPreview}>
                  <QuestionPreviewContent />
                </QuestionStateProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const QuestionPreviewContent: React.FC = () => {
  const { questionToDisplay, feedback, feedbackType, refreshQuestion } = useQuestionState();

  return (
    <>
      <QuestionDisplay
        question={questionToDisplay}
        feedback={feedback}
        feedbackType={feedbackType}
      />
      <Button onClick={refreshQuestion}>
        Generate New Preview
      </Button>
    </>
  );
};