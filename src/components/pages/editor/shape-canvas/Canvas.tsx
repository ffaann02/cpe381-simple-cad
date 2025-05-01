// components/Canvas/Canvas.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTab } from "@/context/AppContext";
import CanvasDrawing from "./CanvasDrawing";
import CanvasEvents from "./CanvasEvents";
import { Point } from "@/interface/shape";

interface CanvasProps {}

const Canvas = forwardRef<{ redraw: () => void }, CanvasProps>((props, ref) => {
  const { canvasSize, canvasRef, importTimestamp } = useTab();
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<{
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | null;
    offset: Point;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (canvas) {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || 800;
      canvas.height = parent?.clientHeight || 600;
    }
  }, []);

  const redraw = () => {
    // Trigger the re-render of CanvasDrawing by updating a state, even a dummy one if needed.
    // For simplicity, we can rely on the states that CanvasDrawing already depends on.
    // If needed, you could introduce a `redrawTrigger` state here.
  };

  useImperativeHandle(ref, () => ({
    redraw,
  }));

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border border-neutral-200 bg-white w-full h-full"
      />
      <CanvasEvents
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        setMousePos={setMousePos}
        isMoving={isMoving}
        setIsMoving={setIsMoving}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
      />
      <CanvasDrawing
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        mousePos={mousePos}
        importTimestamp={importTimestamp}
      />
    </div>
  );
});

export default Canvas;
