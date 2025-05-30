import { PiFlipHorizontalFill, PiFlipVerticalFill } from "react-icons/pi";

interface FlipShapeModalProps {
  modalPosition: { x: number; y: number };
  flipShape: (direction: "vertical" | "horizontal") => void;
}

const FlipShapeModal = ({ modalPosition, flipShape }: FlipShapeModalProps) => {
  return (
    <div
      className="absolute bg-white border rounded shadow-lg p-2 flex flex-col space-y-2"
      style={{
        left: modalPosition.x,
        top: modalPosition.y,
        zIndex: 50,
      }}
    >
      <button
        className="flex items-center space-x-2"
        onClick={() => flipShape("vertical")}
      >
        <PiFlipVerticalFill className="text-xl text-neutral-600" />
        <span>Flip Vertical</span>
      </button>

      <button
        className="flex items-center space-x-2"
        onClick={() => flipShape("horizontal")}
      >
        <PiFlipHorizontalFill className="text-xl text-neutral-600" />
        <span>Flip Horizontal</span>
      </button>
    </div>
  );
};

export default FlipShapeModal;
