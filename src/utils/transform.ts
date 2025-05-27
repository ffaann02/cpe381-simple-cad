import { Point } from "@/interface/shape";

export const rotatePoint = (
    point: Point,
    center: Point,
    angleRad: number
): Point => {
    const s = Math.sin(angleRad);
    const c = Math.cos(angleRad);

    const px = point.x - center.x;
    const py = point.y - center.y;

    const newX = px * c + py * s;
    const newY = -px * s + py * c;

    return { x: Math.round(newX + center.x), y: Math.round(newY + center.y) };
};

export const flipPoint = (
    point: Point,
    axis: "horizontal" | "vertical",
    center: Point
): Point => {
    if (axis === "horizontal") {
        return { x: 2 * center.x - point.x, y: point.y };
    } else {
        return { x: point.x, y: 2 * center.y - point.y };
    }
};
