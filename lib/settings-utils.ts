// Centralized settings validation and normalization utilities
import { QuestionSettings } from "./question-generator";

export const defaultSettings: QuestionSettings = {
  minNumbers: 2,
  maxNumbers: 5,
  scenario: 1,
  weightingMultiplier: 3,
};

export function validateSettings(settings: Partial<QuestionSettings>): QuestionSettings {
  // Apply defaults and clamp values
  return {
    minNumbers: clampNumber(settings.minNumbers, 1, 50, defaultSettings.minNumbers),
    maxNumbers: clampNumber(settings.maxNumbers, settings.minNumbers || 1, 50, defaultSettings.maxNumbers),
    scenario: clampNumber(settings.scenario, 1, 10, defaultSettings.scenario),
    weightingMultiplier: clampNumber(settings.weightingMultiplier, 1, 100, defaultSettings.weightingMultiplier),
  };
}

function clampNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value !== 'number' || isNaN(value)) return fallback;
  return Math.max(min, Math.min(value, max));
}

// Migration logic for settings (if needed in the future)
export function migrateSettings(settings: any): QuestionSettings {
  // Add missing fields with defaults
  const migrated = { ...defaultSettings, ...settings };
  return validateSettings(migrated);
} 