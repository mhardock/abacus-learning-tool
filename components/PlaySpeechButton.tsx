"use client";

import { Button } from "@/components/ui/button";
import { useQuestionState } from "@/components/QuestionStateProvider";

export const PlaySpeechButton: React.FC = () => {
  const { repeatQuestionAudio, speechSettings } = useQuestionState();

  if (!speechSettings.isEnabled) {
    return null;
  }

  return (
    <Button
      className="bg-white shadow rounded-md px-4 py-2 text-black"
      onClick={repeatQuestionAudio}
      aria-label="Play question aloud"
    >
      Play
    </Button>
  );
};