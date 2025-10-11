"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SpeechSettings } from '@/lib/question-types';
import { useSpeechSynthesis } from './SpeechSynthesisProvider';

interface SpeechSettingsControlProps {
  settings: SpeechSettings;
  onSettingsChange: (newSettings: SpeechSettings) => void;
}

const uiToActualRate = (uiRate: number) => {
  return uiRate * 0.008;
};

const actualToUiRate = (actualRate: number) => {
  return Math.round(actualRate / 0.008);
};

export function SpeechSettingsControl({ settings, onSettingsChange }: SpeechSettingsControlProps) {
  const { voices, areVoicesLoading } = useSpeechSynthesis();
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(settings.voiceURI || '');
  const [speechSpeed, setSpeechSpeed] = useState(actualToUiRate(settings.rate || 1));

  useEffect(() => {
    if (voices.length > 0) {
      const currentVoiceIsValid = voices.some(v => v.voiceURI === selectedVoiceURI);
      if (!selectedVoiceURI || !currentVoiceIsValid) {
        const defaultVoice = voices.find(v => v.lang === 'en-US') || voices[0];
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
          onSettingsChange({ ...settings, voiceURI: defaultVoice.voiceURI });
        }
      }
    }
  }, [voices, selectedVoiceURI, settings, onSettingsChange]);

  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    onSettingsChange({ ...settings, voiceURI: voiceURI });
  };

  const handleSpeechSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSpeechSpeed(newSpeed);
    onSettingsChange({ ...settings, rate: uiToActualRate(newSpeed) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listening Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="speech-voice">Voice</label>
          <Select value={selectedVoiceURI} onValueChange={handleVoiceChange} disabled={areVoicesLoading}>
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
          <label htmlFor="speech-speed">Speed ({speechSpeed})</label>
          <Slider
            id="speech-speed"
            min={30}
            max={200}
            step={1}
            value={[speechSpeed]}
            onValueChange={handleSpeechSpeedChange}
            className="[>span:first-child]:h-3 [>span:first-child]:w-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}