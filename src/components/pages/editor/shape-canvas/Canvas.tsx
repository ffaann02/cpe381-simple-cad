import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTab } from "@/context/AppContext";
import { Layer } from "@/interface/tab";
import { v4 as uuidv4 } from "uuid";
import { Circle, Curve, Ellipse, Line, Point, ShapeMode } from "@/interface/shape";

const previewLineColor = "#D4C9BE";

const Canvas = forwardRef((props, ref) => {
    const { canvasSize, layers, setLayers, shape, setSelectedLayerId, canvasRef } = useTab();
    const [mousePos, setMousePos] = useState<Point | null>(null);
    const { points, setPoints, lines, setLines, circles, setCircles, curves, setCurves, ellipses, setEllipses } = useTab();
    const [drawColor, setDrawColor] = useState<string>("black");

    useEffect(() => {
        const canvas = canvasRef?.current;
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

    const drawBresenhamLine = (x0: number, y0: number, x1: number, y1: number, ctx: CanvasRenderingContext2D, color = "black") => {
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

    const drawCircle = (cx: number, cy: number, radius: number, ctx: CanvasRenderingContext2D, strokeColor = "black", fillColor = "") => {
        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        ctx.stroke();
    };

    const drawBezierCurve = (p0: Point, p1: Point, p2: Point, p3: Point, ctx: CanvasRenderingContext2D, color = "black") => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.stroke();
    };

    const drawEllipseMidpoint = (cx: number, cy: number, rx: number, ry: number, ctx: CanvasRenderingContext2D, color = "black") => {
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

    const redraw = () => {
        const canvas = canvasRef?.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lines.forEach(({ start, end, layerId, color }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible && color) {
                drawBresenhamLine(start.x, start.y, end.x, end.y, ctx, color);
            } else if (layer?.is_visible) {
                drawBresenhamLine(start.x, start.y, end.x, end.y, ctx);
            }
        });
        circles.forEach(({ center, radius, layerId, borderColor, backgroundColor }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible) drawCircle(center.x, center.y, radius, ctx, borderColor, backgroundColor);
        });
        curves.forEach(({ p0, p1, p2, p3, layerId, color }) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible && color) {
                drawBezierCurve(p0, p1, p2, p3, ctx, color);
            } else if (layer?.is_visible) {
                drawBezierCurve(p0, p1, p2, p3, ctx);
            }
        });
        ellipses.forEach(({ center, rx, ry, layerId, borderColor, backgroundColor }) => {
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

    useEffect(() => {
        redraw();
        console.log("Canvas redrawn");
    }, [points, mousePos, lines, circles, curves, layers, shape, drawColor, ellipses]);

    const handleClick = (e: React.MouseEvent) => {
        const canvas = canvasRef?.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        const newPoints = [...points, { x, y, color: drawColor }];
        const newLayerId = uuidv4();
        let newLayer: Layer | null = null;
        if (shape === ShapeMode.Line && newPoints.length === 2) {
            const newLine: Line = { start: newPoints[0], end: newPoints[1], layerId: newLayerId, color: drawColor };
            setLines((prev) => [...prev, newLine]);
            newLayer = { id: newLayerId, name: `Line ${lines.length + 1}`, icon: "🖊️", is_selected: false, is_visible: true };
            setLayers([...layers, newLayer]);
            setPoints([]);
        } else if (shape === ShapeMode.Circle && newPoints.length === 2) {
            const dx = newPoints[1].x - newPoints[0].x;
            const dy = newPoints[1].y - newPoints[0].y;
            const newCircle: Circle = { center: newPoints[0], radius: Math.sqrt(dx * dx + dy * dy), layerId: newLayerId, borderColor: drawColor };
            setCircles((prev) => [...prev, newCircle]);
            newLayer = { id: newLayerId, name: `Circle ${circles.length + 1}`, icon: "⚪", is_selected: false, is_visible: true };
            setLayers([...layers, newLayer]);
            setPoints([]);
        } else if (shape === ShapeMode.Curve) {
            if (newPoints.length < 4) {
                setPoints(newPoints);
            }
            if (newPoints.length === 4) {
                const [p0, p1, p2, p3] = newPoints;
                const newCurve: Curve = { p0, p1, p2, p3, layerId: newLayerId, color: drawColor };
                setCurves((prev) => [...prev, newCurve]);
                newLayer = { id: newLayerId, name: `Curve ${curves.length + 1}`, icon: "➰", is_selected: false, is_visible: true };
                setLayers([...layers, newLayer]);
                setPoints([]);
            }
        } else if (shape === ShapeMode.Ellipse && newPoints.length === 2) {
            const dx = Math.abs(newPoints[1].x - newPoints[0].x);
            const dy = Math.abs(newPoints[1].y - newPoints[0].y);
            const newEllipse: Ellipse = { center: newPoints[0], rx: dx, ry: dy, layerId: newLayerId, borderColor: drawColor };
            setEllipses((prev) => [...prev, newEllipse]);
            newLayer = { id: newLayerId, name: `Ellipse ${ellipses.length + 1}`, icon: "🧿", is_selected: false, is_visible: true };
            setLayers([...layers, newLayer]);
            setPoints([]);
        } else {
            setPoints(newPoints);
        }
        setMousePos(null);
        if (newLayer) {
            setSelectedLayerId(newLayer.id);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if ((shape === ShapeMode.Line && points.length !== 1) || (shape === ShapeMode.Circle && points.length !== 1) || (shape === ShapeMode.Curve && points.length !== 3)) return;
        const canvas = canvasRef?.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        setMousePos({ x: Math.floor(e.clientX - rect.left), y: Math.floor(e.clientY - rect.top) });
    };

    useImperativeHandle(ref, () => ({
        redraw
    }));

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                className="border border-neutral-200 bg-white w-full h-full"
            />
        </div>
    );
});

export default Canvas;
