import React, { useEffect, useState, useCallback } from "react";
import { useTab } from "@/context/AppContext";
import {
  drawMarker,
  drawBresenhamLine,
  drawCircle,
  drawBezierCurve,
  drawEllipseMidpoint,
  getShapeStyle,
  drawBoundingBox,
  drawPolygon,
} from "@/utils/drawing";
import {
  Point,
  ShapeMode,
  Polygon,
  Line,
  Circle,
  Ellipse,
  Curve,
} from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { GlobalColor } from "@/interface/color";

const previewLineColor = GlobalColor.DraftDrawColor;
const LOCAL_STORAGE_KEY = "cad_drawing_state"; // This is now a base key, specific project key will be appended

interface CanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mousePos: Point | null;
  importTimestamp?: number;
  selectedShape: {
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
    offset: Point;
  } | null;
  onMovementComplete?: () => void;
}

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  canvasRef,
  mousePos,
  importTimestamp,
  selectedShape, // Prop received from CanvasEvents
  onMovementComplete,
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
    polygons,
    setPolygons,
    layers,
    setLayers,
    shape,
    tool,
    selectedLayerId, // This is for the active layer, not necessarily the selected shape's layer
    snapEnabled,
    showGrid,
    polygonCornerNumber,
    canvasSize,
    setCanvasSize,
    currentProject,
    resetCanvasState,
    setSelectedLayerId,
    zoomLevel,
    zoomOffsetX,
    zoomOffsetY,
    currentColor,
  } = useTab();

  // Helper to generate the localStorage key based on the current project
  const getLocalStorageKey = (projectKey: string) =>
    `cad_drawing_state_${projectKey}`;

  const getSnappedPos = (pos: Point): Point => {
    const gridSize = 20;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  };

  const effectiveMousePos =
    snapEnabled && showGrid && mousePos ? getSnappedPos(mousePos) : mousePos;

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext("2d");

  const clearCanvas = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  };

  const drawMarkers = (context: CanvasRenderingContext2D) => {
    points.forEach((pt) => {
      drawMarker(pt.x, pt.y, context);
    });
  };

  const drawLines = (context: CanvasRenderingContext2D) => {
    lines.forEach(({ start, end, layerId, color }) => {
      // 'color' is the shape's specific color
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { lineWidth } = getShapeStyle(layer); // Get lineWidth from layer
        drawBresenhamLine(
          start.x,
          start.y,
          end.x,
          end.y,
          context,
          color,
          lineWidth
        ); // Use shape's color
      }
    });
  };

  const drawCircles = (context: CanvasRenderingContext2D) => {
    circles.forEach(
      ({ center, radius, layerId, borderColor, backgroundColor }) => {
        // Use shape's specific colors
        const layer = layers.find((l) => l.id === layerId);
        if (layer?.is_visible) {
          const { lineWidth } = getShapeStyle(layer); // Get lineWidth from layer
          drawCircle(
            center.x,
            center.y,
            radius,
            context,
            borderColor,
            backgroundColor,
            lineWidth
          ); // Use shape's specific colors
        }
      }
    );
  };

  const drawCurves = (context: CanvasRenderingContext2D) => {
    curves.forEach(({ p0, p1, p2, p3, layerId, color }) => {
      // 'color' is the shape's specific color
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { lineWidth } = getShapeStyle(layer); // Get lineWidth from layer
        drawBezierCurve(p0, p1, p2, p3, context, color, lineWidth); // Use shape's color
      }
    });
  };

  const drawEllipses = (context: CanvasRenderingContext2D) => {
    ellipses.forEach(
      ({ center, rx, ry, layerId, borderColor, backgroundColor }) => {
        const layer = layers.find((l) => l.id === layerId);
        if (layer?.is_visible) {
          const { lineWidth } = getShapeStyle(layer);
          drawEllipseMidpoint(
            center.x,
            center.y,
            rx,
            ry,
            context,
            borderColor,
            lineWidth,
            backgroundColor
          );
        }
      }
    );
  };

  const drawPolygons = (context: CanvasRenderingContext2D) => {
    polygons.forEach(
      ({ points: polygonPoints, layerId, borderColor, backgroundColor }) => {
        // Use shape's specific colors
        const layer = layers.find((l) => l.id === layerId);
        if (layer?.is_visible && polygonPoints.length > 1) {
          const { lineWidth } = getShapeStyle(layer); // Get lineWidth from layer
          drawPolygon(
            polygonPoints,
            context,
            borderColor,
            backgroundColor,
            lineWidth
          ); // Use shape's specific colors
        }
      }
    );
  };

  const generatePolygonPoints = (
    center: Point,
    radius: number,
    numCorners: number
  ): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < numCorners; i++) {
      const angle = (2 * Math.PI * i) / numCorners;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  };

  const drawPreview = (context: CanvasRenderingContext2D) => {
    if (points.length > 0 && effectiveMousePos && context) {
      if (shape === ShapeMode.Line && points.length === 1) {
        drawBresenhamLine(
          points[0].x,
          points[0].y,
          effectiveMousePos.x,
          effectiveMousePos.y,
          context,
          currentColor
        );
      } else if (shape === ShapeMode.Circle && points.length === 1) {
        const dx = effectiveMousePos.x - points[0].x;
        const dy = effectiveMousePos.y - points[0].y;
        drawCircle(
          points[0].x,
          points[0].y,
          Math.sqrt(dx * dx + dy * dy),
          context,
          currentColor
        );
      } else if (shape === ShapeMode.Curve && points.length === 3) {
        drawBezierCurve(
          points[0],
          points[1],
          points[2],
          effectiveMousePos,
          context,
          currentColor
        );
      } else if (shape === ShapeMode.Ellipse && points.length === 1) {
        const dx = Math.abs(effectiveMousePos.x - points[0].x);
        const dy = Math.abs(effectiveMousePos.y - points[0].y);
        drawEllipseMidpoint(
          points[0].x,
          points[0].y,
          dx,
          dy,
          context,
          currentColor
        );
      } else if (
        shape === ShapeMode.Polygon &&
        points.length === 1 &&
        effectiveMousePos
      ) {
        const center = points[0];
        const radius = Math.sqrt(
          Math.pow(effectiveMousePos.x - center.x, 2) +
            Math.pow(effectiveMousePos.y - center.y, 2)
        );
        const numSides = polygonCornerNumber;
        const previewPoints = generatePolygonPoints(center, radius, numSides);
        if (previewPoints.length > 0) {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
              drawPolygon(previewPoints, ctx, currentColor, "transparent");
            }
          }
        }
      }
    }
  };

  const drawBoundingBoxForSelected = (context: CanvasRenderingContext2D) => {
    // Ensure selectedShape is valid and has all necessary properties
    if (
      !selectedShape ||
      selectedShape.layerId === null ||
      selectedShape.index === null ||
      selectedShape.type === null
    ) {
      return;
    }

    const layer = layers.find((l) => l.id === selectedShape.layerId);
    if (!layer?.is_visible) {
      return; // If the layer is not visible, don't draw the bounding box
    }

    let targetObject: Line | Circle | Ellipse | Curve | Polygon | undefined;

    // Retrieve the specific selected object based on its type and index
    switch (selectedShape.type) {
      case "line":
        targetObject = lines[selectedShape.index];
        break;
      case "circle":
        targetObject = circles[selectedShape.index];
        break;
      case "ellipse":
        targetObject = ellipses[selectedShape.index];
        break;
      case "curve":
        targetObject = curves[selectedShape.index];
        break;
      case "polygon":
        targetObject = polygons[selectedShape.index];
        break;
      default:
        return; // Should not happen if type is correctly limited
    }

    // Double-check if the retrieved object exists and belongs to the correct layer
    if (!targetObject || targetObject.layerId !== selectedShape.layerId) {
      return;
    }

    let minX: number | undefined;
    let minY: number | undefined;
    let maxX: number | undefined;
    let maxY: number | undefined;

    // Calculate bounding box based on the specific shape type
    if (selectedShape.type === "line") {
      const line = targetObject as Line;
      minX = Math.min(line.start.x, line.end.x);
      minY = Math.min(line.start.y, line.end.y);
      maxX = Math.max(line.start.x, line.end.x);
      maxY = Math.max(line.start.y, line.end.y);
    } else if (selectedShape.type === "circle") {
      const circle = targetObject as Circle;
      minX = circle.center.x - circle.radius;
      minY = circle.center.y - circle.radius;
      maxX = circle.center.x + circle.radius;
      maxY = circle.center.y + circle.radius;
    } else if (selectedShape.type === "ellipse") {
      const ellipse = targetObject as Ellipse;
      minX = ellipse.center.x - ellipse.rx;
      minY = ellipse.center.y - ellipse.ry;
      maxX = ellipse.center.x + ellipse.rx;
      maxY = ellipse.center.y + ellipse.ry;
    } else if (selectedShape.type === "curve") {
      const curve = targetObject as Curve;
      const {
        minX: curveMinX,
        minY: curveMinY,
        maxX: curveMaxX,
        maxY: curveMaxY,
      } = getBezierBoundingBox(curve.p0, curve.p1, curve.p2, curve.p3);
      minX = curveMinX;
      minY = curveMinY;
      maxX = curveMaxX;
      maxY = curveMaxY;
    } else if (selectedShape.type === "polygon") {
      const polygon = targetObject as Polygon;
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

    // Only draw if all bounding box coordinates are defined
    if (
      minX !== undefined &&
      minY !== undefined &&
      maxX !== undefined &&
      maxY !== undefined
    ) {
      // Apply zoom transformation to the bounding box coordinates
      const transformedMinX = minX * zoomLevel + zoomOffsetX;
      const transformedMinY = minY * zoomLevel + zoomOffsetY;
      const transformedMaxX = maxX * zoomLevel + zoomOffsetX;
      const transformedMaxY = maxY * zoomLevel + zoomOffsetY;

      // Draw the bounding box rectangle and handles only for the Scale tool

      drawBoundingBox(
        transformedMinX,
        transformedMinY,
        transformedMaxX - transformedMinX,
        transformedMaxY - transformedMinY,
        context,
        undefined, // color (use default)
        undefined, // lineWidth (use default)
        tool === Tools.Scale // Pass true only if tool is Scale
      );
    }
  };

  // Function to save the canvas state to localStorage, now dependent on currentProject
  const saveCanvasState = useCallback(() => {
    if (!currentProject) {
      console.warn("No current project selected. Not saving canvas state.");
      return;
    }

    try {
      let thumbnail: string | null = null;
      if (canvasRef.current) {
        // Always generate thumbnail when saving state
        thumbnail = canvasRef.current.toDataURL("image/png");
      }

      const stateToSave = {
        lines,
        circles,
        curves,
        ellipses,
        polygons,
        layers,
        canvasSize,
        lastSaved: new Date().toISOString(),
        thumbnail, // Add the thumbnail to the saved state
      };
      localStorage.setItem(
        getLocalStorageKey(currentProject),
        JSON.stringify(stateToSave)
      );
    } catch (error) {
      console.error(
        `Failed to save canvas state for project ${currentProject}:`,
        error
      );
      // If saving fails, consider clearing the specific project's data to prevent future issues
      // localStorage.removeItem(getLocalStorageKey(currentProject));
    }
  }, [
    currentProject,
    canvasRef, // Add canvasRef to dependencies since we access canvasRef.current
    lines,
    circles,
    curves,
    ellipses,
    polygons,
    layers,
    canvasSize,
  ]);

  // Effect to load canvas state from localStorage when currentProject changes
  useEffect(() => {
    if (!currentProject) {
      // If no project is selected, clear the canvas and reset states
      resetCanvasState();
      return;
    }

    try {
      const savedState = localStorage.getItem(
        getLocalStorageKey(currentProject)
      );
      const parsedState = savedState ? JSON.parse(savedState) : null;

      if (parsedState) {
        setLines(parsedState.lines || []);
        setCircles(parsedState.circles || []);
        setCurves(parsedState.curves || []);
        setEllipses(parsedState.ellipses || []);
        setPolygons(parsedState.polygons || []);
        setLayers(parsedState.layers || []);
        setCanvasSize(
          parsedState.canvasSize || {
            width: 800,
            height: 600,
            backgroundColor: "#ffffff",
          }
        );
        setSelectedLayerId(parsedState.layers?.[0]?.id || null);
        // If you had a place to use the thumbnail, you would set it here:
        // setThumbnailData(parsedState.thumbnail || null);
      } else {
        console.log(
          `No saved state found for project: ${currentProject}. Resetting canvas.`
        );
        resetCanvasState();
      }
    } catch (error) {
      console.error(
        `Failed to load canvas state for project ${currentProject}:`,
        error
      );
      localStorage.removeItem(getLocalStorageKey(currentProject));
      resetCanvasState();
    }
  }, [
    currentProject,
    setLines,
    setCircles,
    setCurves,
    setEllipses,
    setPolygons,
    setLayers,
    setCanvasSize,
    resetCanvasState,
    setSelectedLayerId,
  ]);

  // Effect to save canvas state whenever drawing data or currentProject changes
  useEffect(() => {
    // Debounce the save operation to avoid too frequent saves
    const timeoutId = setTimeout(() => {
      saveCanvasState();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [
    lines,
    circles,
    curves,
    ellipses,
    polygons,
    layers,
    canvasSize,
    currentProject,
    saveCanvasState,
  ]);

  // Effect to handle movement completion
  useEffect(() => {
    if (onMovementComplete) {
      onMovementComplete();
    }
  }, [onMovementComplete]);

  // Main drawing effect
  useEffect(() => {
    if (!ctx) return;
    if (canvas) {
      canvas.style.backgroundColor = canvasSize.backgroundColor;
    }
    clearCanvas(ctx);
    ctx.save();
    ctx.translate(zoomOffsetX, zoomOffsetY);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw all shapes first
    drawMarkers(ctx);
    drawLines(ctx);
    drawCircles(ctx);
    drawCurves(ctx);
    drawEllipses(ctx);
    drawPolygons(ctx);
    drawPreview(ctx);

    // Draw bounding box last, after all shapes
    // The condition for drawing the bounding box is now inside the function itself
    drawBoundingBoxForSelected(ctx);

    ctx.restore();
  }, [
    points,
    effectiveMousePos,
    lines,
    circles,
    curves,
    ellipses,
    polygons,
    layers,
    shape,
    tool,
    selectedLayerId,
    importTimestamp,
    polygonCornerNumber,
    canvasSize,
    ctx,
    zoomLevel,
    zoomOffsetX,
    zoomOffsetY,
    selectedShape, // Ensure selectedShape is a dependency
  ]);

  // Remove the polygon completion effect since we're handling it in ToolsTab now
  useEffect(() => {
    if (
      ctx &&
      shape === ShapeMode.Polygon &&
      points.length === 1 &&
      effectiveMousePos
    ) {
      const center = points[0];
      const radius = Math.sqrt(
        Math.pow(effectiveMousePos.x - center.x, 2) +
          Math.pow(effectiveMousePos.y - center.y, 2)
      );
      const previewPoints = generatePolygonPoints(
        center,
        radius,
        polygonCornerNumber
      );
      if (previewPoints.length > 0) {
        drawPolygon(previewPoints, ctx, currentColor, "transparent");
      }
    }
  }, [
    ctx,
    shape,
    points,
    effectiveMousePos,
    polygonCornerNumber,
    currentColor,
  ]);

  return null;
};

// ... (getBezierBoundingBox function remains unchanged) ...
function getBezierBoundingBox(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point
): { minX: number; minY: number; maxX: number; maxY: number } {
  const bezierExtrema = (p0: number, p1: number, p2: number, p3: number) => {
    const a = -p0 + 3 * p1 - 3 * p2 + p3;
    const b = 2 * (p0 - 2 * p1 + p2);
    const c = -p0 + p1;

    const tValues: number[] = [];
    if (Math.abs(a) > 1e-6) {
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const t1 = (-b + sqrtDiscriminant) / (2 * a);
        const t2 = (-b - sqrtDiscriminant) / (2 * a);
        if (t1 >= 0 && t1 <= 1) tValues.push(t1);
        if (t2 >= 0 && t2 <= 1) tValues.push(t2);
      }
    } else if (Math.abs(b) > 1e-6) {
      const t = -c / b;
      if (t >= 0 && t <= 1) tValues.push(t);
    }

    return tValues;
  };

  const evaluateBezier = (
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
  ) => {
    const mt = 1 - t;
    return (
      mt * mt * mt * p0 +
      3 * mt * mt * t * p1 +
      3 * mt * t * t * p2 +
      t * t * t * p3
    );
  };

  const xExtrema = bezierExtrema(p0.x, p1.x, p2.x, p3.x);
  const yExtrema = bezierExtrema(p0.y, p1.y, p2.y, p3.y);

  const xValues = [
    p0.x,
    p3.x,
    ...xExtrema.map((t) => evaluateBezier(t, p0.x, p1.x, p2.x, p3.x)),
  ];
  const yValues = [
    p0.y,
    p3.y,
    ...yExtrema.map((t) => evaluateBezier(t, p0.y, p1.y, p2.y, p3.y)),
  ];

  const minX = Math.min(...xValues);
  const minY = Math.min(...yValues);
  const maxX = Math.max(...xValues);
  const maxY = Math.max(...yValues);

  return { minX, minY, maxX, maxY };
}

export default CanvasDrawing;
