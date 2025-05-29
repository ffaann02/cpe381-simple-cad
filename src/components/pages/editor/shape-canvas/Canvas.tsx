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
import { Line, Circle, Ellipse, Curve } from "@/interface/shape";
import { Tools } from "@/interface/tool";

interface CanvasProps {}

const Canvas = forwardRef<{ redraw: () => void }, CanvasProps>((props, ref) => {
  const {
    canvasSize,
    canvasRef,
    importTimestamp,
    tool,
    zoomLevel,
    setZoomLevel,
  } = useTab();
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<{
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
    offset: Point;
  } | null>(null);

  // Track previous isMoving state to detect movement completion
  const prevIsMovingRef = useRef(isMoving);
  const [movementComplete, setMovementComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (canvas) {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || 800;
      canvas.height = parent?.clientHeight || 600;
    }
  }, []);

  // Add wheel event for zoom
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      console.log("test");
      if (tool === Tools.Zoom && e.shiftKey) {
        console.log("hello");
        e.preventDefault();
        const newZoom = Math.max(
          0.1,
          Math.min(10, zoomLevel + (e.deltaY < 0 ? 0.1 : -0.1))
        );
        setZoomLevel(newZoom);
      }
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [tool, setZoomLevel, canvasRef]);

  useEffect(() => {
    // If we were moving and now we're not, movement is complete
    if (prevIsMovingRef.current && !isMoving) {
      setMovementComplete(true);
    }
    prevIsMovingRef.current = isMoving;
  }, [isMoving]);

  // Reset movement complete flag after handling it
  useEffect(() => {
    if (movementComplete) {
      setMovementComplete(false);
    }
  }, [movementComplete]);

  const redraw = () => {
    // Trigger the re-render of CanvasDrawing by updating a state, even a dummy one if needed.
    // For simplicity, we can rely on the states that CanvasDrawing already depends on.
    // If needed, you could introduce a `redrawTrigger` state here.
  };

  useImperativeHandle(ref, () => ({
    redraw,
  }));

  return (
    <div
      className={`relative w-full h-full ${
        tool === Tools.Eraser && "cursor-eraser"
      }`}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`border border-neutral-200 bg-white w-full h-full`}
      />
      <CanvasEvents
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        setMousePos={setMousePos}
        isMoving={isMoving}
        setIsMoving={setIsMoving}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        currentProject=""
      />
      <CanvasDrawing
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        mousePos={mousePos}
        importTimestamp={importTimestamp}
        selectedShape={selectedShape}
        onMovementComplete={movementComplete ? () => setMovementComplete(false) : undefined}
      />
    </div>
  );
});

export default Canvas;
