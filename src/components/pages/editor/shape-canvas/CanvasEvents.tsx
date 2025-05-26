import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTab } from "@/context/AppContext";
import { Point, Polygon, ShapeMode } from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { v4 as uuidv4 } from "uuid";
import { findShapeAtPoint } from "@/utils/selection";
import { getShapeCenter } from "@/utils/position";
import DrawPolygonModal from "@/components/ui/modal/DrawPolygonModal";
import RotateModal from "@/components/ui/modal/RotateModal";
import EraseShapeModal from "@/components/ui/modal/EraseShapeModal";
import FlipShapeModal from "@/components/ui/modal/FlipShapeModal";
import { flipPoint, rotatePoint } from "@/utils/transform";
import { GlobalColor } from "@/interface/color";

interface CanvasEventsProps {
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
      type: "line" | "circle" | "ellipse" | "curve" | null;
      offset: Point;
    } | null>
  >;
}

const drawColor = GlobalColor.DraftDrawColor;

const CanvasEvents: React.FC<CanvasEventsProps> = ({
  canvasRef,
  setMousePos,
  isMoving,
  setIsMoving,
  selectedShape,
  setSelectedShape,
}) => {
  const [flipModalVisible, setFlipModalVisible] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<Point | null>(null);
  const [shapeToFlip, setShapeToFlip] = useState<{
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | null;
  } | null>(null);
  const [willingToDrawPolygon, setWillingToDrawPolygon] =
    useState<boolean>(false);

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
    polygons,
    setPolygons,
    polygonCornerNumber,
    setPolygonCornerNumber,
    setLog,
  } = useTab();
  const [isErasing, setIsErasing] = useState(false); // State to track if erasing is in progress
  const [erasingShape, setErasingShape] = useState<{
    layerId: string;
    index: number;
    type: string;
    position: Point;
  } | null>(null); // Add position
  const [erasingModalVisible, setErasingModalVisible] =
    useState<boolean>(false); // State to control the visibility of the erasing modal
  const [rotatePopoverOpen, setRotatePopoverOpen] = useState(false); // State for rotate popover
  const [rotationAngle, setRotationAngle] = useState<number | string>(""); // State to store rotation angle, can be a number or empty string
  const [rotatingShape, setRotatingShape] = useState<{
    layerId: string;
    index: number;
    type: string;
    center: Point;
  } | null>(null); // Shape being rotated
  const popoverRef = useRef<HTMLDivElement>(null!);
  const rotatePopoverRef = useRef<HTMLDivElement>(null); // Ref for rotate popover

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setErasingModalVisible(false);
        setErasingShape(null);
      }
      if (
        rotatePopoverRef.current &&
        !rotatePopoverRef.current.contains(event.target as Node)
      ) {
        setRotatePopoverOpen(false);
        setRotatingShape(null);
        setRotationAngle("");
      }
    };

    if (erasingModalVisible || rotatePopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [erasingModalVisible, rotatePopoverOpen]);

  const highlightShape = (clickedShape: {
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | null;
  }) => {
    const updatedLayers = layers.map((layer) => ({
      ...layer,
      is_selected: layer.id === clickedShape.layerId,
    }));
    setLayers(updatedLayers);
    setSelectedLayerId(clickedShape.layerId);
    return;
  };

  const cancelHighlightShape = () => {
    const updatedLayers = layers.map((layer) => ({
      ...layer,
      is_selected: false,
    }));
    setLayers(updatedLayers);
    setSelectedLayerId(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const clickedShape = findShapeAtPoint(
      x,
      y,
      lines,
      circles,
      ellipses,
      curves,
      layers
    );
    if (tool === Tools.Select) {
      if (clickedShape.layerId) {
        highlightShape(clickedShape);
        return;
      } else {
        cancelHighlightShape();
        return;
      }
    }

    if (tool === Tools.Move) {
      if (clickedShape.layerId) {
        if (clickedShape.layerId && isMoving) {
          cancelHighlightShape();
          setSelectedLayerId(null);
          setIsMoving(false); // Stop moving state
          return;
        } else {
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
          highlightShape(clickedShape);
          setSelectedShape({
            ...clickedShape,
            offset: {
              x: x - shapePosition.x,
              y: y - shapePosition.y,
            },
          });
        }
        return;
      } else {
        cancelHighlightShape();
        return;
      }
    }

    if (tool === Tools.Rotate) {
      if (clickedShape.layerId) {
        let shapeCenter: Point = { x: 0, y: 0 };
        switch (clickedShape.type) {
          case "line":
            shapeCenter = {
              // Calculate the center here
              x:
                (lines[clickedShape.index!].start.x +
                  lines[clickedShape.index!].end.x) /
                2,
              y:
                (lines[clickedShape.index!].start.y +
                  lines[clickedShape.index!].end.y) /
                2,
            };
            break;
          case "circle":
            shapeCenter = circles[clickedShape.index!].center;
            break;
          case "ellipse":
            shapeCenter = ellipses[clickedShape.index!].center;
            break;
          case "curve":
            shapeCenter = curves[clickedShape.index!].p0;
            break;
        }

        highlightShape(clickedShape);
        setRotatingShape({
          layerId: clickedShape.layerId,
          index: clickedShape.index || 0,
          type: clickedShape.type ? clickedShape.type : "line",
          center: shapeCenter, // Use the calculated center
        });
        setRotatePopoverOpen(true); // Open the rotate popover

        setSelectedShape({
          ...clickedShape,
          offset: {
            x: x - shapeCenter.x, // Offset based on the center
            y: y - shapeCenter.y,
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

    if (tool === Tools.Flip) {
      if (clickedShape.layerId) {
        // Show popup to select flip direction
        setFlipModalVisible(true);
        setErasingModalVisible(false);
        setModalPosition({ x, y });
        setShapeToFlip(clickedShape);

        // Highlight the selected shape
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: layer.id === clickedShape.layerId,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(clickedShape.layerId);
        return;
      } else {
        // If no shape is clicked, deselect all
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: false,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(null);
        setSelectedShape(null);
      }
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
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Line ${lines.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
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
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Circle ${circles.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
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
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Curve ${curves.length + 1} created`,
              timestamp: Date.now(),
            },
          ]);
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
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Ellipse ${ellipses.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
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

    if (tool === Tools.Draw && shape === ShapeMode.Polygon) {
      const newPoints = [...points, { x, y, color: drawColor }];
      setPoints(newPoints);
      if (newPoints.length === 1) {
        setWillingToDrawPolygon(true);
      }
      if (newPoints.length === 2) {
        // Second click, determine radius and draw polygon
        const center = newPoints[0];
        const radius = Math.sqrt(
          Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
        );
        const newLayerId = uuidv4();
        const numSides = polygonCornerNumber;
        const polygonPoints: Point[] = [];
        for (let i = 0; i < numSides; i++) {
          const angle = (2 * Math.PI * i) / numSides;
          polygonPoints.push({
            x: Math.round(center.x + radius * Math.cos(angle)),
            y: Math.round(center.y + radius * Math.sin(angle)),
          });
        }
        const newPolygon: Polygon = {
          points: polygonPoints,
          layerId: newLayerId,
          borderColor: "black",
          backgroundColor: "transparent",
        };
        setPolygons((prev) => [...prev, newPolygon]);
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Polygon ${polygons.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
        const newLayer = {
          id: newLayerId,
          name: `Polygon ${polygons.length + 1}`,
          icon: "△",
          is_selected: true,
          is_visible: true,
        };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayerId);
        setPoints([]);
      }
    }

    // If tool is eraser
    if (tool === Tools.Eraser) {
      if (clickedShape.layerId) {
        // Highlight the selected shape
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: layer.id === clickedShape.layerId,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(clickedShape.layerId);
        handleEraser(x, y);
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
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    setMousePos({ x, y });

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
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Line ${selectedShape.index} moved to (${newX}, ${newY})`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "circle":
          const updatedCircles = circles.map((circle, index) =>
            index === selectedShape.index
              ? { ...circle, center: { x: newX, y: newY } }
              : circle
          );
          setCircles(updatedCircles);
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Circle ${selectedShape.index} moved to (${newX}, ${newY})`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "ellipse":
          const updatedEllipses = ellipses.map((ellipse, index) =>
            index === selectedShape.index
              ? { ...ellipse, center: { x: newX, y: newY } }
              : ellipse
          );
          setEllipses(updatedEllipses);
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Ellipse ${selectedShape.index} moved to (${newX}, ${newY})`,
              timestamp: Date.now(),
            },
          ]);
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
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Curve ${selectedShape.index} moved to (${newX}, ${newY})`,
              timestamp: Date.now(),
            },
          ]);
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
    if (tool === Tools.Eraser && isErasing) {
      handleEraser(x, y);
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

      // Convert angle to degrees and snap to nearest 10 degrees
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
      setMousePos({
        x: Math.floor(e.clientX - rect.left),
        y: Math.floor(e.clientY - rect.top),
      });
    }
  };

  const handleEraser = useCallback(
    (x: number, y: number) => {
      // Find shapes at the current cursor position
      const erasedShape = findShapeAtPoint(
        x,
        y,
        lines,
        circles,
        ellipses,
        curves,
        layers
      );

      if (erasedShape.layerId) {
        // If a shape is found and not already waiting for confirmation
        if (!erasingShape) {
          let shapePosition: Point = { x: x, y: y }; // Default position
          //get position
          switch (erasedShape.type) {
            case "line":
              shapePosition = lines[erasedShape.index!]?.start || {
                x: x,
                y: y,
              };
              break;
            case "circle":
              shapePosition = circles[erasedShape.index!]?.center || {
                x: x,
                y: y,
              };
              break;
            case "ellipse":
              shapePosition = ellipses[erasedShape.index!]?.center || {
                x: x,
                y: y,
              };
              break;
            case "curve":
              shapePosition = curves[erasedShape.index!]?.p0 || { x: x, y: y };
              break;
          }
          // Store the shape to be erased and ask for confirmation
          if (
            erasedShape.layerId !== null &&
            erasedShape.index !== null &&
            erasedShape.type !== null
          ) {
            setErasingShape({
              layerId: erasedShape.layerId,
              index: erasedShape.index,
              type: erasedShape.type,
              position: shapePosition,
            }); // Store the position
            setErasingModalVisible(true); // Show the modal
          }
        }
      }
    },
    [erasingShape, lines, circles, ellipses, curves, layers]
  );

  const deleteShape = useCallback(
    (erasedShape: { layerId: string; index: number; type: string }) => {
      switch (erasedShape.type) {
        case "line":
          setLines((prevLines) =>
            prevLines.filter((line, index) => index !== erasedShape.index)
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Line ${erasedShape.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "circle":
          setCircles((prevCircles) =>
            prevCircles.filter((circle, index) => index !== erasedShape.index)
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Circle ${erasedShape.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "ellipse":
          setEllipses((prevEllipses) =>
            prevEllipses.filter((ellipse, index) => index !== erasedShape.index)
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Ellipse ${erasedShape.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "curve":
          setCurves((prevCurves) =>
            prevCurves.filter((curve, index) => index !== erasedShape.index)
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Curve ${erasedShape.index} deleted`,
              timestamp: Date.now(),
            },
          ]);
          break;
      }
      setLayers(layers.filter((layer) => layer.id !== erasedShape.layerId)); //remove layer
      setSelectedLayerId(null); // Clear selected layer
    },
    [layers]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Native event handlers for addEventListener
    const nativeHandleMouseDown = (e: MouseEvent) => {
      // Convert native event to coordinates and call handleMouseDown logic
      if (tool === Tools.Eraser) {
        setIsErasing(true);
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        handleEraser(x, y);
      }
    };

    const nativeHandleMouseUp = () => {
      if (tool === Tools.Eraser) {
        setIsErasing(false);
      }
    };

    canvas.addEventListener("mousedown", nativeHandleMouseDown);
    canvas.addEventListener("mouseup", nativeHandleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", nativeHandleMouseDown);
      canvas.removeEventListener("mouseup", nativeHandleMouseUp);
    };
  }, [tool, handleEraser]);

  const handleRotateShape = useCallback(() => {
    const angle = Number(rotationAngle);
    if (isNaN(angle) || !rotatingShape) {
      alert("Please enter a valid angle and select a shape.");
      return;
    }

    const { layerId, index, type, center } = rotatingShape;

    const angleRad = (angle * Math.PI) / 180;

    switch (type) {
      case "line":
        const newLines = lines.map((line, i) =>
          i === index && line.layerId === layerId
            ? {
                ...line,
                start: {
                  x: Math.round(rotatePoint(line.start, center, angleRad).x),
                  y: Math.round(rotatePoint(line.start, center, angleRad).y),
                },
                end: {
                  x: Math.round(rotatePoint(line.end, center, angleRad).x),
                  y: Math.round(rotatePoint(line.end, center, angleRad).y),
                },
              }
            : line
        );
        setLines(newLines);
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Line ${index} rotated by ${angle} degrees`,
            timestamp: Date.now(),
          },
        ]);
        break;
      case "circle":
        // Circles don't change on rotation around their center
        break;
      case "ellipse":
        // Rotating an ellipse around its center
        setEllipses((prevEllipses) =>
          prevEllipses.map((ellipse, i) =>
            i === index && ellipse.layerId === layerId
              ? {
                  ...ellipse,
                  center: {
                    x: Math.round(
                      rotatePoint(ellipse.center, center, angleRad).x
                    ),
                    y: Math.round(
                      rotatePoint(ellipse.center, center, angleRad).y
                    ),
                  },
                }
              : ellipse
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Ellipse ${index} rotated by ${angle} degrees`,
            timestamp: Date.now(),
          },
        ]);
        break;
      case "curve":
        setCurves((prevCurves) =>
          prevCurves.map((curve, i) =>
            i === index && curve.layerId === layerId
              ? {
                  ...curve,
                  p0: rotatePoint(curve.p0, center, angleRad),
                  p1: rotatePoint(curve.p1, center, angleRad),
                  p2: rotatePoint(curve.p2, center, angleRad),
                  p3: rotatePoint(curve.p3, center, angleRad),
                }
              : curve
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Curve ${index} rotated by ${angle} degrees`,
            timestamp: Date.now(),
          },
        ]);
        break;
      default:
        break;
    }

    // Reset rotation state
    setRotatePopoverOpen(false);
    setRotatingShape(null);
    setRotationAngle("");
  }, [
    rotationAngle,
    rotatingShape,
    setLines,
    setCircles,
    setEllipses,
    setCurves,
  ]);

  function flipShape(direction: string): void {
    if (!shapeToFlip) return;

    const { layerId, index, type } = shapeToFlip;
    switch (type) {
      case "line":
        setLines((prevLines) =>
          prevLines.map((line, i) =>
            i === index && line.layerId === layerId
              ? {
                  ...line,
                  start: flipPoint(
                    line.start,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(line, "line")
                  ),
                  end: flipPoint(
                    line.end,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(line, "line")
                  ),
                }
              : line
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Line ${index} flipped ${direction}`,
            timestamp: Date.now(),
          },
        ]);
        break;
      case "circle":
        break;
      case "ellipse":
        setEllipses((prevEllipses) =>
          prevEllipses.map((ellipse, i) =>
            i === index && ellipse.layerId === layerId
              ? {
                  ...ellipse,
                  center: flipPoint(
                    ellipse.center,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(ellipse, "ellipse")
                  ),
                }
              : ellipse
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Ellipse ${index} flipped ${direction}`,
            timestamp: Date.now(),
          },
        ]);
        break;
      case "curve":
        setCurves((prevCurves) =>
          prevCurves.map((curve, i) =>
            i === index && curve.layerId === layerId
              ? {
                  ...curve,
                  p0: flipPoint(
                    curve.p0,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(curve, "curve")
                  ),
                  p1: flipPoint(
                    curve.p1,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(curve, "curve")
                  ),
                  p2: flipPoint(
                    curve.p2,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(curve, "curve")
                  ),
                  p3: flipPoint(
                    curve.p3,
                    direction as "horizontal" | "vertical",
                    getShapeCenter(curve, "curve")
                  ),
                }
              : curve
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Curve ${index} flipped ${direction}`,
            timestamp: Date.now(),
          },
        ]);
        break;
      default:
        break;
    }

    setFlipModalVisible(false);
    setShapeToFlip(null);
  }

  return (
    <>
      <div
        className="absolute top-0 left-0 w-full h-full"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      >
        {flipModalVisible && modalPosition && (
          <FlipShapeModal modalPosition={modalPosition} flipShape={flipShape} />
        )}
        {erasingShape && erasingModalVisible && (
          <EraseShapeModal
            erasingShape={erasingShape}
            setErasingShape={setErasingShape}
            deleteShape={deleteShape}
            popoverRef={popoverRef}
            setErasingModalVisible={setErasingModalVisible}
          />
        )}
        {rotatingShape && rotatePopoverOpen && (
          <RotateModal
            rotatePopoverRef={rotatePopoverRef}
            rotatingShape={rotatingShape}
            rotationAngle={rotationAngle}
            setRotationAngle={setRotationAngle}
            handleRotateShape={handleRotateShape}
            setRotatePopoverOpen={setRotatePopoverOpen}
            setRotatingShape={setRotatingShape}
          />
        )}
        {willingToDrawPolygon && points.length > 0 && (
          <DrawPolygonModal
            points={points}
            polygonCornerNumber={polygonCornerNumber}
            setPolygonCornerNumber={setPolygonCornerNumber}
            setWillingToDrawPolygon={setWillingToDrawPolygon}
          />
        )}
      </div>
    </>
  );
};

export default CanvasEvents;
