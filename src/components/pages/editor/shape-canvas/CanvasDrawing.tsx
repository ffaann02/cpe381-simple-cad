import React, { useEffect, useRef } from "react";
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
} from "@/utils/drawing";
import { Point, ShapeMode } from "@/interface/shape";
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
    lines,
    circles,
    curves,
    ellipses,
    layers,
    shape,
    tool,
    selectedLayerId,
  } = useTab();

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const drawMarkers = (ctx: CanvasRenderingContext2D) => {
    points.forEach((pt) => {
      drawMarker(pt.x, pt.y, ctx);
    });
  };

  const drawLines = (ctx: CanvasRenderingContext2D) => {
    lines.forEach(({ start, end, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, lineWidth } = getShapeStyle(layer);
        // const strokeColor = tool === Tools.Eraser && selectedLayerId ? "#FF0000" : stroke;
        const strokeColor = stroke;
        drawBresenhamLine(start.x, start.y, end.x, end.y, ctx, strokeColor, lineWidth);
      }
    });
  };

  const drawCircles = (ctx: CanvasRenderingContext2D) => {
    circles.forEach(({ center, radius, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, fill, lineWidth } = getCircleStyle(layer);
        // const strokeColor = tool === Tools.Eraser && selectedLayerId ? "#FF0000" : stroke;
        const strokeColor = stroke;
        drawCircle(center.x, center.y, radius, ctx, strokeColor, fill, lineWidth);
      }
    });
  };

  const drawCurves = (ctx: CanvasRenderingContext2D) => {
    curves.forEach(({ p0, p1, p2, p3, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, lineWidth } = getShapeStyle(layer);
        // const strokeColor = tool === Tools.Eraser && selectedLayerId ? "#FF0000" : stroke;
        const strokeColor = stroke;
        drawBezierCurve(p0, p1, p2, p3, ctx, strokeColor, lineWidth);
      }
    });
  };

  const drawEllipses = (ctx: CanvasRenderingContext2D) => {
    ellipses.forEach(({ center, rx, ry, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, fill, lineWidth } = getEllipseStyle(layer);
        // const strokeColor = tool === Tools.Eraser && selectedLayerId ? "#FF0000" : stroke;
        const strokeColor = stroke;
        drawEllipseMidpoint(center.x, center.y, rx, ry, ctx, strokeColor, lineWidth);
      }
    });
  };

  const drawPreview = (ctx: CanvasRenderingContext2D) => {
    if (points.length > 0 && mousePos) {
      if (shape === ShapeMode.Line && points.length === 1) {
        drawBresenhamLine(points[0].x, points[0].y, mousePos.x, mousePos.y, ctx, previewLineColor);
      } else if (shape === ShapeMode.Circle && points.length === 1) {
        const dx = mousePos.x - points[0].x;
        const dy = mousePos.y - points[0].y;
        drawCircle(points[0].x, points[0].y, Math.sqrt(dx * dx + dy * dy), ctx, previewLineColor);
      } else if (shape === ShapeMode.Curve && points.length === 3) {
        drawBezierCurve(points[0], points[1], points[2], mousePos, ctx, previewLineColor);
      } else if (shape === ShapeMode.Ellipse && points.length === 1) {
        const dx = Math.abs(mousePos.x - points[0].x);
        const dy = Math.abs(mousePos.y - points[0].y);
        drawEllipseMidpoint(points[0].x, points[0].y, dx, dy, ctx, previewLineColor);
      }
    }
  };

  const drawBoundingBoxForSelected = (ctx: CanvasRenderingContext2D) => {
    if (tool === Tools.Move && selectedLayerId) {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (layer?.is_visible) {
        const selectedObject =
          lines.find((line) => line.layerId === selectedLayerId) ||
          circles.find((circle) => circle.layerId === selectedLayerId) ||
          ellipses.find((ellipse) => ellipse.layerId === selectedLayerId) ||
          curves.find((curve) => curve.layerId === selectedLayerId);

        if (selectedObject) {
          let minX: number | undefined;
          let minY: number | undefined;
          let maxX: number | undefined;
          let maxY: number | undefined;

          if (selectedObject.start && selectedObject.end) {
            minX = Math.min(selectedObject.start.x, selectedObject.end.x);
            minY = Math.min(selectedObject.start.y, selectedObject.end.y);
            maxX = Math.max(selectedObject.start.x, selectedObject.end.x);
            maxY = Math.max(selectedObject.start.y, selectedObject.end.y);
          } else if (selectedObject.center && selectedObject.radius) {
            minX = selectedObject.center.x - selectedObject.radius;
            minY = selectedObject.center.y - selectedObject.radius;
            maxX = selectedObject.center.x + selectedObject.radius;
            maxY = selectedObject.center.y + selectedObject.radius;
          } else if (selectedObject.center && selectedObject.rx && selectedObject.ry) {
            minX = selectedObject.center.x - selectedObject.rx;
            minY = selectedObject.center.y - selectedObject.ry;
            maxX = selectedObject.center.x + selectedObject.rx;
            maxY = selectedObject.center.y + selectedObject.ry;
          } else if (selectedObject.p0 && selectedObject.p3) {
            const { minX: curveMinX, minY: curveMinY, maxX: curveMaxX, maxY: curveMaxY } =
              getBezierBoundingBox(selectedObject.p0, selectedObject.p1, selectedObject.p2, selectedObject.p3);
            minX = curveMinX;
            minY = curveMinY;
            maxX = curveMaxX;
            maxY = curveMaxY;
          }

          if (minX !== undefined && minY !== undefined && maxX !== undefined && maxY !== undefined) {
            drawBoundingBox(minX, minY, maxX - minX, maxY - minY, ctx);
          }
        }
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    clearCanvas(ctx);
    drawMarkers(ctx); // Ensure markers are drawn
    drawLines(ctx);
    drawCircles(ctx);
    drawCurves(ctx);
    drawEllipses(ctx);
    drawPreview(ctx);
    drawBoundingBoxForSelected(ctx);
  }, [points, mousePos, lines, circles, curves, ellipses, layers, shape, tool, selectedLayerId, importTimestamp]);

  return null; // This component doesn't render anything directly
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