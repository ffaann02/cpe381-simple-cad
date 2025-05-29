// hooks/useEraser.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { Point, Polygon } from "@/interface/shape";
import { useTab } from "@/context/AppContext";
import { findShapeAtPoint } from "@/utils/selection";

export interface ErasingShape {
  layerId: string;
  index: number;
  type: string;
  position: Point;
}

interface UseEraserProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setMousePos: React.Dispatch<React.SetStateAction<Point | null>>;
}

export const useEraser = ({ canvasRef, setMousePos }: UseEraserProps) => {
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [erasingShape, setErasingShape] = useState<ErasingShape | null>(null);
  const [erasingModalVisible, setErasingModalVisible] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { lines, setLines, circles, setCircles, ellipses, setEllipses, curves, setCurves, polygons, setPolygons, layers, setLayers, setSelectedLayerId, setLog } = useTab();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setErasingModalVisible(false);
        setErasingShape(null);
      }
    };

    if (erasingModalVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [erasingModalVisible]);

  const handleEraserAction = useCallback(
    (x: number, y: number) => {
      const foundShape = findShapeAtPoint(x, y, lines, circles, ellipses, curves, polygons, layers);

      if (foundShape.layerId) {
        if (!erasingShape || erasingShape.layerId !== foundShape.layerId) {
          let shapePosition: Point = { x: x, y: y };
          switch (foundShape.type) {
            case "line":
              shapePosition = lines[foundShape.index!]?.start || { x: x, y: y };
              break;
            case "circle":
              shapePosition = circles[foundShape.index!]?.center || { x: x, y: y };
              break;
            case "ellipse":
              shapePosition = ellipses[foundShape.index!]?.center || { x: x, y: y };
              break;
            case "curve":
              shapePosition = curves[foundShape.index!]?.p0 || { x: x, y: y };
              break;
            case "polygon":
              shapePosition = polygons[foundShape.index!]?.points[0] || { x: x, y: y };
              break;
          }

          if (foundShape.layerId && foundShape.index !== null && foundShape.type) {
            setErasingShape({
              layerId: foundShape.layerId,
              index: foundShape.index,
              type: foundShape.type,
              position: shapePosition,
            });
            setErasingModalVisible(true);
          }
        }
      } else {
        setErasingModalVisible(false);
        setErasingShape(null);
      }
    },
    [erasingShape, lines, circles, ellipses, curves, polygons, layers]
  );

  const deleteShape = useCallback(
    (shapeToDelete: ErasingShape) => {
      switch (shapeToDelete.type) {
        case "line":
          setLines((prevLines) => prevLines.filter((_, index) => index !== shapeToDelete.index));
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Line ${shapeToDelete.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "circle":
          setCircles((prevCircles) => prevCircles.filter((_, index) => index !== shapeToDelete.index));
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Circle ${shapeToDelete.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "ellipse":
          setEllipses((prevEllipses) => prevEllipses.filter((_, index) => index !== shapeToDelete.index));
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Ellipse ${shapeToDelete.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "curve":
          setCurves((prevCurves) => prevCurves.filter((_, index) => index !== shapeToDelete.index));
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Curve ${shapeToDelete.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "polygon":
          setPolygons((prevPolygons) => prevPolygons.filter((_, index) => index !== shapeToDelete.index));
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Polygon ${shapeToDelete.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
      }
      setLayers(layers.filter((layer) => layer.id !== shapeToDelete.layerId));
      setSelectedLayerId(null);
      setErasingModalVisible(false);
      setErasingShape(null);
    },
    [layers, setLines, setCircles, setEllipses, setCurves, setPolygons, setLayers, setSelectedLayerId, setLog]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsErasing(true);
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      handleEraserAction(x, y);
    };

    const handleMouseUp = () => {
      setIsErasing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isErasing) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        handleEraserAction(x, y);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
      handleEraserAction(x, y);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, [canvasRef, isErasing, handleEraserAction]);

  return {
    isErasing,
    erasingShape,
    erasingModalVisible,
    setErasingModalVisible,
    deleteShape,
    popoverRef,
    handleEraserAction
  };
};