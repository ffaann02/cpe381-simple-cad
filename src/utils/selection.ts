// utils/selection.ts (or components/Canvas/selection.ts)
import { Point, Line, Circle, Curve, Ellipse } from "@/interface/shape";
import { Layer } from "@/interface/tab";

const SELECT_THRESHOLD = 5; // Distance threshold for selecting shapes in pixels

export const distanceToLine = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

export const isPointInCircle = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number
): boolean => {
  const dx = x - cx;
  const dy = y - cy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return Math.abs(distance - radius) < SELECT_THRESHOLD;
};

export const isPointInEllipse = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean => {
  // Check if the point is close to the ellipse border
  const normalized_x = (x - cx) / rx;
  const normalized_y = (y - cy) / ry;
  const distance = Math.abs(
    normalized_x * normalized_x + normalized_y * normalized_y - 1
  );
  return distance < 0.1; // Threshold for being close to the ellipse
};

export const isPointOnCurve = (
  x: number,
  y: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point
): boolean => {
  // Sample multiple points along the curve and check distance to each segment
  const numSamples = 20;
  let prevX = p0.x;
  let prevY = p0.y;

  for (let i = 1; i <= numSamples; i++) {
    const t = i / numSamples;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    // Bezier curve formula
    const currX =
      mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
    const currY =
      mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

    // Check distance to this segment
    if (distanceToLine(x, y, prevX, prevY, currX, currY) < SELECT_THRESHOLD) {
      return true;
    }

    prevX = currX;
    prevY = currY;
  }

  return false;
};

export const findShapeAtPoint = (
  x: number,
  y: number,
  lines: Line[],
  circles: Circle[],
  ellipses: Ellipse[],
  curves: Curve[],
  layers: Layer[]
): {
  layerId: string | null;
  index: number | null;
  type: "line" | "circle" | "ellipse" | "curve" | null;
} => {
  // Check lines first
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const layer = layers.find((l) => l.id === line.layerId);
    if (
      layer?.is_visible &&
      distanceToLine(
        x,
        y,
        line.start.x,
        line.start.y,
        line.end.x,
        line.end.y
      ) < SELECT_THRESHOLD
    ) {
      return { layerId: line.layerId, index: i, type: "line" };
    }
  }

  // Check circles
  for (let i = circles.length - 1; i >= 0; i--) {
    const circle = circles[i];
    const layer = layers.find((l) => l.id === circle.layerId);
    if (
      layer?.is_visible &&
      isPointInCircle(x, y, circle.center.x, circle.center.y, circle.radius)
    ) {
      return { layerId: circle.layerId, index: i, type: "circle" };
    }
  }

  // Check ellipses
  for (let i = ellipses.length - 1; i >= 0; i--) {
    const ellipse = ellipses[i];
    const layer = layers.find((l) => l.id === ellipse.layerId);
    if (
      layer?.is_visible &&
      isPointInEllipse(
        x,
        y,
        ellipse.center.x,
        ellipse.center.y,
        ellipse.rx,
        ellipse.ry
      )
    ) {
      return { layerId: ellipse.layerId, index: i, type: "ellipse" };
    }
  }

  // Check curves
  for (let i = curves.length - 1; i >= 0; i--) {
    const curve = curves[i];
    const layer = layers.find((l) => l.id === curve.layerId);
    if (
      layer?.is_visible &&
      isPointOnCurve(x, y, curve.p0, curve.p1, curve.p2, curve.p3)
    ) {
      return { layerId: curve.layerId, index: i, type: "curve" };
    }
  }

  return { layerId: null, index: null, type: null };
};