import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const populateVoiceList = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        setLoading(false);
        clearInterval(intervalId); // Clear polling if voices are found
        window.speechSynthesis.onvoiceschanged = null; // Clear event handler
      }
    };

    // Event-driven approach
    window.speechSynthesis.onvoiceschanged = populateVoiceList;

    // Polling fallback for browsers where onvoiceschanged might not fire reliably
    intervalId = setInterval(populateVoiceList, 100);

    // Initial check in case voices are already loaded
    populateVoiceList();

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return { voices, loading };
};