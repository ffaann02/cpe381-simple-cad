import React from "react";

interface RotateModalProps {
  rotatePopoverRef: React.RefObject<HTMLDivElement | null>;
  rotatingShape: any;
  rotationAngle: number | string;
  setRotationAngle: (angle: number | string) => void;
  handleRotateShape: () => void;
  setRotatePopoverOpen: (open: boolean) => void;
  setRotatingShape: (shape: any) => void;
}

const RotateModal = ({
  rotatePopoverRef,
  rotatingShape,
  rotationAngle,
  setRotationAngle,
  handleRotateShape,
  setRotatePopoverOpen,
  setRotatingShape,
}: RotateModalProps) => {
  return (
    <div
      ref={rotatePopoverRef}
      className="w-auto bg-white border rounded-md shadow-lg p-4 absolute z-[50]"
      style={{
        left: rotatingShape.center.x, // Position near the shape's center
        top: rotatingShape.center.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="text-center">
        <p className="text-sm text-gray-700 mb-2">
          Enter rotation angle (degrees):
        </p>
        <input
          type="number"
          value={rotationAngle}
          onChange={(e) => setRotationAngle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
          placeholder="Angle"
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            onClick={handleRotateShape}
          >
            Confirm
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-sm"
            onClick={() => {
              setRotatePopoverOpen(false);
              setRotatingShape(null);
              setRotationAngle("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RotateModal;
