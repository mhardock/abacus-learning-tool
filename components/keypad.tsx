"use client"

import type React from "react"
import Image from "next/image"

interface KeypadProps {
  value: number;
  onValueChange: (value: number) => void;
}

const keypadLayout = [
  // Row 1
  { number: 1, x: 55, y: 10, width: 110, height: 100 },
  { number: 2, x: 175, y: 10, width: 110, height: 100 },
  { number: 3, x: 295, y: 10, width: 110, height: 100 },
  // Row 2
  { number: 4, x: 55, y: 120, width: 110, height: 100 },
  { number: 5, x: 175, y: 120, width: 110, height: 100 },
  { number: 6, x: 295, y: 120, width: 110, height: 100 },
  // Row 3
  { number: 7, x: 55, y: 230, width: 110, height: 100 },
  { number: 8, x: 175, y: 230, width: 110, height: 100 },
  { number: 9, x: 295, y: 230, width: 110, height: 100 },
  // Row 4
  { number: 0, x: 175, y: 340, width: 110, height: 100 },
];

const Keypad: React.FC<KeypadProps> = ({ value, onValueChange }) => {
  const handleKeypadClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const key of keypadLayout) {
      if (x >= key.x && x <= key.x + key.width && y >= key.y && y <= key.y + key.height) {
        const clickedNumber = key.number;
        const currentValue = value === 0 ? '' : String(value);
        const newValue = currentValue + clickedNumber;
        onValueChange(Number(newValue));
        break;
      }
    }
  };

  return (
    <div className="relative" style={{ width: '460px', height: '450px' }}>
      <Image
        src="/keypad-white-bg.jpg"
        alt="Keypad"
        layout="fill"
        objectFit="contain"
        onClick={handleKeypadClick}
        className="cursor-pointer"
      />
    </div>
  );
};

export default Keypad;