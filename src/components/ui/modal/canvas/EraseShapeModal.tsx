import React from "react";

interface EreaseShapeModalProps {
  erasingShape: { position: { x: number; y: number } };
  setErasingShape: (shape: null) => void;
  deleteShape: (shape: any) => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  setErasingModalVisible: (visible: boolean) => void;
}

const EraseShapeModal = ({
  erasingShape,
  setErasingShape,
  deleteShape,
  popoverRef,
    setErasingModalVisible,
}: EreaseShapeModalProps) => {
  return (
    <div
      ref={popoverRef}
      className="w-auto bg-white border rounded-md shadow-lg p-4 absolute z-[50]" // Tailwind classes
      style={{
        left: erasingShape.position.x,
        top: erasingShape.position.y,
        transform: "translate(-50%, -50%)", // Center the popover
      }}
    >
      <div className="text-center">
        <p className="text-sm text-gray-700 mb-2">
          Are you sure you want to delete this shape?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
            onClick={() => {
              deleteShape(erasingShape);
              setErasingModalVisible(false);
              setErasingShape(null);
            }}
          >
            Yes
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-sm"
            onClick={() => {
              setErasingModalVisible(false);
              setErasingShape(null);
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default EraseShapeModal;
