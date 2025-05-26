import React, { useEffect, useRef, useState } from "react";
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
  drawPolygon, // Import drawPolygon
} from "@/utils/drawing";
import { Point, ShapeMode, Polygon } from "@/interface/shape"; // Import Polygon type
import { Tools } from "@/interface/tool";

const previewLineColor = "#D4C9BE";

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
    setPoints, // Assuming you have a setPoints function
    lines,
    circles,
    curves,
    ellipses,
    polygons,
    setPolygons,
    layers,
    shape,
    tool,
    selectedLayerId,
    snapEnabled,
    showGrid,
    polygonCornerNumber
  } = useTab();

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
  const [previewPolygonPoints, setPreviewPolygonPoints] = useState<Point[]>([]);
  const [numPolygonCorners, setNumPolygonCorners] = useState<number>(5); // Default number of corners

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
    polygons.forEach(({ points: polygonPoints, layerId, borderColor, backgroundColor, borderRadius }) => {
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
        const numSides = polygonCornerNumber; // Use the number of corners from the state
        const previewPoints = generatePolygonPoints(center, radius, numSides);
        if (previewPoints.length > 0) {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              drawPolygon(previewPoints, ctx, previewLineColor, "transparent"); // Use the same drawColor
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

          if ("start" in selectedObject && "end" in selectedObject) {
            minX = Math.min(selectedObject.start.x, selectedObject.end.x);
            minY = Math.min(selectedObject.start.y, selectedObject.end.y);
            maxX = Math.max(selectedObject.start.x, selectedObject.end.x);
            maxY = Math.max(selectedObject.start.y, selectedObject.end.y);
          } else if ("center" in selectedObject && "radius" in selectedObject) {
            minX = selectedObject.center.x - selectedObject.radius;
            minY = selectedObject.center.y - selectedObject.radius;
            maxX = selectedObject.center.x + selectedObject.radius;
            maxY = selectedObject.center.y + selectedObject.radius;
          } else if ("center" in selectedObject && "rx" in selectedObject && "ry" in selectedObject) {
            minX = selectedObject.center.x - selectedObject.rx;
            minY = selectedObject.center.y - selectedObject.ry;
            maxX = selectedObject.center.x + selectedObject.rx;
            maxY = selectedObject.center.y + selectedObject.ry;
          } else if ("p0" in selectedObject && "p3" in selectedObject) {
            const { minX: curveMinX, minY: curveMinY, maxX: curveMaxX, maxY: curveMaxY } =
              getBezierBoundingBox(selectedObject.p0, selectedObject.p1, selectedObject.p2, selectedObject.p3);
            minX = curveMinX;
            minY = curveMinY;
            maxX = curveMaxX;
            maxY = curveMaxY;
          } else if ("points" in selectedObject && selectedObject.points.length > 0) {
            selectedObject.points.forEach((p) => {
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

  useEffect(() => {
    if (!ctx) return;
    clearCanvas(ctx);
    drawMarkers(ctx);
    drawLines(ctx);
    drawCircles(ctx);
    drawCurves(ctx);
    drawEllipses(ctx);
    drawPolygons(ctx);
    drawPreview(ctx);
    drawBoundingBoxForSelected(ctx);
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
    numPolygonCorners, // Re-render when the number of corners changes for preview
  ]);

  // Function to handle drawing the polygon after the second click
  useEffect(() => {
    if (ctx && shape === ShapeMode.Polygon && points.length === 2 && effectiveMousePos) {
      const center = points[0];
      const finalMousePos = points[1]; // The second clicked point determines the radius
      const radius = Math.sqrt(
        Math.pow(finalMousePos.x - center.x, 2) + Math.pow(finalMousePos.y - center.y, 2)
      );
      const currentLayerId = selectedLayerId || "default-layer-id";
      const polygonPoints = generatePolygonPoints(center, radius, numPolygonCorners);
      const newPolygon: Polygon = {
        points: polygonPoints,
        layerId: currentLayerId,
        borderColor: "purple",
        backgroundColor: "rgba(128, 0, 128, 0.3)",
      };
      setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
      setPoints([]); // Reset points after drawing the polygon
    }
  }, [ctx, shape, points, effectiveMousePos, selectedLayerId, setPolygons, setPoints, numPolygonCorners]);

  // You might need a UI element to control the number of polygon corners
  // For example, an input field that updates the `numPolygonCorners` state.
  // <input
  //   type="number"
  //   value={numPolygonCorners}
  //   onChange={(e) => setNumPolygonCorners(parseInt(e.target.value) || 3)}
  //   min="3"
  // />

  return null;
};

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