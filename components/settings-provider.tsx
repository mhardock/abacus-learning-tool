"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Define the settings interface
export interface QuestionSettings {
  minNumbers: number;
  maxNumbers: number;
  scenario: number;
  weightingMultiplier: number;
}

// Default settings
export const defaultSettings: QuestionSettings = {
  minNumbers: 2,
  maxNumbers: 5,
  scenario: 1,
  weightingMultiplier: 3
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- This effect runs only on mount to initialize settings
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
          parsedSettings !== null &&
          'minNumbers' in parsedSettings &&
          'maxNumbers' in parsedSettings &&
          'scenario' in parsedSettings
        ) {
          // Handle migration for weightingMultiplier
          if (!('weightingMultiplier' in parsedSettings)) {
            parsedSettings.weightingMultiplier = defaultSettings.weightingMultiplier;
          }
          setSettings(parsedSettings)
        } else {
          // If structure is invalid or critical fields missing, consider resetting or logging detailed error
          console.error('Invalid or incomplete settings structure in localStorage:', parsedSettings, 'Reverting to default or existing valid settings.')
          // Optionally, save default settings if current ones are truly corrupt
          // saveSettings(defaultSettings); // Be cautious with this, might overwrite user data unintentionally
          // For now, just log and proceed with current state or defaults if this is initial load
          if (!settings || Object.keys(settings).length === 0 || settings === defaultSettings ) {
             setSettings(defaultSettings); // Fallback to defaults if state is bad
          }
        }
      } else {
        // No settings in localStorage, use defaults
        setSettings(defaultSettings);
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