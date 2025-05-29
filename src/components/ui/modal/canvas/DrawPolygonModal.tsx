interface DrawPolygonModalProps {
  points: { x: number; y: number }[];
  polygonCornerNumber: number;
  setPolygonCornerNumber: (number: number) => void;
  setWillingToDrawPolygon: (willing: boolean) => void;
  onConfirm: () => void;
}

const DrawPolygonModal = ({
  points,
  polygonCornerNumber,
  setPolygonCornerNumber,
  setWillingToDrawPolygon,
  onConfirm,
}: DrawPolygonModalProps) => {
  return (
    <div
      className="absolute bg-white border rounded shadow-lg p-4 flex flex-col space-y-4"
      style={{
        left: points[0].x + 50,
        top: points[0].y - 50,
        zIndex: 50,
      }}
    >
      <p className="text-sm text-gray-700">Select number of corners:</p>
      <input
        type="range"
        min="3"
        max="16"
        value={polygonCornerNumber}
        onChange={(e) => setPolygonCornerNumber(Number(e.target.value))}
        className="w-full"
      />
      <div className="text-center text-sm text-gray-700">
        {polygonCornerNumber} corners
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
        onClick={onConfirm}
      >
        Confirm
      </button>
    </div>
  );
};

export default DrawPolygonModal;
