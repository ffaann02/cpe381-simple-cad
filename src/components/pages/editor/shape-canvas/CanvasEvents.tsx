import React, { useRef } from "react";
import { useTab } from "@/context/AppContext";
import { Point, ShapeMode } from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { v4 as uuidv4 } from "uuid";
import { findShapeAtPoint } from "@/utils/selection"; // Adjust import path

interface CanvasEventsProps {
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

const drawColor = "#D4C9BE"; // Default color for drawing

const CanvasEvents: React.FC<CanvasEventsProps> = ({
  canvasRef,
  setMousePos,
  isMoving,
  setIsMoving,
  selectedShape,
  setSelectedShape,
}) => {
  const {
    points,
    setPoints,
    lines,
    setLines,
    circles,
    setCircles,
    curves,
    setCurves,
    ellipses,
    setEllipses,
    tool,
    shape,
    layers,
    setLayers,
    setSelectedLayerId,
  } = useTab();

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    // If tool is "select", try to select a shape
    if (tool === Tools.Select) {
      const selectedShapeInfo = findShapeAtPoint(
        x,
        y,
        lines,
        circles,
        ellipses,
        curves,
        layers
      );
      if (selectedShapeInfo.layerId) {
        // Update the layers to mark the selected one
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: layer.id === selectedShapeInfo.layerId,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(selectedShapeInfo.layerId);
        return;
      }
      // If no shape was selected, deselect all
      const updatedLayers = layers.map((layer) => ({
        ...layer,
        is_selected: false,
      }));
      setLayers(updatedLayers);
      setSelectedLayerId(null);
      return;
    }

    // If tool is "move"
    if (tool === Tools.Move) {
      const clickedShape = findShapeAtPoint(
        x,
        y,
        lines,
        circles,
        ellipses,
        curves,
        layers
      );
      if (clickedShape.layerId) {
        if (clickedShape.layerId && isMoving) {
          setSelectedShape(null);
          const updatedLayers = layers.map((layer) => ({
            ...layer,
            is_selected: false,
          }));
          setLayers(updatedLayers);
          setSelectedLayerId(null);
          setIsMoving(false); // Stop moving state
          return;
        }
        setIsMoving(true);
        let shapePosition: Point = { x: 0, y: 0 };
        switch (clickedShape.type) {
          case "line":
            shapePosition = lines[clickedShape.index!].start;
            break;
          case "circle":
            shapePosition = circles[clickedShape.index!].center;
            break;
          case "ellipse":
            shapePosition = ellipses[clickedShape.index!].center;
            break;
          case "curve":
            shapePosition = curves[clickedShape.index!].p0;
            break;
        }

        // Highlight the selected shape
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: layer.id === clickedShape.layerId,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(clickedShape.layerId);

        setSelectedShape({
          ...clickedShape,
          offset: {
            x: x - shapePosition.x,
            y: y - shapePosition.y,
          },
        });
        return;
      } else {
        // Clicked empty space, clear selection
        setSelectedShape(null);
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: false,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(null);
        return;
      }
    }

    if (tool === Tools.Rotate) {
      // Handle rotation logic here
      const clickedShape = findShapeAtPoint(
        x,
        y,
        lines,
        circles,
        ellipses,
        curves,
        layers
      );
      if (clickedShape.layerId) {
        // Implement rotation logic for the selected shape
        // This is a placeholder; actual rotation logic will depend on your requirements
        console.log("Rotating shape:", clickedShape);
        // Highlight the selected shape
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: layer.id === clickedShape.layerId,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(clickedShape.layerId);

        setSelectedShape({
          ...clickedShape,
          offset: {
            x: x - shapePosition.x,
            y: y - shapePosition.y,
          },
        });
        return;
      }
      return;
    }

    if (tool === Tools.Draw) {
      // Regular drawing behavior from here
      const newPoints = [...points, { x, y, color: drawColor }];
      const newLayerId = uuidv4();
      let newLayer = null;
      if (shape === ShapeMode.Line && newPoints.length === 2) {
        const newLine = {
          start: newPoints[0],
          end: newPoints[1],
          layerId: newLayerId,
          color: drawColor,
        };
        setLines((prev) => [...prev, newLine]);
        newLayer = {
          id: newLayerId,
          name: `Line ${lines.length + 1}`,
          icon: "🖊️",
          is_selected: false,
          is_visible: true,
        }; // Initially not selected
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
      } else if (shape === ShapeMode.Circle && newPoints.length === 2) {
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const newCircle = {
          center: newPoints[0],
          radius: Math.sqrt(dx * dx + dy * dy),
          layerId: newLayerId,
          borderColor: drawColor,
        };
        setCircles((prev) => [...prev, newCircle]);
        newLayer = {
          id: newLayerId,
          name: `Circle ${circles.length + 1}`,
          icon: "⚪",
          is_selected: false,
          is_visible: true,
        }; // Initially not selected
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
      } else if (shape === ShapeMode.Curve) {
        if (newPoints.length < 4) {
          setPoints(newPoints);
        }
        if (newPoints.length === 4) {
          const [p0, p1, p2, p3] = newPoints;
          const newCurve = {
            p0,
            p1,
            p2,
            p3,
            layerId: newLayerId,
            color: drawColor,
          };
          setCurves((prev) => [...prev, newCurve]);
          newLayer = {
            id: newLayerId,
            name: `Curve ${curves.length + 1}`,
            icon: "➰",
            is_selected: false,
            is_visible: true,
          }; // Initially not selected
          setLayers([...layers, newLayer]);
          setSelectedLayerId(newLayer.id);
          setPoints([]);
        }
      } else if (shape === ShapeMode.Ellipse && newPoints.length === 2) {
        const dx = Math.abs(newPoints[1].x - newPoints[0].x);
        const dy = Math.abs(newPoints[1].y - newPoints[0].y);
        const newEllipse = {
          center: newPoints[0],
          rx: dx,
          ry: dy,
          layerId: newLayerId,
          borderColor: drawColor,
        };
        setEllipses((prev) => [...prev, newEllipse]);
        newLayer = {
          id: newLayerId,
          name: `Ellipse ${ellipses.length + 1}`,
          icon: "🧿",
          is_selected: false,
          is_visible: true,
        }; // Initially not selected
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
      } else {
        setPoints(newPoints);
      }
      setMousePos(null);
      if (newLayer) {
        setSelectedLayerId(newLayer.id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    if (tool === Tools.Select) {
      // When in select mode, you might want to change the cursor when hovering over a shape
      const hoverInfo = findShapeAtPoint(
        x,
        y,
        lines,
        circles,
        ellipses,
        curves,
        layers
      );
      if (hoverInfo.layerId) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
      return;
    }

    // Only update shape position during mouse move if we're actively moving a shape
    if (tool === Tools.Move && isMoving && selectedShape) {
      const newX = x - selectedShape.offset.x;
      const newY = y - selectedShape.offset.y;

      switch (selectedShape.type) {
        case "line":
          const updatedLines = lines.map((line, index) =>
            index === selectedShape.index
              ? {
                  ...line,
                  start: { x: newX, y: newY },
                  end: {
                    x: line.end.x + (newX - line.start.x),
                    y: line.end.y + (newY - line.start.y),
                  },
                }
              : line
          );
          setLines(updatedLines);
          break;
        case "circle":
          const updatedCircles = circles.map((circle, index) =>
            index === selectedShape.index
              ? { ...circle, center: { x: newX, y: newY } }
              : circle
          );
          setCircles(updatedCircles);
          break;
        case "ellipse":
          const updatedEllipses = ellipses.map((ellipse, index) =>
            index === selectedShape.index
              ? { ...ellipse, center: { x: newX, y: newY } }
              : ellipse
          );
          setEllipses(updatedEllipses);
          break;
        case "curve":
          const updatedCurves = curves.map((curve, index) => {
            if (index === selectedShape.index) {
              const dx = newX - curve.p0.x;
              const dy = newY - curve.p0.y;
              return {
                ...curve,
                p0: { x: newX, y: newY },
                p1: { x: curve.p1.x + dx, y: curve.p1.y + dy },
                p2: { x: curve.p2.x + dx, y: curve.p2.y + dy },
                p3: { x: curve.p3.x + dx, y: curve.p3.y + dy },
              };
            }
            return curve;
          });
          setCurves(updatedCurves);
          break;
      }
      return;
    } else if (tool === Tools.Move) {
      // Change cursor to pointer when hovering over a shape
      const hoverInfo = findShapeAtPoint(
        x,
        y,
        lines,
        circles,
        ellipses,
        curves,
        layers
      );
      if (hoverInfo.layerId) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    }

    if (
      (shape === ShapeMode.Line && points.length !== 1) ||
      (shape === ShapeMode.Circle && points.length !== 1) ||
      (shape === ShapeMode.Curve && points.length !== 3) ||
      (shape === ShapeMode.Ellipse && points.length !== 1)
    )
      return;

    // Handle angle snapping for line drawing
    if (shape === ShapeMode.Line && points.length === 1 && e.shiftKey) {
      const startPoint = points[0];
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Snap to nearest 45-degree angle
      const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const snappedX = startPoint.x + Math.cos(snapAngle) * distance;
      const snappedY = startPoint.y + Math.sin(snapAngle) * distance;
      
      setMousePos({
        x: Math.round(snappedX),
        y: Math.round(snappedY),
      });
    } else {
      setMousePos({
        x: Math.floor(e.clientX - rect.left),
        y: Math.floor(e.clientY - rect.top),
      });
    }
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    />
  );
};

export default CanvasEvents;
