"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { validateSettings, migrateSettings, defaultSettings } from "@/lib/settings-utils";

// Define the settings interface
export interface QuestionSettings {
  minNumbers: number;
  maxNumbers: number;
  scenario: number;
  weightingMultiplier: number;
}

// Create context
interface SettingsContextType {
  settings: QuestionSettings;
  setSettings: (settings: QuestionSettings) => void;
  saveSettings: (settings: QuestionSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<QuestionSettings>(defaultSettings)
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
        const validSettings = migrateSettings(parsedSettings)
        setSettings(validSettings)
      } else {
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Function to save settings to localStorage
  const saveSettings = (newSettings: QuestionSettings) => {
    try {
      const validSettings = validateSettings(newSettings)
      console.log('SettingsProvider - Saving settings to localStorage:', validSettings)
      localStorage.setItem('questionSettings', JSON.stringify(validSettings))
      setSettings(validSettings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        setSettings, 
        saveSettings 
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