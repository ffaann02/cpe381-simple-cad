import { Circle, Curve, Ellipse, Line, Point, Polygon } from "@/interface/shape";

export const getShapeCenter = (
    shape: Line | Circle | Ellipse | Curve | Polygon | undefined,
    type: string
  ): Point => {
    if (!shape) return { x: 0, y: 0 };
    switch (type) {
      case "line":
        const lineShape = shape as Line;
        return {
          x: (lineShape.start.x + lineShape.end.x) / 2,
          y: (lineShape.start.y + lineShape.end.y) / 2,
        };
      case "circle":
        const circleShape = shape as Circle;
        return circleShape.center;
      case "ellipse":
        const ellipseShape = shape as Ellipse;
        return ellipseShape.center;
      case "curve":
        const curveShape = shape as Curve;
        return curveShape.p0;
      case "polygon":
        const polygonShape = shape as Polygon;
        if (polygonShape.points.length === 0) return { x: 0, y: 0 };
        const sumX = polygonShape.points.reduce((sum, point) => sum + point.x, 0);
        const sumY = polygonShape.points.reduce((sum, point) => sum + point.y, 0);
        return {
          x: sumX / polygonShape.points.length,
          y: sumY / polygonShape.points.length,
        };
      default:
        return { x: 0, y: 0 };
    }
  };