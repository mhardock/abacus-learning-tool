"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useSettings } from "@/components/settings-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { compressSettings } from "@/lib/compression-utils"
import { SettingsDisplayCard } from "@/components/render-settings"

export default function CreateDigitalWorksheetPage() {
  const { settings } = useSettings()
  const [numQuestions, setNumQuestions] = useState(10)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [showLinkCard, setShowLinkCard] = useState(false)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f5f0e6] p-8">
          <h1 className="text-2xl font-bold mb-8 text-center text-[#5d4037]">
            Create Digital Worksheet
          </h1>

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">

            <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <CardHeader>
                <CardTitle className="text-lg">Current Question Settings</CardTitle>
                <CardDescription>
                  These are the active question generation settings that will be used for the digital worksheet.
                </CardDescription>
              </CardHeader>
              <SettingsDisplayCard settings={settings} />
            </Card>

            <div className="w-full md:w-2/3 lg:w-3/4">
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
                      const updatedSettings = { ...settings, seed: Date.now().toString() }
                      const encodedSettings = compressSettings(updatedSettings)
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