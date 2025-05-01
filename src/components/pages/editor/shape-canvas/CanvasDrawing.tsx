// components/Canvas/CanvasDrawing.tsx
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
} from "@/utils/drawing"; // Adjust import path
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(({ start, end, layerId, color }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, lineWidth } = getShapeStyle(layer);
        drawBresenhamLine(
          start.x,
          start.y,
          end.x,
          end.y,
          ctx,
          stroke,
          lineWidth
        );
      }
    });

    circles.forEach(
      ({ center, radius, layerId, borderColor, backgroundColor }) => {
        const layer = layers.find((l) => l.id === layerId);
        if (layer?.is_visible) {
          const { stroke, fill, lineWidth } = getCircleStyle(layer);
          drawCircle(center.x, center.y, radius, ctx, stroke, fill, lineWidth);
        }
      }
    );

    curves.forEach(({ p0, p1, p2, p3, layerId, color }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        const { stroke, lineWidth } = getShapeStyle(layer);
        drawBezierCurve(p0, p1, p2, p3, ctx, stroke, lineWidth);
      }
    });

    ellipses.forEach(
      ({ center, rx, ry, layerId, borderColor, backgroundColor }) => {
        const layer = layers.find((l) => l.id === layerId);
        if (layer?.is_visible) {
          const { stroke, fill, lineWidth } = getEllipseStyle(layer);
          drawEllipseMidpoint(
            center.x,
            center.y,
            rx,
            ry,
            ctx,
            stroke,
            lineWidth
          );
        }
      }
    );

    points.forEach((pt) => drawMarker(pt.x, pt.y, ctx));
    if (points.length > 0 && mousePos) {
      if (shape === ShapeMode.Line && points.length === 1) {
        drawBresenhamLine(
          points[0].x,
          points[0].y,
          mousePos.x,
          mousePos.y,
          ctx,
          previewLineColor
        );
      } else if (shape === ShapeMode.Circle && points.length === 1) {
        const dx = mousePos.x - points[0].x;
        const dy = mousePos.y - points[0].y;
        drawCircle(
          points[0].x,
          points[0].y,
          Math.sqrt(dx * dx + dy * dy),
          ctx,
          previewLineColor
        );
      } else if (shape === ShapeMode.Curve && points.length === 3) {
        drawBezierCurve(
          points[0],
          points[1],
          points[2],
          mousePos,
          ctx,
          previewLineColor
        );
      } else if (shape === ShapeMode.Ellipse && points.length === 1) {
        const dx = Math.abs(mousePos.x - points[0].x);
        const dy = Math.abs(mousePos.y - points[0].y);
        drawEllipseMidpoint(
          points[0].x,
          points[0].y,
          dx,
          dy,
          ctx,
          previewLineColor
        );
      }
    }

    if (tool === Tools.Move) {
      const layer = layers.find((l) => l.id === selectedLayerId);
      if (layer?.is_visible) {
        const selectedObject =
          lines.find((line) => line.layerId === selectedLayerId) ||
          circles.find((circle) => circle.layerId === selectedLayerId) ||
          ellipses.find((ellipse) => ellipse.layerId === selectedLayerId) ||
          curves.find((curve) => curve.layerId === selectedLayerId); // Find the selected object based on the layerId
        if (!selectedObject) return; // If no object is found, exit early

        const { x, y } = mousePos || { x: 0, y: 0 }; // Use mouse position or default to (0, 0)
        drawBoundingBox(100, 100, 200, 200, ctx); // Draw the bounding box around the selected object
      }
    }
  }, [
    points,
    mousePos,
    lines,
    circles,
    curves,
    layers,
    shape,
    ellipses,
    importTimestamp,
  ]);

  return null; // This component doesn't render anything directly
};

export default CanvasDrawing;
