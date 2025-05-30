import { Point } from "@/interface/shape";
import { getBezierBoundingBox } from "@/utils/drawing";

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

export const scaleShape = (shape: any, shapeType: string, handleName: string, delta: Point, origin: Point): any => {
    // Create a deep copy of the shape to avoid mutating the original
    const scaledShape = JSON.parse(JSON.stringify(shape));

    // Get initial dimensions or relevant properties for scaling reference
    let initialWidth = 0;
    let initialHeight = 0;
    let initialRadius = 0;
    let initialRx = 0;
    let initialRy = 0;

    switch (shapeType) {
        case 'line':
            initialWidth = Math.abs(shape.end.x - shape.start.x);
            initialHeight = Math.abs(shape.end.y - shape.start.y);
            break;
        case 'circle':
            initialRadius = shape.radius;
            initialWidth = initialRadius * 2; // Use diameter as width for consistent calculation
            initialHeight = initialRadius * 2; // Use diameter as height
            break;
        case 'ellipse':
            initialRx = shape.rx;
            initialRy = shape.ry;
            initialWidth = initialRx * 2;
            initialHeight = initialRy * 2;
            break;
        case 'polygon':
        case 'curve':
            // For complex shapes, calculate bounding box to get dimensions
            let minX, minY, maxX, maxY;
            if (shapeType === 'polygon' && shape.points.length > 0) {
                 minX = shape.points[0].x;
                 minY = shape.points[0].y;
                 maxX = shape.points[0].x;
                 maxY = shape.points[0].y;
                 shape.points.forEach((p: Point) => {
                   minX = Math.min(minX!, p.x);
                   minY = Math.min(minY!, p.y);
                   maxX = Math.max(maxX!, p.x);
                   maxY = Math.max(maxY!, p.y);
                 });
            } else if (shapeType === 'curve') {
                 const bbox = getBezierBoundingBox(shape.p0, shape.p1, shape.p2, shape.p3);
                 minX = bbox.minX;
                 minY = bbox.minY;
                 maxX = bbox.maxX;
                 maxY = bbox.maxY;
            }
             initialWidth = maxX !== undefined && minX !== undefined ? maxX - minX : 1; // Avoid division by zero
             initialHeight = maxY !== undefined && minY !== undefined ? maxY - minY : 1; // Avoid division by zero
            break;
    }

    // Calculate scale factors based on the handle being dragged and initial dimensions
    let scaleX = 1;
    let scaleY = 1;

    // Determine which handle is being dragged and calculate appropriate scale factors
    switch (handleName) {
        case 'tl': // top-left
            scaleX = (initialWidth - delta.x) / initialWidth;
            scaleY = (initialHeight - delta.y) / initialHeight;
            break;
        case 'tr': // top-right
            scaleX = (initialWidth + delta.x) / initialWidth;
            scaleY = (initialHeight - delta.y) / initialHeight;
            break;
        case 'bl': // bottom-left
            scaleX = (initialWidth - delta.x) / initialWidth;
            scaleY = (initialHeight + delta.y) / initialHeight;
            break;
        case 'br': // bottom-right
            scaleX = (initialWidth + delta.x) / initialWidth;
            scaleY = (initialHeight + delta.y) / initialHeight;
            break;
        case 'tc': // top-center
            scaleY = (initialHeight - delta.y) / initialHeight;
            break;
        case 'bc': // bottom-center
            scaleY = (initialHeight + delta.y) / initialHeight;
            break;
        case 'ml': // middle-left
            scaleX = (initialWidth - delta.x) / initialWidth;
            break;
        case 'mr': // middle-right
            scaleX = (initialWidth + delta.x) / initialWidth;
            break;
    }

    // Ensure minimum scale to prevent shape from disappearing
    scaleX = Math.max(0.01, scaleX);
    scaleY = Math.max(0.01, scaleY);

    // Apply scaling based on shape type
    switch (shapeType) {
        case 'line':
            // Scale line endpoints relative to origin
            scaledShape.start = {
                x: Math.round(origin.x + (shape.start.x - origin.x) * scaleX),
                y: Math.round(origin.y + (shape.start.y - origin.y) * scaleY)
            };
            scaledShape.end = {
                x: Math.round(origin.x + (shape.end.x - origin.x) * scaleX),
                y: Math.round(origin.y + (shape.end.y - origin.y) * scaleY)
            };
            break;

        case 'circle':
            // Scale circle radius uniformly
            scaledShape.radius = Math.round(initialRadius * Math.max(scaleX, scaleY));
            break;

        case 'ellipse':
            // Scale ellipse radii independently
            scaledShape.rx = Math.round(initialRx * scaleX);
            scaledShape.ry = Math.round(initialRy * scaleY);
            break;

        case 'curve':
            // Scale all control points of the Bezier curve relative to origin
            scaledShape.p0 = {
                x: Math.round(origin.x + (shape.p0.x - origin.x) * scaleX),
                y: Math.round(origin.y + (shape.p0.y - origin.y) * scaleY)
            };
            scaledShape.p1 = {
                x: Math.round(origin.x + (shape.p1.x - origin.x) * scaleX),
                y: Math.round(origin.y + (shape.p1.y - origin.y) * scaleY)
            };
            scaledShape.p2 = {
                x: Math.round(origin.x + (shape.p2.x - origin.x) * scaleX),
                y: Math.round(origin.y + (shape.p2.y - origin.y) * scaleY)
            };
            scaledShape.p3 = {
                x: Math.round(origin.x + (shape.p3.x - origin.x) * scaleX),
                y: Math.round(origin.y + (shape.p3.y - origin.y) * scaleY)
            };
            break;

        case 'polygon':
            // Scale all points of the polygon relative to origin
            scaledShape.points = shape.points.map((point: Point) => ({
                x: Math.round(origin.x + (point.x - origin.x) * scaleX),
                y: Math.round(origin.y + (point.y - origin.y) * scaleY)
            }));
            break;
    }

    return scaledShape;
};

// Helper function to determine the scaling origin point based on the handle being dragged
export const getScalingOrigin = (shape: any, shapeType: string, handleName: string): Point => {
    // Calculate bounding box to find corners for origin
     let minX, minY, maxX, maxY;
            if (shapeType === 'line') {
                minX = Math.min(shape.start.x, shape.end.x);
                minY = Math.min(shape.start.y, shape.end.y);
                maxX = Math.max(shape.start.x, shape.end.x);
                maxY = Math.max(shape.start.y, shape.end.y);
            } else if (shapeType === 'circle') {
                minX = shape.center.x - shape.radius;
                minY = shape.center.y - shape.radius;
                maxX = shape.center.x + shape.radius;
                maxY = shape.center.y + shape.radius;
            } else if (shapeType === 'ellipse') {
                minX = shape.center.x - shape.rx;
                minY = shape.center.y - shape.ry;
                maxX = shape.center.x + shape.rx;
                maxY = shape.center.y + shape.ry;
            } else if (shapeType === 'curve') {
                const bbox = getBezierBoundingBox(shape.p0, shape.p1, shape.p2, shape.p3);
                 minX = bbox.minX;
                 minY = bbox.minY;
                 maxX = bbox.maxX;
                 maxY = bbox.maxY;
            } else if (shapeType === 'polygon' && shape.points.length > 0) {
                minX = shape.points[0].x;
                minY = shape.points[0].y;
                maxX = shape.points[0].x;
                maxY = shape.points[0].y;
                shape.points.forEach((p: Point) => {
                  minX = Math.min(minX!, p.x);
                  minY = Math.min(minY!, p.y);
                  maxX = Math.max(maxX!, p.x);
                  maxY = Math.max(maxY!, p.y);
                });
            }

    // For most shapes, we'll use the opposite corner or edge point of the handle being dragged as the origin
    switch (handleName) {
        case 'tl': return { x: maxX, y: maxY }; // top-left -> use bottom-right as origin
        case 'tr': return { x: minX, y: maxY }; // top-right -> use bottom-left as origin
        case 'bl': return { x: maxX, y: minY }; // bottom-left -> use top-right as origin
        case 'br': return { x: minX, y: minY }; // bottom-right -> use top-left as origin
        case 'tc': return { x: (minX + maxX) / 2, y: maxY }; // top-center -> use bottom-center as origin
        case 'bc': return { x: (minX + maxX) / 2, y: minY }; // bottom-center -> use top-center as origin
        case 'ml': return { x: maxX, y: (minY + maxY) / 2 }; // middle-left -> use middle-right as origin
        case 'mr': return { x: minX, y: (minY + maxY) / 2 }; // middle-right -> use middle-left as origin
        default:
            // Default to shape's center if no specific origin is determined
             return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }
};
