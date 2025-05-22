"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSettings } from "@/components/settings-provider";
import WorksheetGenerator from "@/components/worksheet-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuestionSettingsForm from "@/components/question-settings-form";
import { QuestionSettings } from "@/lib/question-types";

export default function WorksheetGeneratorPage() {
  const { settings: globalSettings, saveSettings } = useSettings();
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
            Create Worksheets
          </h1>

          {/* Flex container for side-by-side layout on medium screens and up */}
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">

            {/* Current Settings Display Box - Left Column */}
            <div className="w-full md:w-1/2">
              <QuestionSettingsForm
                initialSettings={globalSettings}
                onSave={handleSaveGlobalSettings}
                showActionButtons={true}
                saveMessage={settingsSaveMessage}
              />
            </div>

            <div className="w-full md:w-w-1/2">
              <Card>
                <CardHeader>
                  <CardTitle>Worksheet Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorksheetGenerator settings={globalSettings} />
                </CardContent>
              </Card>
            </div>
          </div>

          
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}