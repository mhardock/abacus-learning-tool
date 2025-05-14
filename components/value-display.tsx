"use client"

interface ValueDisplayProps {
  value: number
}

export default function ValueDisplay({ value }: ValueDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-xs text-center mb-4">
      <h3 className="text-sm font-medium text-gray-600 mb-1">Current Value</h3>
      <div className="text-3xl font-mono font-bold text-[#5d4037]">{value}</div>
    </div>
  )
}
