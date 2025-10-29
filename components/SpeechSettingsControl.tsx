"use client";

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SpeechSettings } from '@/lib/question-types';
import { useSpeechSynthesis } from './SpeechSynthesisProvider';

interface SpeechSettingsControlProps {
  settings: SpeechSettings;
  updateSpeechSettings: (settings: Partial<SpeechSettings>) => void;
}

const uiToActualRate = (uiRate: number) => {
  return uiRate * 0.008;
};

const actualToUiRate = (actualRate: number) => {
  return Math.round(actualRate / 0.008);
};

export function SpeechSettingsControl({ settings, updateSpeechSettings }: SpeechSettingsControlProps) {
  const { voices, areVoicesLoading } = useSpeechSynthesis();

  useEffect(() => {
    if (voices.length > 0) {
      const currentVoiceIsValid = voices.some(v => v.voiceURI === settings.voiceURI);
      if (!settings.voiceURI || !currentVoiceIsValid) {
        const defaultVoice = voices.find(v => v.lang === 'en-US') || voices[0];
        if (defaultVoice) {
          updateSpeechSettings({ voiceURI: defaultVoice.voiceURI });
        }
      }
    }
  }, [voices, settings.voiceURI, updateSpeechSettings]);

  const handleVoiceChange = (voiceURI: string) => {
    updateSpeechSettings({ voiceURI });
  };

  const handleSpeechSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    updateSpeechSettings({ rate: uiToActualRate(newSpeed) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listening Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="speech-voice">Voice</label>
          <Select value={settings.voiceURI || ''} onValueChange={handleVoiceChange} disabled={areVoicesLoading}>
            <SelectTrigger id="speech-voice">
              <SelectValue placeholder={areVoicesLoading ? "Loading voices..." : "Select a voice"} />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="speech-speed">Speed ({actualToUiRate(settings.rate || 1)})</label>
          <Slider
            id="speech-speed"
            min={30}
            max={200}
            step={10}
            value={[actualToUiRate(settings.rate || 1)]}
            onValueChange={handleSpeechSpeedChange}
            className="[>span:first-child]:h-3 [>span:first-child]:w-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}