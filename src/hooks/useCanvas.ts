// hooks/useCanvasEvents.ts
import { useCallback } from "react";
import { Point, ShapeMode } from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { useTab } from "@/context/AppContext";
import { useDrawing } from "./useDrawing";
import { useSelectionAndMovement } from "./useSelectionAndMovement";
import { useEraser } from "./useEraser";
import { useRotation } from "./useRotation";
import { useFlip } from "./useFlip";

interface UseCanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setMousePos: React.Dispatch<React.SetStateAction<Point | null>>;
  isMoving: boolean;
  setIsMoving: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: {
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | null;
    offset: Point;
  } | null;
  setSelectedShape: React.Dispatch<
    React.SetStateAction<{
      layerId: string | null;
      index: number | null;
      type: "line" | "circle" | "ellipse" | "curve" | null;
      offset: Point;
    } | null>
  >;
}

export const useCanvasEvents = ({
  canvasRef,
  setMousePos,
  isMoving,
  setIsMoving,
  selectedShape,
  setSelectedShape,
}: UseCanvasEventsProps) => {
  const { tool, shape, points, setPoints, setTool } = useTab();

  const { handleDrawClick, willingToDrawPolygon, setWillingToDrawPolygon } = useDrawing({ points, setPoints, setMousePos });
  const { handleSelectClick, handleMoveClick, handleMoveMouseMove, highlightShape, cancelHighlightShape } = useSelectionAndMovement({
    isMoving,
    setIsMoving,
    selectedShape,
    setSelectedShape,
    setMousePos,
    canvasRef,
  });
  const { isErasing, erasingShape, erasingModalVisible, setErasingModalVisible, deleteShape, popoverRef, handleEraserAction } = useEraser({
    canvasRef,
    setMousePos,
  });
  const {
    rotatePopoverOpen,
    setRotatePopoverOpen,
    rotationAngle,
    setRotationAngle,
    rotatingShape,
    setRotatingShape,
    handleRotateClick,
    handleRotateShape,
    rotatePopoverRef,
  } = useRotation({ canvasRef });
  const { flipModalVisible, setFlipModalVisible, modalPosition, shapeToFlip, handleFlipClick, flipShape } = useFlip();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      switch (tool) {
        case Tools.Select:
          handleSelectClick(x, y);
          break;
        case Tools.Move:
          handleMoveClick(x, y);
          break;
        case Tools.Draw:
          handleDrawClick(x, y, shape);
          break;
        case Tools.Eraser:
          // The eraser's click logic is largely handled by the mousedown/mouseup listeners in useEraser.
          // This ensures the modal appears on click, and continuous erasing (if implemented) on drag.
          // We can still call handleEraserAction for a single click scenario.
          handleEraserAction(x,y);
          break;
        default:
          break;
      }
    },
    [
      tool,
      shape,
      canvasRef,
      handleDrawClick,
      handleSelectClick,
      handleMoveClick,
      handleRotateClick,
      handleFlipClick,
      handleEraserAction
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      setMousePos({ x, y });

      if (tool === Tools.Move) {
        handleMoveMouseMove(x, y);
      } else if (tool === Tools.Eraser && isErasing) {
        handleEraserAction(x, y);
      } else if (tool === Tools.Draw) {
        if (
          (shape === ShapeMode.Line && points.length !== 1) ||
          (shape === ShapeMode.Circle && points.length !== 1) ||
          (shape === ShapeMode.Curve && points.length !== 3) ||
          (shape === ShapeMode.Ellipse && points.length !== 1) ||
          (shape === ShapeMode.Polygon && points.length !== 1) // For polygon, mouse move helps determine radius
        ) {
          // Do nothing if not enough points to show a preview
        } else if (shape === ShapeMode.Line && points.length === 1 && e.shiftKey) {
          const startPoint = points[0];
          const dx = x - startPoint.x;
          const dy = y - startPoint.y;
          const angle = Math.atan2(dy, dx);
          const distance = Math.sqrt(dx * dx + dy * dy);

          const angleInDegrees = angle * (180 / Math.PI);
          const snappedDegrees = Math.round(angleInDegrees / 5) * 5;
          const snapAngle = snappedDegrees * (Math.PI / 180);

          const snappedX = startPoint.x + Math.cos(snapAngle) * distance;
          const snappedY = startPoint.y + Math.sin(snapAngle) * distance;

          setMousePos({
            x: Math.round(snappedX),
            y: Math.round(snappedY),
          });
        } else {
          setMousePos({ x, y });
        }
      }
    },
    [canvasRef, setMousePos, tool, shape, points, isErasing, handleMoveMouseMove, handleEraserAction]
  );

  return {
    handleClick,
    handleMouseMove,
    erasingShape,
    erasingModalVisible,
    setErasingModalVisible,
    deleteShape,
    popoverRef,
    rotatePopoverOpen,
    setRotatePopoverOpen,
    rotationAngle,
    setRotationAngle,
    rotatingShape,
    setRotatingShape,
    handleRotateShape,
    rotatePopoverRef,
    flipModalVisible,
    setFlipModalVisible,
    modalPosition,
    shapeToFlip,
    flipShape,
    willingToDrawPolygon,
    setWillingToDrawPolygon,
  };
};