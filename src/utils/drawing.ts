// utils/drawing.ts (or components/Canvas/drawing.ts)
import { Point } from "@/interface/shape";
import { Layer } from "@/interface/tab";

const SELECTION_COLOR = "#3D90D7"; // Color for the selected shape

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
  // Number of points to calculate along the curve
  const steps = 100;
  
  // Function to calculate a point on the Bezier curve using de Casteljau's algorithm
  const calculateBezierPoint = (t: number): Point => {
    const mt = 1 - t;
    const x = mt * mt * mt * p0.x + 
              3 * mt * mt * t * p1.x + 
              3 * mt * t * t * p2.x + 
              t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 
              3 * mt * mt * t * p1.y + 
              3 * mt * t * t * p2.y + 
              t * t * t * p3.y;
    return { x, y };
  };

  // Calculate points along the curve
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(calculateBezierPoint(t));
  }

  // Draw lines between consecutive points
  for (let i = 0; i < points.length - 1; i++) {
    drawBresenhamLine(
      Math.round(points[i].x),
      Math.round(points[i].y),
      Math.round(points[i + 1].x),
      Math.round(points[i + 1].y),
      ctx,
      color,
      width
    );
  }
};

export const drawEllipseMidpoint = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  ctx: CanvasRenderingContext2D,
  color = "black",
  width = 1,
  fillColor = ""
) => {
  // Round center coordinates and radii for midpoint algorithm
  const x = Math.round(cx);
  const y = Math.round(cy);
  const rx1 = Math.round(rx);
  const ry1 = Math.round(ry);

  // Fill the ellipse if fill color is provided
  if (fillColor) {
    ctx.fillStyle = fillColor;
    let x1 = 0;
    let y1 = ry1;
    const rxSq = rx1 * rx1;
    const rySq = ry1 * ry1;
    let dx = 2 * rySq * x1;
    let dy = 2 * rxSq * y1;
    let d1 = rySq - rxSq * ry1 + 0.25 * rxSq;

    // First region
    while (dx < dy) {
      // Fill horizontal lines for each quadrant
      for (let i = -x1; i <= x1; i++) {
        ctx.fillRect(x + i, y + y1, 1, 1);
        ctx.fillRect(x + i, y - y1, 1, 1);
      }
      if (d1 < 0) {
        x1++;
        dx += 2 * rySq;
        d1 += dx + rySq;
      } else {
        x1++;
        y1--;
        dx += 2 * rySq;
        dy -= 2 * rxSq;
        d1 += dx - dy + rySq;
      }
    }

    // Second region
    let d2 = rySq * (x1 + 0.5) * (x1 + 0.5) + rxSq * (y1 - 1) * (y1 - 1) - rxSq * rySq;
    while (y1 >= 0) {
      // Fill horizontal lines for each quadrant
      for (let i = -x1; i <= x1; i++) {
        ctx.fillRect(x + i, y + y1, 1, 1);
        ctx.fillRect(x + i, y - y1, 1, 1);
      }
      if (d2 > 0) {
        y1--;
        dy -= 2 * rxSq;
        d2 += rxSq - dy;
      } else {
        y1--;
        x1++;
        dx += 2 * rySq;
        dy -= 2 * rxSq;
        d2 += dx - dy + rxSq;
      }
    }
  }

  // Draw the border using midpoint algorithm
  ctx.fillStyle = color;
  let x1 = 0;
  let y1 = ry1;
  const rxSq = rx1 * rx1;
  const rySq = ry1 * ry1;
  let dx = 2 * rySq * x1;
  let dy = 2 * rxSq * y1;
  let d1 = rySq - rxSq * ry1 + 0.25 * rxSq;

  const plotPoints = (x1: number, y1: number) => {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width; j++) {
        ctx.fillRect(x + x1 + i, y + y1 + j, 1, 1);
        ctx.fillRect(x - x1 + i, y + y1 + j, 1, 1);
        ctx.fillRect(x + x1 + i, y - y1 + j, 1, 1);
        ctx.fillRect(x - x1 + i, y - y1 + j, 1, 1);
      }
    }
  };

  // First region
  while (dx < dy) {
    plotPoints(x1, y1);
    if (d1 < 0) {
      x1++;
      dx += 2 * rySq;
      d1 += dx + rySq;
    } else {
      x1++;
      y1--;
      dx += 2 * rySq;
      dy -= 2 * rxSq;
      d1 += dx - dy + rySq;
    }
  }

  // Second region
  let d2 = rySq * (x1 + 0.5) * (x1 + 0.5) + rxSq * (y1 - 1) * (y1 - 1) - rxSq * rySq;
  while (y1 >= 0) {
    plotPoints(x1, y1);
    if (d2 > 0) {
      y1--;
      dy -= 2 * rxSq;
      d2 += rxSq - dy;
    } else {
      y1--;
      x1++;
      dx += 2 * rySq;
      dy -= 2 * rxSq;
      d2 += dx - dy + rxSq;
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
  const stroke = isSelected ? SELECTION_COLOR : (layer?.borderColor || "black");
  const fill = layer?.backgroundColor || "";
  const lineWidth = layer?.thickness || 1;
  return { stroke, fill, lineWidth };
};

export const getCircleStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = isSelected ? SELECTION_COLOR : layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = layer?.thickness || 1;
  return { stroke, fill, lineWidth };
};

export const getEllipseStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = isSelected ? SELECTION_COLOR : layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = layer?.thickness || 1;
  return { stroke, fill, lineWidth };
};

export const getPolygonStyle = (layer: Layer | undefined): { stroke: string; fill: string; lineWidth: number } => {
  const isSelected = layer?.is_selected;
  const stroke = isSelected ? SELECTION_COLOR : layer?.borderColor || "black";
  const fill = layer?.backgroundColor || "";
  const lineWidth = layer?.thickness || 1;
  return { stroke, fill, lineWidth };
};

export function drawBoundingBox(
  x: number,
  y: number,
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D,
  color: string = "blue",
  lineWidth: number = 1,
  drawHandles: boolean = true
) {
  ctx.save();

  // Draw dashed bounding box
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([4, 2]);
  ctx.strokeRect(x, y, width, height);

  // Draw 9 white square handles with blue borders, only if drawHandles is true
  if (drawHandles) {
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
  }
  else{
      // Draw a solid circle for the center handle when handles are not drawn
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const radius = 4; // Half the size of the square handle
      // Use the selection color for the solid circle
      drawCircle(centerX, centerY, radius, ctx, color, "white", 1);

  }

  ctx.restore();
}

export function getBezierBoundingBox(
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
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
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

  