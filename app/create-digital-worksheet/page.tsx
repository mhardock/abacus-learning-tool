"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { serializeSettingsForUrl } from "@/lib/settings-serializer"
import QuestionSettingsForm from "@/components/question-settings-form"
import { QuestionSettings } from "@/lib/question-types"

export default function CreateDigitalWorksheetPage() {
  const { settings: globalSettings, saveSettings } = useSettings()
  const [numQuestions, setNumQuestions] = useState(10)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [showLinkCard, setShowLinkCard] = useState(false)
  const [settingsSaveMessage, setSettingsSaveMessage] = useState<string | null>(null);

  const handleSaveGlobalSettings = (updatedSettings: QuestionSettings) => {
    try {
      saveSettings(updatedSettings);
      setSettingsSaveMessage("Global question settings updated successfully!");
      setTimeout(() => setSettingsSaveMessage(null), 3000);
    } catch (error) {
      console.error("Error saving global settings:", error);
      setSettingsSaveMessage("Error updating global settings.");
      setTimeout(() => setSettingsSaveMessage(null), 3000);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f5f0e6] p-8">
          <h1 className="text-2xl font-bold mb-8 text-center text-[#5d4037]">
            Create Digital Worksheet
          </h1>

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">

            <div className="w-full md:w-1/2">
              <QuestionSettingsForm
                initialSettings={globalSettings}
                onSave={handleSaveGlobalSettings}
                showActionButtons={true}
                saveMessage={settingsSaveMessage}
              />
            </div>

            <div className="w-full md:w-1/2">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Worksheet Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="num-questions" className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      id="num-questions"
                      placeholder="e.g., 10"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      min={1}
                      className="w-full"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      const updatedSettings = { ...globalSettings, seed: Date.now().toString() }
                      const encodedSettings = serializeSettingsForUrl(updatedSettings)
                      const link = `${window.location.origin}/digital-worksheet?settings=${encodedSettings}&count=${numQuestions}`
                      setGeneratedLink(link)
                      setShowLinkCard(true)
                    }}
                  >
                    Generate Digital Worksheet
                  </Button>
                </CardContent>
              </Card>

              {showLinkCard && generatedLink && (
                <Card className="w-full mt-8">
                  <CardHeader>
                    <CardTitle>Digital Worksheet Link</CardTitle>
                    <CardDescription>Your digital worksheet has been generated.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input type="text" value={generatedLink} readOnly className="w-full" />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink)
                          alert("Link copied to clipboard!")
                        }}
                        className="flex-1"
                      >
                        Copy Link
                      </Button>
                      <Button
                        onClick={() => window.open(generatedLink, "_blank")}
                        className="flex-1"
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}