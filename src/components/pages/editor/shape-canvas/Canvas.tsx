import React, { useEffect, useRef, useState } from "react";
import { useTab } from "@/context/AppContext";
import { Layer } from "@/interface/tab";
import { v4 as uuidv4 } from "uuid";
import {
    Circle,
    Curve,
    Ellipse,
    Line,
    Point,
    ShapeMode,
} from "@/interface/shape";
import { Tools } from "@/interface/tool";
import { FaPen } from "react-icons/fa6";
import { LuMousePointer2 } from "react-icons/lu";
import { PiSelectionBold } from "react-icons/pi";
import { MdOutlineOpenWith, MdRotate90DegreesCcw } from "react-icons/md";
import { FaFillDrip, FaEraser, FaUndo, FaRedo } from "react-icons/fa";

const previewLineColor = "#D4C9BE";

const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const {
        canvasSize,
        layers,
        setLayers,
        shape,
        setSelectedLayerId,
        tool,
        setTool
    } = useTab();
    const [mousePos, setMousePos] = useState<Point | null>(null);
    const {
        points,
        setPoints,
        lines,
        setLines,
        circles,
        setCircles,
        curves,
        setCurves,
        ellipses,
        setEllipses,
    } = useTab();

    const [drawColor, setDrawColor] = useState<string>("black"); // For drawing shapes
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null); // For selecting shapes
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoverStart, setHoverStart] = useState<Point | null>(null); // For hover selection
    const [hoverEnd, setHoverEnd] = useState<Point | null>(null);
    const [erasedShapeIds, setErasedShapeIds] = useState<string[]>([]); // For eraser


    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const parent = canvas.parentElement;
            canvas.width = parent?.clientWidth || 800;
            canvas.height = parent?.clientHeight || 600;
        }
    }, []);

    const drawMarker = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    };

    const drawBresenhamLine = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        ctx: CanvasRenderingContext2D,
        color = "black"
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
            ctx.fillRect(x, y, 1, 1);
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

    const drawCircle = (
        cx: number,
        cy: number,
        radius: number,
        ctx: CanvasRenderingContext2D,
        strokeColor = "black",
        fillColor = ""
    ) => {
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        ctx.stroke();
    };

    const drawBezierCurve = (
        p0: Point,
        p1: Point,
        p2: Point,
        p3: Point,
        ctx: CanvasRenderingContext2D,
        color = "black"
    ) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
    };

    const drawEllipseMidpoint = (
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        ctx: CanvasRenderingContext2D,
        color = "black"
    ) => {
        ctx.fillStyle = color;
        let x = 0;
        let y = ry;
        const rxSq = rx * rx;
        const rySq = ry * ry;
        let dx = 2 * rySq * x;
        let dy = 2 * rxSq * y;
        let d1 = rySq - rxSq * ry + 0.25 * rxSq;

        while (dx < dy) {
            ctx.fillRect(cx + x, cy + y, 1, 1);
            ctx.fillRect(cx - x, cy + y, 1, 1);
            ctx.fillRect(cx + x, cy - y, 1, 1);
            ctx.fillRect(cx - x, cy - y, 1, 1);
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

        let d2 = rySq * (x + 0.5) * (x + 0.5) + rxSq * (y - 1) * (y - 1) - rxSq * rySq;
        while (y >= 0) {
            ctx.fillRect(cx + x, cy + y, 1, 1);
            ctx.fillRect(cx - x, cy + y, 1, 1);
            ctx.fillRect(cx + x, cy - y, 1, 1);
            ctx.fillRect(cx - x, cy - y, 1, 1);
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
    };

    const drawHoverSelection = (ctx: CanvasRenderingContext2D) => {
        if (hoverStart && hoverEnd) {
            const width = hoverEnd.x - hoverStart.x;
            const height = hoverEnd.y - hoverStart.y;
            ctx.strokeStyle = "rgba(0, 128, 255, 0.7)"; // Blue with opacity
            ctx.fillStyle = "rgba(0, 128, 255, 0.3)";     // Light blue fill
            ctx.lineWidth = 2;
            ctx.fillRect(hoverStart.x, hoverStart.y, width, height);
            ctx.strokeRect(hoverStart.x, hoverStart.y, width, height);
            ctx.lineWidth = 1; //reset
        }
    };

    const redraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw shapes, excluding erased ones
        lines.filter(line => !erasedShapeIds.includes(line.layerId)).forEach(({ start, end, layerId, color }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible && color) {
                drawBresenhamLine(start.x, start.y, end.x, end.y, ctx, color);
            } else if (layer?.is_visible) {
                drawBresenhamLine(start.x, start.y, end.x, end.y, ctx);
            }
        });

        circles.filter(circle => !erasedShapeIds.includes(circle.layerId)).forEach(({ center, radius, layerId, borderColor, backgroundColor }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible) drawCircle(center.x, center.y, radius, ctx, borderColor, backgroundColor);
        });

        curves.filter(curve => !erasedShapeIds.includes(curve.layerId)).forEach(({ p0, p1, p2, p3, layerId, color }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible && color) {
                drawBezierCurve(p0, p1, p2, p3, ctx, color);
            } else if (layer?.is_visible) {
                drawBezierCurve(p0, p1, p2, p3, ctx);
            }
        });

        ellipses.filter(ellipse => !erasedShapeIds.includes(ellipse.layerId)).forEach(({ center, rx, ry, layerId, borderColor, backgroundColor }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible && borderColor) {
                drawEllipseMidpoint(center.x, center.y, rx, ry, ctx, borderColor);
            } else if (layer?.is_visible) {
                drawEllipseMidpoint(center.x, center.y, rx, ry, ctx);
            }
        });

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
                drawBezierCurve(points[0], points[1], points[2], mousePos, ctx, previewLineColor);
            } else if (shape === ShapeMode.Ellipse && points.length === 1) {
                const dx = Math.abs(mousePos.x - points[0].x);
                const dy = Math.abs(mousePos.y - points[0].y);
                drawEllipseMidpoint(points[0].x, points[0].y, dx, dy, ctx, previewLineColor);
            }
        }

        drawHoverSelection(ctx); // Draw hover selection rectangle
        // Draw selection outline
        if (selectedShapeId) {
            let selectedShape: Line | Circle | Curve | Ellipse | undefined;
            selectedShape = lines.find(s => s.layerId === selectedShapeId);
            if (!selectedShape) selectedShape = circles.find(s => s.layerId === selectedShapeId);
            if (!selectedShape) selectedShape = curves.find(s => s.layerId === selectedShapeId);
            if (!selectedShape) selectedShape = ellipses.find(s => s.layerId === selectedShapeId);

            if (selectedShape) {
                ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"; // Red selection outline
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (selectedShape.start && selectedShape.end) { // Line
                    ctx.moveTo(selectedShape.start.x, selectedShape.start.y);
                    ctx.lineTo(selectedShape.end.x, selectedShape.end.y);
                } else if (selectedShape.center && selectedShape.radius) { // Circle
                    ctx.arc(selectedShape.center.x, selectedShape.center.y, selectedShape.radius, 0, 2 * Math.PI);
                } else if (selectedShape.p0 && selectedShape.p1 && selectedShape.p2 && selectedShape.p3) { // Curve
                    ctx.moveTo(selectedShape.p0.x, selectedShape.p0.y);
                    ctx.bezierCurveTo(selectedShape.p1.x, selectedShape.p1.y, selectedShape.p2.x, selectedShape.p2.y, selectedShape.p3.x, selectedShape.p3.y);
                } else if (selectedShape.center && selectedShape.rx && selectedShape.ry) { // Ellipse
                    const { center, rx, ry } = selectedShape;
                    const kappa = 0.5522848; // Approximation of the radial offset
                    const ox = rx * kappa;    // Horizontal offset
                    const oy = ry * kappa;    // Vertical offset

                    ctx.moveTo(center.x - rx, center.y);
                    ctx.bezierCurveTo(center.x - rx, center.y - oy, center.x - ox, center.y - ry, center.x, center.y - ry);
                    ctx.bezierCurveTo(center.x + ox, center.y - ry, center.x + rx, center.y - oy, center.x + rx, center.y);
                    ctx.bezierCurveTo(center.x + rx, center.y + oy, center.x + ox, center.y + ry, center.x, center.y + ry);
                    ctx.bezierCurveTo(center.x - ox, center.y + ry, center.x - rx, center.y + oy, center.x - rx, center.y);
                }
                ctx.stroke();
                ctx.lineWidth = 1; //reset
            }
        }
    };

    useEffect(() => {
        redraw();
    }, [points, mousePos, lines, circles, curves, layers, shape, drawColor, selectedShapeId, hoverStart, hoverEnd, erasedShapeIds]);

    const handleShapeCreation = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        const newPoints = [...points, { x, y, color: drawColor }];
        const newLayerId = uuidv4();
        let newLayer: Layer | null = null;

        if (shape === ShapeMode.Line && newPoints.length === 2) {
            const newLine: Line = {
                start: newPoints[0],
                end: newPoints[1],
                layerId: newLayerId,
                color: drawColor,
            };
            setLines((prev) => [...prev, newLine]);
            newLayer = {
                id: newLayerId,
                name: `Line ${lines.length + 1}`,
                icon: "🖊️",
                is_selected: false,
                is_visible: true,
            };
            setLayers([...layers, newLayer]);
            setPoints([]);
            setSelectedLayerId(newLayerId); // Select the new layer
        } else if (shape === ShapeMode.Circle && newPoints.length === 2) {
            const dx = newPoints[1].x - newPoints[0].x;
            const dy = newPoints[1].y - newPoints[0].y;
            const newCircle: Circle = {
                center: newPoints[0],
                radius: Math.sqrt(dx * dx + dy * dy),
                layerId: newLayerId,
                borderColor: drawColor,
            };
            setCircles((prev) => [...prev, newCircle]);
            newLayer = {
                id: newLayerId,
                name: `Circle ${circles.length + 1}`,
                icon: "⚪",
                is_selected: false,
                is_visible: true,
            };
            setLayers([...layers, newLayer]);
            setPoints([]);
            setSelectedLayerId(newLayerId);
        } else if (shape === ShapeMode.Curve) {
            if (newPoints.length < 4) {
                setPoints(newPoints);
            }
            if (newPoints.length === 4) {
                const [p0, p1, p2, p3] = newPoints;
                const newCurve: Curve = { p0, p1, p2, p3, layerId: newLayerId, color: drawColor };
                setCurves((prev) => [...prev, newCurve]);
                newLayer = {
                    id: newLayerId,
                    name: `Curve ${curves.length + 1}`,
                    icon: "➰",
                    is_selected: false,
                    is_visible: true,
                };
                setLayers([...layers, newLayer]);
                setPoints([]);
                setSelectedLayerId(newLayerId);
            }
        } else if (shape === ShapeMode.Ellipse && newPoints.length === 2) {
            const dx = Math.abs(newPoints[1].x - newPoints[0].x);
            const dy = Math.abs(newPoints[1].y - newPoints[0].y);
            const newEllipse: Ellipse = {
                center: newPoints[0],
                rx: dx,
                ry: dy,
                layerId: newLayerId,
                borderColor: drawColor,
            };
            setEllipses((prev) => [...prev, newEllipse]);
            newLayer = {
                id: newLayerId,
                name: `Ellipse ${ellipses.length + 1}`,
                icon: "🧿",
                is_selected: false,
                is_visible: true,
            };
            setLayers([...layers, newLayer]);
            setPoints([]);
            setSelectedLayerId(newLayerId);
        } else {
            setPoints(newPoints);
        }

        setMousePos(null);
    };

    const handleSelect = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = Math.floor(e.clientX - rect.left);
        const clickY = Math.floor(e.clientY - rect.top);

        let selectedShapeId: string | null = null;

        // Check if the click is within any shape
        const clickedLine = lines.find(line =>
            isPointOnLine(clickX, clickY, line.start.x, line.start.y, line.end.x, line.end.y, 5) //tolerance 5
        );
        if (clickedLine) selectedShapeId = clickedLine.layerId;

        const clickedCircle = circles.find(circle =>
            Math.hypot(clickX - circle.center.x, clickY - circle.center.y) <= circle.radius
        );
        if (clickedCircle) selectedShapeId = clickedCircle.layerId;

        const clickedCurve = curves.find(curve =>
            isPointOnBezierCurve(clickX, clickY, curve.p0, curve.p1, curve.p2, curve.p3, 0.1)
        );
        if (clickedCurve) selectedShapeId = clickedCurve.layerId;

        const clickedEllipse = ellipses.find(ellipse =>
            isPointInEllipse(clickX, clickY, ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry)
        );
        if (clickedEllipse) selectedShapeId = clickedEllipse.layerId;

        setSelectedShapeId(selectedShapeId);
        if (selectedShapeId) {
            const shapeLayer = layers.find(layer => layer.id === selectedShapeId);
            if (shapeLayer) {
                setSelectedLayerId(shapeLayer.id);
            }
        }
    };

    //helper functions
    function isPointOnLine(
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        tolerance: number
    ): boolean {
        const d = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
        if (d > tolerance) {
            return false;
        }
        const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
        const squaredLength = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        if (dotProduct < 0 || dotProduct > squaredLength) {
            return false;
        }
        return true;
    }

    function isPointOnBezierCurve(
        x: number,
        y: number,
        p0: Point,
        p1: Point,
        p2: Point,
        p3: Point,
        error: number
    ): boolean {
        // Bounding box check
        const minX = Math.min(p0.x, p1.x, p2.x, p3.x);
        const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
        const maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
        const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

        if (x < minX - error || x > maxX + error || y < minY - error || y > maxY + error) {
            return false; // Point is outside the bounding box
        }

        // Iterative check (simple approach - can be optimized)
        const numSamples = 100; // Increase for accuracy
        for (let i = 0; i <= numSamples; i++) {
            const t = i / numSamples;
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;

            const curveX = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
            const curveY = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

            if (Math.abs(x - curveX) < error && Math.abs(y - curveY) < error) {
                return true; // Point is close enough to the curve
            }
        }
        return false;
    }

    function isPointInEllipse(
        x: number,
        y: number,
        cx: number,
        cy: number,
        rx: number,
        ry: number
    ): boolean {
        //check if the point is inside the ellipse.
        const normalizedX = (x - cx) / rx;
        const normalizedY = (y - cy) / ry;
        return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
    }

    const handleMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || !selectedShapeId) return;
        const rect = canvas.getBoundingClientRect();
        const currentX = Math.floor(e.clientX - rect.left);
        const currentY = Math.floor(e.clientY - rect.top);

        if (!isDragging) {
            //start dragging
            setIsDragging(true);
            let shape: Line | Circle | Curve | Ellipse | undefined;
            shape = lines.find(s => s.layerId === selectedShapeId);
            if (!shape) shape = circles.find(s => s.layerId === selectedShapeId);
            if (!shape) shape = curves.find(s => s.layerId === selectedShapeId);
            if (!shape) shape = ellipses.find(s => s.layerId === selectedShapeId);

            if (shape) {
                let offsetX = 0;
                let offsetY = 0;
                if (shape.start) { // Line
                    offsetX = currentX - shape.start.x;
                    offsetY = currentY - shape.start.y;
                } else if (shape.center) {
                    offsetX = currentX - shape.center.x;
                    offsetY = currentY - shape.center.y;
                } else if (shape.p0) { // Curve
                    offsetX = currentX - shape.p0.x;
                    offsetY = currentY - shape.p0.y;
                }
                setDragOffset({ x: offsetX, y: offsetY });
            }
        } else {
            //when dragging
            setLines(prevLines =>
                prevLines.map(line => {
                    if (line.layerId === selectedShapeId) {
                        return {
                            ...line,
                            start: { x: currentX - dragOffset.x, y: currentY - dragOffset.y },
                            end: { x: line.end.x + (currentX - dragOffset.x - line.start.x), y: line.end.y + (currentY - dragOffset.y - line.start.y) }
                        };
                    }
                    return line;
                })
            );

            setCircles(prevCircles =>
                prevCircles.map(circle => {
                    if (circle.layerId === selectedShapeId) {
                        return {
                            ...circle,
                            center: { x: currentX - dragOffset.x, y: currentY - dragOffset.y }
                        };
                    }
                    return circle;
                })
            );

            setCurves(prevCurves =>
                prevCurves.map(curve => {
                    if (curve.layerId === selectedShapeId) {
                        return {
                            ...curve,
                            p0: { x: currentX - dragOffset.x, y: currentY - dragOffset.y },
                            p1: { x: curve.p1.x + (currentX - dragOffset.x - curve.p0.x), y: curve.p1.y + (currentY - dragOffset.y - curve.p0.y) },
                            p2: { x: curve.p2.x + (currentX - dragOffset.x - curve.p0.x), y: curve.p2.y + (currentY - dragOffset.y - curve.p0.y) },
                            p3: { x: curve.p3.x + (currentX - dragOffset.x - curve.p0.x), y: curve.p3.y + (currentY - dragOffset.y - curve.p0.y) }
                        };
                    }
                    return curve;
                })
            );

            setEllipses(prevEllipses =>
                prevEllipses.map(ellipse => {
                    if (ellipse.layerId === selectedShapeId) {
                        return {
                            ...ellipse,
                            center: { x: currentX - dragOffset.x, y: currentY - dragOffset.y }
                        };
                    }
                    return ellipse;
                })
            );
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
    };

    const handleRotate = (e: React.MouseEvent) => {
        // This is a placeholder.  Implementing rotation with a preview grid is complex.
        // It would involve:
        // 1.  Displaying a rotated bounding box of the selected shape.
        // 2.  Handling mouse movement to determine the rotation angle.
        // 3.  Updating the shape's points based on the rotation.
        // 4.  Using a library or custom matrix math for the rotation calculations.

        const canvas = canvasRef.current;
        if (!canvas || !selectedShapeId) return;

        // For simplicity, we'll just log the click coordinates for now.
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        console.log(`Rotate tool clicked at: x=${x}, y=${y} for shapeId: ${selectedShapeId}`);
    };

    const handleColor = (e: React.MouseEvent) => {
        //  Placeholder. In a real implementation, you would:
        // 1.  Show a color picker.
        // 2.  Get the selected color from the picker.
        // 3.  Update the color of the selected shape.

        const canvas = canvasRef.current;
        if (!canvas || !selectedShapeId) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        // For demonstration, we'll just change the color to a random one.
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

        setLines(prevLines =>
            prevLines.map(line =>
                line.layerId === selectedShapeId ? { ...line, color: randomColor } : line
            )
        );
        setCircles(prevCircles =>
            prevCircles.map(circle =>
                circle.layerId === selectedShapeId ? { ...circle, borderColor: randomColor } : circle
            )
        );
        setCurves(prevCurves =>
            prevCurves.map(curve =>
                curve.layerId === selectedShapeId ? { ...curve, color: randomColor } : curve
            )
        );
        setEllipses(prevEllipses =>
            prevEllipses.map(ellipse =>
                ellipse.layerId === selectedShapeId ? { ...ellipse, borderColor: randomColor } : ellipse
            )
        );
        console.log(`Color tool clicked at: x=${x}, y=${y} for shapeId: ${selectedShapeId}.  New color: ${randomColor}`);
    };

    const handleEraser = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        // Find the shape at the clicked point
        let erasedShapeId: string | null = null;
        const erasedLine = lines.find(line => isPointOnLine(x, y, line.start.x, line.start.y, line.end.x, line.end.y, 5));
        if (erasedLine) erasedShapeId = erasedLine.layerId;

        const erasedCircle = circles.find(circle => Math.hypot(x - circle.center.x, y - circle.center.y) <= circle.radius);
        if (erasedCircle) erasedShapeId = erasedCircle.layerId;

        const erasedCurve = curves.find(curve => isPointOnBezierCurve(x, y, curve.p0, curve.p1, curve.p2, curve.p3, 0.1));
        if (erasedCurve) erasedShapeId = erasedCurve.layerId;

        const erasedEllipse = ellipses.find(ellipse => isPointInEllipse(x, y, ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry));
        if (erasedEllipse) erasedShapeId = erasedEllipse.layerId;

        if (erasedShapeId) {
            setErasedShapeIds(prev => [...prev, erasedShapeId]); // Add to the erased list
            setSelectedShapeId(null); // Clear selection
            setLayers(prevLayers => prevLayers.filter(layer => layer.id !== erasedShapeId)); // Remove the layer
        }
    };

    const handleUndo = () => {
        // Placeholder for undo functionality
        console.log("Undo tool clicked");
    };

    const handleRedo = () => {
        // Placeholder for redo functionality
        console.log("Redo tool clicked");
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const currentX = Math.floor(e.clientX - rect.left);
        const currentY = Math.floor(e.clientY - rect.top);
        setMousePos({ x: currentX, y: currentY });

        if (tool === Tools.Hover) {
            if (hoverStart) {
                setHoverEnd({ x: currentX, y: currentY });
            }
        } else if (tool === Tools.Move && isDragging) {
            handleMove(e);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === Tools.Hover) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            setHoverStart({ x, y });
            setHoverEnd({ x, y }); // Initialize end point
        } else if (tool === Tools.Move && selectedShapeId) {
            handleMove(e);
        }
    };

    const handleMouseUpCanvas = (e: React.MouseEvent) => {
        if (tool === Tools.Hover) {
            if (hoverStart && hoverEnd) {
                //select shapes within the rectangle
                let selectedShapeIds: string[] = [];
                const minX = Math.min(hoverStart.x, hoverEnd.x);
                const minY = Math.min(hoverStart.y, hoverEnd.y);
                const maxX = Math.max(hoverStart.x, hoverEnd.x);
                const maxY = Math.max(hoverStart.y, hoverEnd.y);

                lines.forEach(line => {
                    if (isPointOnLine(minX, minY, line.start.x, line.start.y, line.end.x, line.end.y, 0) ||
                        isPointOnLine(maxX, minY, line.start.x, line.start.y, line.end.x, line.end.y, 0) ||
                        isPointOnLine(minX, maxY, line.start.x, line.start.y, line.end.x, line.end.y, 0) ||
                        isPointOnLine(maxX, maxY, line.start.x, line.start.y, line.end.x, line.end.y, 0)
                    ) {
                        selectedShapeIds.push(line.layerId);
                    }
                });
                circles.forEach(circle => {
                    if (circle.center.x >= minX && circle.center.x <= maxX && circle.center.y >= minY && circle.center.y <= maxY) {
                        selectedShapeIds.push(circle.layerId);
                    }
                });
                curves.forEach(curve => {
                    if (isPointOnBezierCurve(minX, minY, curve.p0, curve.p1, curve.p2, curve.p3, 0.1) ||
                        isPointOnBezierCurve(maxX, minY, curve.p0, curve.p1, curve.p2, curve.p3, 0.1) ||
                        isPointOnBezierCurve(minX, maxY, curve.p0, curve.p1, curve.p2, curve.p3, 0.1) ||
                        isPointOnBezierCurve(maxX, maxY, curve.p0, curve.p1, curve.p2, curve.p3, 0.1)
                    ) {
                        selectedShapeIds.push(curve.layerId);
                    }
                });
                ellipses.forEach(ellipse => {
                    if (isPointInEllipse(minX, minY, ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry) ||
                        isPointInEllipse(maxX, minY, ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry) ||
                        isPointInEllipse(minX, maxY, ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry) ||
                        isPointInEllipse(maxX, maxY, ellipse.center.x, ellipse.center.y, ellipse.rx, ellipse.ry)
                    ) {
                        selectedShapeIds.push(ellipse.layerId);
                    }
                });
                if (selectedShapeIds.length > 0) {
                    setSelectedShapeId(selectedShapeIds[0]); // Select the first shape.
                    const shapeLayer = layers.find(layer => layer.id === selectedShapeIds[0]);
                    if (shapeLayer) {
                        setSelectedLayerId(shapeLayer.id);
                    }
                }
            }
            setHoverStart(null);
            setHoverEnd(null);
        } else if (tool === Tools.Move) {
            handleMouseUp();
        }
    };

    const getClickHandler = () => {
        switch (tool) {
            case Tools.Draw:
                return handleShapeCreation;
            case Tools.Select:
                return handleSelect;
            case Tools.Move:
                return handleMove;
            case Tools.Rotate:
                return handleRotate;
            case Tools.Color:
                return handleColor;
            case Tools.Eraser:
                return handleEraser;
            case Tools.Undo:
                return handleUndo;
            case Tools.Redo:
                return handleRedo;
            default:
                return () => { }; // No-op
        }
    };

    const currentClickHandler = getClickHandler();

    return (
        <div
            className="relative w-full h-full"
            onMouseUp={handleMouseUpCanvas}
            onMouseDown={handleMouseDown}
        >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={currentClickHandler}
                onMouseMove={handleMouseMove}
                className="border border-neutral-200 bg-white w-full h-full"
            />
        </div>
    );
};

const ToolsTab = () => {
    const { tool, setTool } = useTab();
    const toolButtons = [
        {
            label: "Draw",
            icon: <FaPen className="text-xl text-neutral-600" />,
            type: Tools.Draw,
        },
        {
            label: "Select",
            icon: <LuMousePointer2 className="text-2xl text-neutral-600" />,
            type: Tools.Select,
        },
        {
            label: "Hover",
            icon: <PiSelectionBold className="text-2xl text-neutral-600" />,
            type: Tools.Hover,
        },
        {
            label: "Move",
            icon: <MdOutlineOpenWith className="text-2xl text-neutral-600" />,
            type: Tools.Move,
        },
        {
            label: "Rotate",
            icon: <MdRotate90DegreesCcw className="text-2xl text-neutral-600" />,
            type: Tools.Rotate,
        },
        {
            label: "Color",
            icon: <FaFillDrip className="text-2xl text-neutral-600" />,
            type: Tools.Color,
        },
        {
            label: "Eraser",
            icon: <FaEraser className="text-2xl text-neutral-600" />,
            type: Tools.Eraser,
        },
        {
            label: "Undo",
            icon: <FaUndo className="text-2xl text-neutral-600" />,
            type: Tools.Undo,
        },
        {
            label: "Redo",
            icon: <FaRedo className="text-2xl text-neutral-600" />,
            type: Tools.Redo,
        },
    ];

    return (
        <div className="absolute left-4 top-2 bg-white border rounded-sm pt-1 px-2 z-10">
            <p className="text-center border-b font-semibold pb-0.5">Tools</p>
            <div className="flex flex-col space-y-2 py-2">
                {toolButtons.map((button) => (
                    <button
                        key={button.type}
                        className={`flex cursor-pointer items-center space-x-1 px-1.5 py-1 rounded-sm transition
              ${tool === button.type
                                ? "bg-neutral-200 border border-neutral-400"
                                : "bg-neutral-100 border border-neutral-100 hover:bg-neutral-300"
                            }
            `}
                        onClick={() => setTool(button.type)}
                    >
                        {button.icon}
                        <p className="text-sm text-neutral-600 my-auto">{button.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Canvas;
