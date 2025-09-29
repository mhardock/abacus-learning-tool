"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

interface SpeechSynthesisContextType {
  voices: SpeechSynthesisVoice[];
  areVoicesLoading: boolean;
}

const SpeechSynthesisContext = createContext<SpeechSynthesisContextType | undefined>(undefined);

export const SpeechSynthesisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [areVoicesLoading, setAreVoicesLoading] = useState(true);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        setVoices(voiceList);
        setAreVoicesLoading(false);
      }
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const initialVoices = window.speechSynthesis.getVoices();
      if (initialVoices.length > 0) {
        setVoices(initialVoices);
        setAreVoicesLoading(false);
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      }
    } else {
      setAreVoicesLoading(false);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }, []);

  const contextValue = {
    voices,
    areVoicesLoading,
  };

  return (
    <SpeechSynthesisContext.Provider value={contextValue}>
      {children}
    </SpeechSynthesisContext.Provider>
  );
};

export const useSpeechSynthesis = () => {
  const context = useContext(SpeechSynthesisContext);
  if (context === undefined) {
    throw new Error("useSpeechSynthesis must be used within a SpeechSynthesisProvider");
  }
  return context;
};