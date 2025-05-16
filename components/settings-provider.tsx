"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define the settings interface
export interface QuestionSettings {
  minNumbers: number;
  maxNumbers: number;
  scenario: number;
}

// Default settings
export const defaultSettings: QuestionSettings = {
  minNumbers: 2,
  maxNumbers: 5,
  scenario: 1
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
        
        // Validate parsed settings
        if (
          typeof parsedSettings === 'object' &&
          'minNumbers' in parsedSettings &&
          'maxNumbers' in parsedSettings
        ) {
          // Handle migration from old settings format
          if (!('scenario' in parsedSettings)) {
            parsedSettings.scenario = 1;
          }
          setSettings(parsedSettings)
        } else {
          console.error('Invalid settings structure:', parsedSettings)
        }
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
      console.log('SettingsProvider - Saving settings to localStorage:', newSettings)
      localStorage.setItem('questionSettings', JSON.stringify(newSettings))
      setSettings(newSettings)
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