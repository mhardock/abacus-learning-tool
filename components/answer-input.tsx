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
        value={value === null ? "" : value}
        onChange={(e) => {
          const rawValue = e.target.value
          if (rawValue === "") {
            onValueChange(null)
          } else {
            const numValue = parseInt(rawValue, 10)
            if (!isNaN(numValue)) {
              onValueChange(numValue)
            }
          }
        }}
        className="text-center text-2xl h-12 w-32 bg-white"
      />
      <div className="flex space-x-2">
        <Button onClick={handleClear}>Clear</Button>
        <Button
          onClick={onCheckAnswer}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Check Answer
        </Button>
      </div>
    </div>
  )
}