"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { validateSettings, migrateSettings, defaultSettings } from "@/lib/settings-utils";
import { QuestionSettings as FullQuestionSettings } from "@/lib/question-types";

// Create context
interface SettingsContextType {
  settings: FullQuestionSettings; // Use imported type
  setSettings: (settings: FullQuestionSettings) => void; // Use imported type
  saveSettings: (settings: FullQuestionSettings) => void; // Use imported type
  updateSettings: (partialSettings: Partial<FullQuestionSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FullQuestionSettings>(defaultSettings) // Use imported type and ensure defaultSettings from utils is compatible
  const [isInitialized, setIsInitialized] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('questionSettings')
      console.log('SettingsProvider - Loading settings from localStorage:', savedSettings)
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        console.log('SettingsProvider - Parsed settings:', parsedSettings)
        // Use migrateSettings for validation and migration
        const validSettings = migrateSettings(parsedSettings) // migrateSettings now handles the new fields
        setSettings(validSettings)
      } else {
        setSettings(defaultSettings) // defaultSettings now has the new fields
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSettings(defaultSettings) // Fallback to current defaults
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Function to save settings to localStorage
  const saveSettingsToStorage = (newSettings: FullQuestionSettings) => { // Renamed to avoid conflict with prop if any, and use FullQuestionSettings
    try {
      const validSettings = validateSettings(newSettings) // validateSettings now handles new fields
      console.log('SettingsProvider - Saving settings to localStorage:', validSettings)
      localStorage.setItem('questionSettings', JSON.stringify(validSettings))
      setSettings(validSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const updateSettings = (partialSettings: Partial<FullQuestionSettings>) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, ...partialSettings };
      saveSettingsToStorage(newSettings);
      return newSettings;
    });
  };
 
   return (
     <SettingsContext.Provider
       value={{
         settings,
         setSettings, // This directly sets the state, consider if it should also validate/save
         saveSettings: saveSettingsToStorage, // Pass the correctly-scoped save function
         updateSettings
       }}
     >
       {isInitialized ? children : <div>Loading settings...</div>}
     </SettingsContext.Provider>
   )
 }

// Custom hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 