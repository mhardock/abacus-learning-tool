import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AnswerInputProps {
  value: number | null
  onValueChange: (value: number | null) => void
  onCheckAnswer: () => void
  isImageMode: boolean
  onClearAbacus?: () => void
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  value,
  onValueChange,
  onCheckAnswer,
  isImageMode,
  onClearAbacus,
}) => {
  const handleClear = () => {
    onValueChange(null)
    onClearAbacus?.()
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <Input
        readOnly
        value={value === null ? "" : value}
        className="text-center text-2xl h-12 w-32 bg-white"
      />
      <div className="flex space-x-2">
        <Button
          onClick={handleClear}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Clear
        </Button>
        <Button onClick={onCheckAnswer}>Check Answer</Button>
      </div>
    </div>
  )
}