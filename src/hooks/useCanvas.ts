// hooks/useCanvasEvents.ts
import { useCallback, useState } from "react";
import { Point, ShapeMode } from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { useTab } from "@/context/AppContext";
import { useDrawing } from "./useDrawing";
import { useSelectionAndMovement } from "./useSelectionAndMovement";
import { useEraser } from "./useEraser";
import { useRotation } from "./useRotation";
import { useFlip } from "./useFlip";
import { getBezierBoundingBox } from "@/utils/drawing"; // Import drawBoundingBox and getBezierBoundingBox
import { Line, Circle, Ellipse, Curve, Polygon } from "@/interface/shape"; // Import shape types
import { scaleShape, getScalingOrigin } from "@/utils/transform"; // Import scaling helper functions

interface UseCanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setMousePos: React.Dispatch<React.SetStateAction<Point | null>>;
  isMoving: boolean;
  setIsMoving: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: {
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
    offset: Point;
  } | null;
  setSelectedShape: React.Dispatch<
    React.SetStateAction<{
      layerId: string | null;
      index: number | null;
      type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
      offset: Point;
    } | null>
  >;
  currentProject: string | null;
}

// Helper function to check if a point is on a bounding box handle
const isPointOnHandle = (x: number, y: number, handleX: number, handleY: number, handleSize: number) => {
  const half = handleSize / 2;
  return x >= handleX - half && x <= handleX + half && y >= handleY - half && y <= handleY + half;
};

// Define a type for the scaling handle
interface ScalingHandle extends Point {
  name: string;
}

export const useCanvasEvents = ({
  canvasRef,
  setMousePos,
  isMoving: propIsMoving,
  setIsMoving: setPropIsMoving,
  selectedShape: propSelectedShape,
  setSelectedShape: setPropSelectedShape,
  currentProject,
}: UseCanvasEventsProps) => {
  const { tool, shape, points, setPoints, lines, circles, ellipses, curves, polygons, setLines, setCircles, setEllipses, setCurves, setPolygons, zoomLevel, zoomOffsetX, zoomOffsetY } = useTab();

  const { handleDrawClick } = useDrawing({ points, setPoints, setMousePos });
  const { handleSelectClick, handleMoveClick, handleMoveMouseMove } = useSelectionAndMovement({
    isMoving: propIsMoving,
    setIsMoving: setPropIsMoving,
    selectedShape: propSelectedShape,
    setSelectedShape: setPropSelectedShape,
    setMousePos,
    canvasRef,
    currentProject: currentProject || "",
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
  const { flipModalVisible, setFlipModalVisible, modalPosition, shapeToFlip, flipShape } = useFlip();

  const [isScaling, setIsScaling] = useState(false);
  const [scalingHandle, setScalingHandle] = useState<ScalingHandle | null>(null);
  const [initialMousePos, setInitialMousePos] = useState<Point | null>(null);
  const [initialShapeProps, setInitialShapeProps] = useState<any>(null); // Store initial shape properties for scaling

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
          handleEraserAction(x,y);
          break;
        case Tools.Rotate:
          handleRotateClick(x,y);
          break;
        case Tools.Flip:
           // Flip logic will be handled by the modal triggered by the button in ToolsTab or PropertiesTab
           break;
        case Tools.Scale:
          handleSelectClick(x,y);
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
      handleEraserAction
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !propSelectedShape || tool !== Tools.Scale) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      // Get bounding box of the selected shape
      const selectedShapeObject = (() => {
        switch (propSelectedShape.type) {
          case "line": return lines.find(l => l.layerId === propSelectedShape.layerId && lines.indexOf(l) === propSelectedShape.index);
          case "circle": return circles.find(c => c.layerId === propSelectedShape.layerId && circles.indexOf(c) === propSelectedShape.index);
          case "ellipse": return ellipses.find(el => el.layerId === propSelectedShape.layerId && ellipses.indexOf(el) === propSelectedShape.index);
          case "curve": return curves.find(cu => cu.layerId === propSelectedShape.layerId && curves.indexOf(cu) === propSelectedShape.index);
          case "polygon": return polygons.find(p => p.layerId === propSelectedShape.layerId && polygons.indexOf(p) === propSelectedShape.index);
          default: return undefined;
        }
      })();

      if (!selectedShapeObject) return;

      // Calculate bounding box based on shape type
      let minX, minY, maxX, maxY;
      if (propSelectedShape.type === "line") {
        const line = selectedShapeObject as Line;
        minX = Math.min(line.start.x, line.end.x);
        minY = Math.min(line.start.y, line.end.y);
        maxX = Math.max(line.start.x, line.end.x);
        maxY = Math.max(line.start.y, line.end.y);
      } else if (propSelectedShape.type === "circle") {
        const circle = selectedShapeObject as Circle;
        minX = circle.center.x - circle.radius;
        minY = circle.center.y - circle.radius;
        maxX = circle.center.x + circle.radius;
        maxY = circle.center.y + circle.radius;
      } else if (propSelectedShape.type === "ellipse") {
        const ellipse = selectedShapeObject as Ellipse;
        minX = ellipse.center.x - ellipse.rx;
        minY = ellipse.center.y - ellipse.ry;
        maxX = ellipse.center.x + ellipse.rx;
        maxY = ellipse.center.y + ellipse.ry;
      } else if (propSelectedShape.type === "curve") {
        const curve = selectedShapeObject as Curve;
        const { minX: curveMinX, minY: curveMinY, maxX: curveMaxX, maxY: curveMaxY } =
           getBezierBoundingBox(curve.p0, curve.p1, curve.p2, curve.p3);
        minX = curveMinX; minY = curveMinY; maxX = curveMaxX; maxY = curveMaxY;
      } else if (propSelectedShape.type === "polygon") {
        const polygon = selectedShapeObject as Polygon;
        if (polygon.points.length > 0) {
          minX = polygon.points[0].x;
          minY = polygon.points[0].y;
          maxX = polygon.points[0].x;
          maxY = polygon.points[0].y;
          polygon.points.forEach((p) => {
            minX = Math.min(minX!, p.x);
            minY = Math.min(minY!, p.y);
            maxX = Math.max(maxX!, p.x);
            maxY = Math.max(maxY!, p.y);
          });
        }
      }

      if (minX === undefined || minY === undefined || maxX === undefined || maxY === undefined) return;

       // Apply zoom transformation to bounding box corners for accurate handle detection
      const transformedMinX = minX * zoomLevel + zoomOffsetX;
      const transformedMinY = minY * zoomLevel + zoomOffsetY;
      const transformedMaxX = maxX * zoomLevel + zoomOffsetX;
      const transformedMaxY = maxY * zoomLevel + zoomOffsetY;

      const handleSize = 8;
      const handles: ScalingHandle[] = [
        { x: transformedMinX, y: transformedMinY, name: 'tl' }, // top-left
        { x: transformedMinX + (transformedMaxX - transformedMinX) / 2, y: transformedMinY, name: 'tc' }, // top-center
        { x: transformedMaxX, y: transformedMinY, name: 'tr' }, // top-right
        { x: transformedMinX, y: transformedMinY + (transformedMaxY - transformedMinY) / 2, name: 'ml' }, // middle-left
        { x: transformedMaxX, y: transformedMinY + (transformedMaxY - transformedMinY) / 2, name: 'mr' }, // middle-right
        { x: transformedMinX, y: transformedMaxY, name: 'bl' }, // bottom-left
        { x: transformedMinX + (transformedMaxX - transformedMinX) / 2, y: transformedMaxY, name: 'bc' }, // bottom-center
        { x: transformedMaxX, y: transformedMaxY, name: 'br' }, // bottom-right
      ];

      for (const handle of handles) {
        if (isPointOnHandle(x, y, handle.x, handle.y, handleSize)) {
          setIsScaling(true);
          setScalingHandle(handle);
          setInitialMousePos({ x, y });
          // Store a deep copy of the initial shape properties
          setInitialShapeProps(JSON.parse(JSON.stringify(selectedShapeObject)));
          break;
        }
      }
    },
    [canvasRef, propSelectedShape, tool, lines, circles, ellipses, curves, polygons, zoomLevel, zoomOffsetX, zoomOffsetY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);

      setMousePos({ x, y });

      if (tool === Tools.Move && propIsMoving) {
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
      } else if (tool === Tools.Scale && isScaling && propSelectedShape && initialMousePos && scalingHandle && initialShapeProps) {
        // Implement scaling logic here
        const deltaX = (x - initialMousePos.x) / zoomLevel; // Account for zoom
        const deltaY = (y - initialMousePos.y) / zoomLevel; // Account for zoom

        // Call a helper function to scale the shape
        const updatedShape = scaleShape(
          initialShapeProps,
          propSelectedShape.type!,
          scalingHandle.name,
          { x: deltaX, y: deltaY },
          // Pass shape's origin or fixed point for scaling
          // This will depend on the handle being dragged
          getScalingOrigin(initialShapeProps, propSelectedShape.type!, scalingHandle.name)
        );

         if (updatedShape) {
           // Update the state based on the shape type
           switch (propSelectedShape.type) {
             case "line":
               setLines(lines.map(l => l.layerId === propSelectedShape.layerId && lines.indexOf(l) === propSelectedShape.index ? updatedShape as Line : l));
               break;
             case "circle":
               setCircles(circles.map(c => c.layerId === propSelectedShape.layerId && circles.indexOf(c) === propSelectedShape.index ? updatedShape as Circle : c));
               break;
             case "ellipse":
               setEllipses(ellipses.map(el => el.layerId === propSelectedShape.layerId && ellipses.indexOf(el) === propSelectedShape.index ? updatedShape as Ellipse : el));
               break;
             case "curve":
                setCurves(curves.map(cu => cu.layerId === propSelectedShape.layerId && curves.indexOf(cu) === propSelectedShape.index ? updatedShape as Curve : cu));
                break;
             case "polygon":
                setPolygons(polygons.map(p => p.layerId === propSelectedShape.layerId && polygons.indexOf(p) === propSelectedShape.index ? updatedShape as Polygon : p));
                break;
           }
         }
      }
    },
    [canvasRef, setMousePos, tool, shape, points, isErasing, handleMoveMouseMove, handleEraserAction, isScaling, propSelectedShape, initialMousePos, scalingHandle, initialShapeProps, lines, circles, ellipses, curves, polygons, setLines, setCircles, setEllipses, setCurves, setPolygons, zoomLevel, zoomOffsetX, zoomOffsetY]
  );

  const handleMouseUp = useCallback(
    () => {
      if (tool === Tools.Scale && isScaling) {
        setIsScaling(false);
        setScalingHandle(null);
        setInitialMousePos(null);
        setInitialShapeProps(null);
        // Optionally save the state here after scaling is complete
      }
    },
    [tool, isScaling]
  );

  return {
    handleClick,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
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
    flipShape
  };
};