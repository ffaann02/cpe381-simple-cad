import React, { useState, useRef, MutableRefObject } from "react";
import { Point } from "@/interface/shape";
import CanvasDrawing from "./CanvasDrawing";
import CanvasEvents from "./CanvasEvents";

const ShapeCanvas: React.FC = () => {
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedShape, setSelectedShape] = useState<{
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
    offset: Point;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null) as MutableRefObject<HTMLCanvasElement>;

  return (
    <div className="relative w-full h-full">
      <CanvasDrawing
        canvasRef={canvasRef}
        mousePos={mousePos}
        selectedShape={selectedShape}
      />
      <CanvasEvents
        canvasRef={canvasRef}
        setMousePos={setMousePos}
        isMoving={isMoving}
        setIsMoving={setIsMoving}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        currentProject=""
      />
    </div>
  );
};

export default ShapeCanvas; 