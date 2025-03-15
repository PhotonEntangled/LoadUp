"use client";

import { HexColorInput, HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  value?: string;
  onPickerChange: (color: string) => void;
}

const ColorPicker = ({ value, onPickerChange }: ColorPickerProps) => {
  return (
    <div className="relative">
      <div className="flex flex-row items-center">
        <p>#</p>
        <HexColorInput
          color={value}
          onChange={onPickerChange}
          className="w-full border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
        />
      </div>
      <div className="mt-2">
        <HexColorPicker color={value} onChange={onPickerChange} />
      </div>
    </div>
  );
};

export default ColorPicker; 