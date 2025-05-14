"use client"

export default function ControlButtons() {
  const handleSubmit = () => {
    // In a real implementation, this would compare the abacus value with the expected answer
    console.log("Answer submitted")
  }

  const handleClear = () => {
    // In a real implementation, this would reset the abacus to zero
    console.log("Abacus cleared")
  }

  return (
    <div className="flex gap-4 mt-2">
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-[#8d6e63] hover:bg-[#6d4c41] text-white font-medium rounded-lg shadow-md transition-colors"
      >
        Submit Answer
      </button>

      <button
        onClick={handleClear}
        className="px-6 py-3 bg-white hover:bg-gray-100 text-[#5d4037] font-medium rounded-lg shadow-md border border-[#8d6e63] transition-colors"
      >
        Clear
      </button>
    </div>
  )
}
