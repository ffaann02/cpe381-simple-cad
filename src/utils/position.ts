import { Circle, Curve, Ellipse, Line, Point } from "@/interface/shape";

export const getShapeCenter = (
    shape: Line | Circle | Ellipse | Curve | undefined,
    type: string
  ): Point => {
    if (!shape) return { x: 0, y: 0 };
    switch (type) {
      case "line":
        return {
          x: (shape.start.x + shape.end.x) / 2,
          y: (shape.start.y + shape.end.y) / 2,
        };
      case "circle":
        return shape.center;
      case "ellipse":
        return shape.center;
      case "curve":
        return shape.p0; // Using p0 as an approximation of the center.  For more precise, calculate the bounding box.
      default:
        return { x: 0, y: 0 };
    }
  };