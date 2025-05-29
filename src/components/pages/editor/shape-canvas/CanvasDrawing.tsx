import React, { useEffect, useState, useCallback } from "react";
import { useTab } from "@/context/AppContext";
import {
  drawMarker,
  drawBresenhamLine,
  drawCircle,
  drawBezierCurve,
  drawEllipseMidpoint,
  getShapeStyle,
  getCircleStyle,
  getEllipseStyle,
  drawBoundingBox,
  drawPolygon,
} from "@/utils/drawing";
import { Point, ShapeMode, Polygon, Line, Circle, Ellipse, Curve } from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { GlobalColor } from "@/interface/color";

const previewLineColor = GlobalColor.DraftDrawColor;
const LOCAL_STORAGE_KEY = "cad_drawing_state"; // This is now a base key, specific project key will be appended

interface CanvasDrawingProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mousePos: Point | null;
  importTimestamp?: number;
}

const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  canvasRef,
  mousePos,
  importTimestamp,
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
    selectedLayerId,
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
  } = useTab();

  // Helper to generate the localStorage key based on the current project
  const getLocalStorageKey = (projectKey: string) => `cad_drawing_state_${projectKey}`;

  const getSnappedPos = (pos: Point): Point => {
    const gridSize = 20;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  };

  const effectiveMousePos = (snapEnabled && showGrid && mousePos)
    ? getSnappedPos(mousePos)
    : mousePos;

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
    lines.forEach(({ start, end, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, lineWidth } = getShapeStyle(layer);
        const strokeColor = stroke;
        drawBresenhamLine(start.x, start.y, end.x, end.y, context, strokeColor, lineWidth);
      }
    });
  };

  const drawCircles = (context: CanvasRenderingContext2D) => {
    circles.forEach(({ center, radius, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, fill, lineWidth } = getCircleStyle(layer);
        const strokeColor = stroke;
        drawCircle(center.x, center.y, radius, context, strokeColor, fill, lineWidth);
      }
    });
  };

  const drawCurves = (context: CanvasRenderingContext2D) => {
    curves.forEach(({ p0, p1, p2, p3, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, lineWidth } = getShapeStyle(layer);
        const strokeColor = stroke;
        drawBezierCurve(p0, p1, p2, p3, context, strokeColor, lineWidth);
      }
    });
  };

  const drawEllipses = (context: CanvasRenderingContext2D) => {
    ellipses.forEach(({ center, rx, ry, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, fill, lineWidth } = getEllipseStyle(layer);
        const strokeColor = stroke;
        drawEllipseMidpoint(center.x, center.y, rx, ry, context, strokeColor, lineWidth);
      }
    });
  };

  const drawPolygons = (context: CanvasRenderingContext2D) => {
    polygons.forEach(({ points: polygonPoints, layerId, borderColor, backgroundColor }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible && polygonPoints.length > 1) {
        drawPolygon(polygonPoints, context, borderColor, backgroundColor, 1);
      }
    });
  };

  const generatePolygonPoints = (center: Point, radius: number, numCorners: number): Point[] => {
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
          previewLineColor
        );
      } else if (shape === ShapeMode.Circle && points.length === 1) {
        const dx = effectiveMousePos.x - points[0].x;
        const dy = effectiveMousePos.y - points[0].y;
        drawCircle(
          points[0].x,
          points[0].y,
          Math.sqrt(dx * dx + dy * dy),
          context,
          previewLineColor
        );
      } else if (shape === ShapeMode.Curve && points.length === 3) {
        drawBezierCurve(
          points[0],
          points[1],
          points[2],
          effectiveMousePos,
          context,
          previewLineColor
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
          previewLineColor
        );
      } else if (shape === ShapeMode.Polygon && points.length === 1 && effectiveMousePos) {
        const center = points[0];
        const radius = Math.sqrt(
          Math.pow(effectiveMousePos.x - center.x, 2) + Math.pow(effectiveMousePos.y - center.y, 2)
        );
        const numSides = polygonCornerNumber;
        const previewPoints = generatePolygonPoints(center, radius, numSides);
        if (previewPoints.length > 0) {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              drawPolygon(previewPoints, ctx, previewLineColor, "transparent");
            }
          }
        }
      }
    }
  };

  const drawBoundingBoxForSelected = (context: CanvasRenderingContext2D) => {
    if (tool === Tools.Move && selectedLayerId && context) {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (layer?.is_visible) {
        const selectedObject =
          lines.find((line) => line.layerId === selectedLayerId) ||
          circles.find((circle) => circle.layerId === selectedLayerId) ||
          ellipses.find((ellipse) => ellipse.layerId === selectedLayerId) ||
          curves.find((curve) => curve.layerId === selectedLayerId) ||
          polygons.find((polygon) => polygon.layerId === selectedLayerId);

        if (selectedObject) {
          let minX: number | undefined;
          let minY: number | undefined;
          let maxX: number | undefined;
          let maxY: number | undefined;

          if ((selectedObject as Line).start && (selectedObject as Line).end) {
            const line = selectedObject as Line;
            minX = Math.min(line.start.x, line.end.x);
            minY = Math.min(line.start.y, line.end.y);
            maxX = Math.max(line.start.x, line.end.x);
            maxY = Math.max(line.start.y, line.end.y);
          } else if ((selectedObject as Circle).center && (selectedObject as Circle).radius) {
            const circle = selectedObject as Circle;
            minX = circle.center.x - circle.radius;
            minY = circle.center.y - circle.radius;
            maxX = circle.center.x + circle.radius;
            maxY = circle.center.y + circle.radius;
          } else if ((selectedObject as Ellipse).center && (selectedObject as Ellipse).rx && (selectedObject as Ellipse).ry) {
            const ellipse = selectedObject as Ellipse;
            minX = ellipse.center.x - ellipse.rx;
            minY = ellipse.center.y - ellipse.ry;
            maxX = ellipse.center.x + ellipse.rx;
            maxY = ellipse.center.y + ellipse.ry;
          } else if ((selectedObject as Curve).p0 && (selectedObject as Curve).p3) {
            const curve = selectedObject as Curve;
            const { minX: curveMinX, minY: curveMinY, maxX: curveMaxX, maxY: curveMaxY } =
              getBezierBoundingBox(curve.p0, curve.p1, curve.p2, curve.p3);
            minX = curveMinX;
            minY = curveMinY;
            maxX = curveMaxX;
            maxY = curveMaxY;
          } else if ((selectedObject as Polygon).points && (selectedObject as Polygon).points.length > 0) {
            const polygon = selectedObject as Polygon;
            polygon.points.forEach((p) => {
              minX = minX === undefined ? p.x : Math.min(minX, p.x);
              minY = minY === undefined ? p.y : Math.min(minY, p.y);
              maxX = maxX === undefined ? p.x : Math.max(maxX, p.x);
              maxY = maxY === undefined ? p.y : Math.max(maxY, p.y);
            });
          }

          if (minX !== undefined && minY !== undefined && maxX !== undefined && maxY !== undefined) {
            drawBoundingBox(minX, minY, maxX - minX, maxY - minY, context);
          }
        }
      }
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
        // Get the canvas content as a Base64 encoded PNG image
        thumbnail = canvasRef.current.toDataURL('image/png');
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
      localStorage.setItem(getLocalStorageKey(currentProject), JSON.stringify(stateToSave));
      console.log(`Canvas state and thumbnail saved for project: ${currentProject}`);
    } catch (error) {
      console.error(`Failed to save canvas state for project ${currentProject}:`, error);
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
      const savedState = localStorage.getItem(getLocalStorageKey(currentProject));
      const parsedState = savedState ? JSON.parse(savedState) : null;
      console.log(`Loaded canvas state for project ${currentProject}:`, parsedState);

      if (parsedState) {
        setLines(parsedState.lines || []);
        setCircles(parsedState.circles || []);
        setCurves(parsedState.curves || []);
        setEllipses(parsedState.ellipses || []);
        setPolygons(parsedState.polygons || []);
        setLayers(parsedState.layers || []);
        setCanvasSize(parsedState.canvasSize || { width: 800, height: 600, backgroundColor: "#ffffff" });
        setSelectedLayerId(parsedState.layers?.[0]?.id || null);
        // If you had a place to use the thumbnail, you would set it here:
        // setThumbnailData(parsedState.thumbnail || null);
      } else {
        console.log(`No saved state found for project: ${currentProject}. Resetting canvas.`);
        resetCanvasState();
      }
    } catch (error) {
      console.error(`Failed to load canvas state for project ${currentProject}:`, error);
      localStorage.removeItem(getLocalStorageKey(currentProject));
      resetCanvasState();
    }
  }, [currentProject, setLines, setCircles, setCurves, setEllipses, setPolygons, setLayers, setCanvasSize, resetCanvasState, setSelectedLayerId]);


  // Effect to save canvas state whenever drawing data or currentProject changes
  useEffect(() => {
    // Debounce the save operation if performance is an issue,
    // but for now, we'll save on every relevant change.
    // A small delay might be beneficial here to avoid saving on every single mouse move
    // if drawing is continuous. For now, we'll keep it direct.
    saveCanvasState();
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
    drawMarkers(ctx);
    drawLines(ctx);
    drawCircles(ctx);
    drawCurves(ctx);
    drawEllipses(ctx);
    drawPolygons(ctx);
    drawPreview(ctx);
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
  ]);

  // Polygon completion effect (unchanged)
  useEffect(() => {
    if (ctx && shape === ShapeMode.Polygon && points.length === 2 && effectiveMousePos) {
      const center = points[0];
      const finalMousePos = points[1];
      const radius = Math.sqrt(
        Math.pow(finalMousePos.x - center.x, 2) + Math.pow(finalMousePos.y - center.y, 2)
      );
      const currentLayerId = selectedLayerId && layers.some(l => l.id === selectedLayerId) ? selectedLayerId : layers[0]?.id || "default-layer-id";

      const polygonPoints = generatePolygonPoints(center, radius, polygonCornerNumber);
      const newPolygon: Polygon = {
        points: polygonPoints,
        layerId: currentLayerId,
        borderColor: "purple",
        backgroundColor: "rgba(128, 0, 128, 0.3)",
      };
      setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
      setPoints([]);
    }
  }, [ctx, shape, points, effectiveMousePos, selectedLayerId, setPolygons, setPoints, polygonCornerNumber, layers]);

  return null;
};

// ... (getBezierBoundingBox function remains unchanged) ...
function getBezierBoundingBox(p0: Point, p1: Point, p2: Point, p3: Point): { minX: number; minY: number; maxX: number; maxY: number } {
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

  const evaluateBezier = (t: number, p0: number, p1: number, p2: number, p3: number) => {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  };

  const xExtrema = bezierExtrema(p0.x, p1.x, p2.x, p3.x);
  const yExtrema = bezierExtrema(p0.y, p1.y, p2.y, p3.y);

  const xValues = [p0.x, p3.x, ...xExtrema.map((t) => evaluateBezier(t, p0.x, p1.x, p2.x, p3.x))];
  const yValues = [p0.y, p3.y, ...yExtrema.map((t) => evaluateBezier(t, p0.y, p1.y, p2.y, p3.y))];

  const minX = Math.min(...xValues);
  const minY = Math.min(...yValues);
  const maxX = Math.max(...xValues);
  const maxY = Math.max(...yValues);

  return { minX, minY, maxX, maxY };
}


export default CanvasDrawing;