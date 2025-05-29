// utils/drawing.ts (or components/Canvas/drawing.ts)
import { Point, Line, Circle, Curve, Ellipse, Polygon } from "@/interface/shape";
import { Layer } from "@/interface/tab";

const previewLineColor = "#D4C9BE";
const SELECTION_COLOR = "#3D90D7"; // Color for the selected shape
const DELETE_COLOR = "#FF0000"; // Color for the delete shape
const SELECTION_WIDTH_MULTIPLIER = 2; // Multiplier for the width of the selected shape

export const drawMarker = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fill();
};

export const drawBresenhamLine = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  ctx: CanvasRenderingContext2D,
  color = "black",
  width = 1
) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  while (true) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width; j++) {
        ctx.fillRect(x + i, y + j, 1, 1);
      }
    }
    if (x === x1 && y === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
};

export const drawCircle = (
  cx: number,
  cy: number,
  radius: number,
  ctx: CanvasRenderingContext2D,
  strokeColor = "black",
  fillColor = "",
  width = 1
) => {
  // Round center coordinates and radius for midpoint algorithm
  const x = Math.round(cx);
  const y = Math.round(cy);
  const r = Math.round(radius);

  // Fill the circle if fill color is provided
  if (fillColor) {
    ctx.fillStyle = fillColor;
    // Use midpoint algorithm for filling
    let x1 = 0;
    let y1 = r;
    let d = 1 - r;
    
    while (x1 <= y1) {
      // Fill horizontal lines for each octant
      for (let i = -x1; i <= x1; i++) {
        ctx.fillRect(x + i, y + y1, 1, 1);
        ctx.fillRect(x + i, y - y1, 1, 1);
      }
      for (let i = -y1; i <= y1; i++) {
        ctx.fillRect(x + i, y + x1, 1, 1);
        ctx.fillRect(x + i, y - x1, 1, 1);
      }
      
      if (d < 0) {
        d += 2 * x1 + 3;
      } else {
        d += 2 * (x1 - y1) + 5;
        y1--;
      }
      x1++;
    }
  }

  // Draw the border using midpoint algorithm
  ctx.fillStyle = strokeColor;
  let x1 = 0;
  let y1 = r;
  let d = 1 - r;
  
  const plotPoints = (x1: number, y1: number) => {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width; j++) {
        ctx.fillRect(x + x1 + i, y + y1 + j, 1, 1);
        ctx.fillRect(x - x1 + i, y + y1 + j, 1, 1);
        ctx.fillRect(x + x1 + i, y - y1 + j, 1, 1);
        ctx.fillRect(x - x1 + i, y - y1 + j, 1, 1);
        ctx.fillRect(x + y1 + i, y + x1 + j, 1, 1);
        ctx.fillRect(x - y1 + i, y + x1 + j, 1, 1);
        ctx.fillRect(x + y1 + i, y - x1 + j, 1, 1);
        ctx.fillRect(x - y1 + i, y - x1 + j, 1, 1);
      }
    }
  };

  while (x1 <= y1) {
    plotPoints(x1, y1);
    if (d < 0) {
      d += 2 * x1 + 3;
    } else {
      d += 2 * (x1 - y1) + 5;
      y1--;
    }
    x1++;
  }
};

export const drawBezierCurve = (
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  ctx: CanvasRenderingContext2D,
  color = "black",
  width = 1
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.stroke();
  ctx.lineWidth = 1; // Reset line width
};

export const drawEllipseMidpoint = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ctx: CanvasRenderingContext2D,
  color = "black",
  width = 1
) => {
  ctx.fillStyle = color;
  const points: Point[] = []; // Store points to draw later
  let x = 0;
  let y = ry;
  const rxSq = rx * rx;
  const rySq = ry * ry;
  let dx = 2 * rySq * x;
  let dy = 2 * rxSq * y;
  let d1 = rySq - rxSq * ry + 0.25 * rxSq;
  while (dx < dy) {
    points.push({ x: cx + x, y: cy + y });
    points.push({ x: cx - x, y: cy + y });
    points.push({ x: cx + x, y: cy - y });
    points.push({ x: cx - x, y: cy - y });
    if (d1 < 0) {
      x++;
      dx += 2 * rySq;
      d1 += dx + rySq;
    } else {
      x++;
      y--;
      dx += 2 * rySq;
      dy -= 2 * rxSq;
      d1 += dx - dy + rySq;
    }
  }
  let d2 =
    rySq * (x + 0.5) * (x + 0.5) + rxSq * (y - 1) * (y - 1) - rxSq * rySq;
  while (y >= 0) {
    points.push({ x: cx + x, y: cy + y });
    points.push({ x: cx - x, y: cy + y });
    points.push({ x: cx + x, y: cy - y });
    points.push({ x: cx - x, y: cy - y });
    if (d2 > 0) {
      y--;
      dy -= 2 * rxSq;
      d2 += rxSq - dy;
    } else {
      y--;
      x++;
      dx += 2 * rySq;
      dy -= 2 * rxSq;
      d2 += dx - dy + rxSq;
    }
  }

  // Draw the points with the specified width
  for (const p of points) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width; j++) {
        ctx.fillRect(p.x + i, p.y + j, 1, 1);
      }
    }
  }
};

export const drawPolygon = (
  points: Point[],
  ctx: CanvasRenderingContext2D,
  borderColor?: string,
  backgroundColor?: string,
  lineWidth: number = 1
) => {
  if (points.length < 2) return;

  // Fill the polygon if background color is provided
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Draw the border using Bresenham's line algorithm
  for (let i = 0; i < points.length; i++) {
    const start = points[i];
    const end = points[(i + 1) % points.length]; // Connect back to first point
    // Round coordinates for Bresenham algorithm
    drawBresenhamLine(
      Math.round(start.x),
      Math.round(start.y),
      Math.round(end.x),
      Math.round(end.y),
      ctx,
      borderColor || "black",
      lineWidth
    );
  }
};

export const getShapeStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = isSelected ? SELECTION_WIDTH_MULTIPLIER : 1;
  return { stroke, fill, lineWidth };
};

export const getCircleStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = isSelected ? SELECTION_COLOR : layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = isSelected ? SELECTION_WIDTH_MULTIPLIER : 1;
  return { stroke, fill, lineWidth };
};

export const getEllipseStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = isSelected ? SELECTION_COLOR : layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = isSelected ? SELECTION_WIDTH_MULTIPLIER : 1;
  return { stroke, fill, lineWidth };
};

export const getPolygonStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = isSelected ? SELECTION_COLOR : layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = isSelected ? SELECTION_WIDTH_MULTIPLIER : 1;
  return { stroke, fill, lineWidth };
};

export function drawBoundingBox(
  x: number,
  y: number,
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  color: string = "blue",
  lineWidth: number = 1
) {
  ctx.save();

  // Draw dashed bounding box
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([4, 2]);
  ctx.strokeRect(x, y, width, height);

  // Draw 9 white square handles with blue borders
  const handleSize = 8;
  const half = handleSize / 2;

  const points = [
    [x, y], // top-left
    [x + width / 2, y], // top-center
    [x + width, y], // top-right
    [x, y + height / 2], // middle-left
    [x + width / 2, y + height / 2], // center
    [x + width, y + height / 2], // middle-right
    [x, y + height], // bottom-left
    [x + width / 2, y + height], // bottom-center
    [x + width, y + height], // bottom-right
  ];

  ctx.setLineDash([]); // Solid lines for handles
  points.forEach(([px, py]) => {
    ctx.fillStyle = "white";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.fillRect(px - half, py - half, handleSize, handleSize);
    ctx.strokeRect(px - half, py - half, handleSize, handleSize);
  });

  ctx.restore();
}

const drawPolygons = (
  context: CanvasRenderingContext2D,
  polygons: Polygon[],
  layers: Layer[]
) => {
  polygons.forEach(({ points: polygonPoints, layerId, borderColor, backgroundColor }) => {
    const layer = layers.find((l) => l.id === layerId);
    if (layer?.is_visible && polygonPoints.length > 1) {
      const { stroke, fill, lineWidth } = getShapeStyle(layer);
      drawPolygon(polygonPoints, context, stroke, fill, lineWidth);
    }
  });
};

  