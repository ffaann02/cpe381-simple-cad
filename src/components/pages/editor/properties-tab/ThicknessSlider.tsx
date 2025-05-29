import React from 'react';
import { useTab } from '@/context/AppContext';

interface ThicknessSliderProps {
  layerId: string;
}

const ThicknessSlider: React.FC<ThicknessSliderProps> = ({ layerId }) => {
  const { layers, updateLayer } = useTab();

  const layer = layers.find(l => l.id === layerId);
  const thickness = layer?.thickness || 1;

  const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newThickness = parseInt(e.target.value);
    if (layer) {
      updateLayer(layerId, { thickness: newThickness });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Thickness</label>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="10"
          value={thickness}
          onChange={handleThicknessChange}
          onInput={handleThicknessChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600 w-8">{thickness}</span>
      </div>
    </div>
  );
};

export default ThicknessSlider; 