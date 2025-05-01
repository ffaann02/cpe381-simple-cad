import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTab } from "@/context/AppContext";
import { Layer } from "@/interface/tab";
import { v4 as uuidv4 } from "uuid";
import { Circle, Curve, Ellipse, Line, Point, ShapeMode } from "@/interface/shape";
import { Tools } from "@/interface/tool";

const previewLineColor = "#D4C9BE";
const rotationGuideColor = "#4A90E2";
const selectionColor = "#2196F3";

const Canvas = forwardRef((props, ref) => {
    const { 
        canvasSize, 
        layers, 
        setLayers, 
        shape, 
        setSelectedLayerId, 
        canvasRef, 
        importTimestamp,
        tool
    } = useTab();
    
    const [mousePos, setMousePos] = useState<Point | null>(null);
    const [startDragPos, setStartDragPos] = useState<Point | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [rotationAngle, setRotationAngle] = useState<number>(0);
    const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
    const [selectedShape, setSelectedShape] = useState<{ type: string, index: number } | null>(null);
    
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
        setEllipses 
    } = useTab();
    
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

    const drawSelectionBox = (x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) => {
        ctx.strokeStyle = selectionColor;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - width/2 - 5, y - height/2 - 5, width + 10, height + 10);
        ctx.setLineDash([]);
        
        // Draw control points
        ctx.fillStyle = selectionColor;
        [
            { x: x - width/2 - 5, y: y - height/2 - 5 },
            { x: x, y: y - height/2 - 5 },
            { x: x + width/2 + 5, y: y - height/2 - 5 },
            { x: x - width/2 - 5, y: y },
            { x: x + width/2 + 5, y: y },
            { x: x - width/2 - 5, y: y + height/2 + 5 },
            { x: x, y: y + height/2 + 5 },
            { x: x + width/2 + 5, y: y + height/2 + 5 }
        ].forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    };

    const drawRotationGuide = (x: number, y: number, width: number, height: number, angle: number, ctx: CanvasRenderingContext2D) => {
        const centerX = x;
        const centerY = y;
        const radius = Math.max(width, height) / 2 + 30;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * Math.PI / 180);
        
        // Draw rotation circle
        ctx.strokeStyle = rotationGuideColor;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Draw angle indicator
        ctx.strokeStyle = rotationGuideColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -radius);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.restore();
        
        // Display angle text
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(`${angle}°`, centerX + radius + 10, centerY);
    };

    const isPointInLine = (point: Point, line: Line, tolerance = 5) => {
        const { start, end } = line;
        const d1 = Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2);
        const d2 = Math.sqrt((point.x - end.x) ** 2 + (point.y - end.y) ** 2);
        const lineLength = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        return Math.abs(d1 + d2 - lineLength) < tolerance;
    };

    const isPointInCircle = (point: Point, circle: Circle, tolerance = 5) => {
        const { center, radius } = circle;
        const distance = Math.sqrt((point.x - center.x) ** 2 + (point.y - center.y) ** 2);
        return Math.abs(distance - radius) < tolerance;
    };

    const isPointInEllipse = (point: Point, ellipse: Ellipse, tolerance = 5) => {
        const { center, rx, ry } = ellipse;
        // Transform to unit circle
        const normalizedX = (point.x - center.x) / rx;
        const normalizedY = (point.y - center.y) / ry;
        const distance = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);
        return Math.abs(distance - 1) < tolerance / Math.min(rx, ry);
    };

    const isPointNearCurve = (point: Point, curve: Curve, tolerance = 5) => {
        // Simple approximation by checking distance to control points
        // A more accurate check would involve sampling points along the curve
        const points = [curve.p0, curve.p1, curve.p2, curve.p3];
        for (const pt of points) {
            const distance = Math.sqrt((point.x - pt.x) ** 2 + (point.y - pt.y) ** 2);
            if (distance < tolerance) return true;
        }
        return false;
    };

    const findHoveredShape = (x: number, y: number) => {
        const point = { x, y };
        
        // Check lines
        for (let i = 0; i < lines.length; i++) {
            if (isPointInLine(point, lines[i])) {
                return { type: 'line', index: i, layerId: lines[i].layerId };
            }
        }
        
        // Check circles
        for (let i = 0; i < circles.length; i++) {
            if (isPointInCircle(point, circles[i])) {
                return { type: 'circle', index: i, layerId: circles[i].layerId };
            }
        }
        
        // Check ellipses
        for (let i = 0; i < ellipses.length; i++) {
            if (isPointInEllipse(point, ellipses[i])) {
                return { type: 'ellipse', index: i, layerId: ellipses[i].layerId };
            }
        }
        
        // Check curves
        for (let i = 0; i < curves.length; i++) {
            if (isPointNearCurve(point, curves[i])) {
                return { type: 'curve', index: i, layerId: curves[i].layerId };
            }
        }
        
        return null;
    };

    const redraw = () => {
        const canvas = canvasRef?.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all shapes
        lines.forEach(({ start, end, layerId, color }, index) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible) {
                drawBresenhamLine(
                    start.x, 
                    start.y, 
                    end.x, 
                    end.y, 
                    ctx, 
                    hoveredLayerId === layerId ? selectionColor : color || "black"
                );
                
                // Draw selection for selected line
                if (layer.is_selected && (tool === Tools.Select || tool === Tools.Move || tool === Tools.Rotate)) {
                    const centerX = (start.x + end.x) / 2;
                    const centerY = (start.y + end.y) / 2;
                    const width = Math.abs(end.x - start.x);
                    const height = Math.abs(end.y - start.y);
                    
                    drawSelectionBox(centerX, centerY, width, height, ctx);
                    
                    if (tool === Tools.Rotate) {
                        drawRotationGuide(centerX, centerY, width, height, rotationAngle, ctx);
                    }
                }
            }
        });
        
        circles.forEach(({ center, radius, layerId, borderColor, backgroundColor }, index) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible) {
                drawCircle(
                    center.x, 
                    center.y, 
                    radius, 
                    ctx, 
                    hoveredLayerId === layerId ? selectionColor : borderColor || "black", 
                    backgroundColor
                );
                
                // Draw selection for selected circle
                if (layer.is_selected && (tool === Tools.Select || tool === Tools.Move || tool === Tools.Rotate)) {
                    drawSelectionBox(center.x, center.y, radius * 2, radius * 2, ctx);
                    
                    if (tool === Tools.Rotate) {
                        drawRotationGuide(center.x, center.y, radius * 2, radius * 2, rotationAngle, ctx);
                    }
                }
            }
        });
        
        curves.forEach(({ p0, p1, p2, p3, layerId, color }, index) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible) {
                drawBezierCurve(
                    p0, 
                    p1, 
                    p2, 
                    p3, 
                    ctx, 
                    hoveredLayerId === layerId ? selectionColor : color || "black"
                );
                
                // Draw selection for selected curve
                if (layer.is_selected && (tool === Tools.Select || tool === Tools.Move || tool === Tools.Rotate)) {
                    const minX = Math.min(p0.x, p1.x, p2.x, p3.x);
                    const maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
                    const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
                    const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);
                    const centerX = (minX + maxX) / 2;
                    const centerY = (minY + maxY) / 2;
                    const width = maxX - minX;
                    const height = maxY - minY;
                    
                    drawSelectionBox(centerX, centerY, width, height, ctx);
                    
                    if (tool === Tools.Rotate) {
                        drawRotationGuide(centerX, centerY, width, height, rotationAngle, ctx);
                    }
                }
            }
        });
        
        ellipses.forEach(({ center, rx, ry, layerId, borderColor, backgroundColor }, index) => {
            const layer = layers.find((l) => l.id === layerId);
            if (layer?.is_visible) {
                drawEllipseMidpoint(
                    center.x, 
                    center.y, 
                    rx, 
                    ry, 
                    ctx, 
                    hoveredLayerId === layerId ? selectionColor : borderColor || "black"
                );
                
                // Draw selection for selected ellipse
                if (layer.is_selected && (tool === Tools.Select || tool === Tools.Move || tool === Tools.Rotate)) {
                    drawSelectionBox(center.x, center.y, rx * 2, ry * 2, ctx);
                    
                    if (tool === Tools.Rotate) {
                        drawRotationGuide(center.x, center.y, rx * 2, ry * 2, rotationAngle, ctx);
                    }
                }
            }
        });
        
        // Draw points for shape creation
        if (tool === Tools.Draw) {
            points.forEach((pt) => drawMarker(pt.x, pt.y, ctx));
            
            // Draw preview shapes
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
        }
    };

    useEffect(() => {
        redraw();
    }, [
        points, 
        mousePos, 
        lines, 
        circles, 
        curves, 
        ellipses, 
        layers, 
        shape, 
        drawColor, 
        importTimestamp, 
        hoveredLayerId, 
        tool,
        rotationAngle
    ]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === Tools.Draw) return; // Let handleClick handle drawing
        
        const canvas = canvasRef?.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        
        setStartDragPos({ x, y });
        
        if (tool === Tools.Select || tool === Tools.Move) {
            const hoveredShape = findHoveredShape(x, y);
            if (hoveredShape) {
                setSelectedShape({ type: hoveredShape.type, index: hoveredShape.index });
                
                // Update layer selection
                const updatedLayers = layers.map(layer => ({
                    ...layer,
                    is_selected: layer.id === hoveredShape.layerId
                }));
                setLayers(updatedLayers);
                setSelectedLayerId(hoveredShape.layerId);
                
                if (tool === Tools.Move) {
                    setIsDragging(true);
                }
            } else {
                // Deselect if clicking empty space
                const updatedLayers = layers.map(layer => ({
                    ...layer,
                    is_selected: false
                }));
                setLayers(updatedLayers);
                setSelectedLayerId(null);
                setSelectedShape(null);
            }
        } else if (tool === Tools.Rotate) {
            // Calculate rotation if a shape is selected
            if (selectedShape) {
                setIsDragging(true);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const canvas = canvasRef?.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        
        // Update mousePos for drawing preview
        if (tool === Tools.Draw) {
            if ((shape === ShapeMode.Line && points.length === 1) || 
                (shape === ShapeMode.Circle && points.length === 1) || 
                (shape === ShapeMode.Curve && points.length === 3) ||
                (shape === ShapeMode.Ellipse && points.length === 1)) {
                setMousePos({ x, y });
            }
        }
        
        // Handle hover highlighting
        if (tool === Tools.Hover || tool === Tools.Select || tool === Tools.Move || tool === Tools.Eraser) {
            const hoveredShape = findHoveredShape(x, y);
            setHoveredLayerId(hoveredShape?.layerId || null);
        }
        
        // Handle moving shapes
        if (isDragging && startDragPos && (tool === Tools.Move || tool === Tools.Rotate)) {
            const deltaX = x - startDragPos.x;
            const deltaY = y - startDragPos.y;
            
            if (tool === Tools.Move && selectedShape) {
                // Move the selected shape
                if (selectedShape.type === 'line') {
                    const line = {...lines[selectedShape.index]};
                    setLines(prev => {
                        const newLines = [...prev];
                        newLines[selectedShape.index] = {
                            ...line,
                            start: { 
                                x: line.start.x + deltaX, 
                                y: line.start.y + deltaY,
                                color: line.start.color
                            },
                            end: { 
                                x: line.end.x + deltaX, 
                                y: line.end.y + deltaY,
                                color: line.end.color
                            }
                        };
                        return newLines;
                    });
                } else if (selectedShape.type === 'circle') {
                    const circle = {...circles[selectedShape.index]};
                    setCircles(prev => {
                        const newCircles = [...prev];
                        newCircles[selectedShape.index] = {
                            ...circle,
                            center: { 
                                x: circle.center.x + deltaX, 
                                y: circle.center.y + deltaY,
                                color: circle.center.color 
                            }
                        };
                        return newCircles;
                    });
                } else if (selectedShape.type === 'ellipse') {
                    const ellipse = {...ellipses[selectedShape.index]};
                    setEllipses(prev => {
                        const newEllipses = [...prev];
                        newEllipses[selectedShape.index] = {
                            ...ellipse,
                            center: { 
                                x: ellipse.center.x + deltaX, 
                                y: ellipse.center.y + deltaY,
                                color: ellipse.center.color 
                            }
                        };
                        return newEllipses;
                    });
                } else if (selectedShape.type === 'curve') {
                    const curve = {...curves[selectedShape.index]};
                    setCurves(prev => {
                        const newCurves = [...prev];
                        newCurves[selectedShape.index] = {
                            ...curve,
                            p0: { x: curve.p0.x + deltaX, y: curve.p0.y + deltaY, color: curve.p0.color },
                            p1: { x: curve.p1.x + deltaX, y: curve.p1.y + deltaY, color: curve.p1.color },
                            p2: { x: curve.p2.x + deltaX, y: curve.p2.y + deltaY, color: curve.p2.color },
                            p3: { x: curve.p3.x + deltaX, y: curve.p3.y + deltaY, color: curve.p3.color }
                        };
                        return newCurves;
                    });
                }
                
                setStartDragPos({ x, y });
            } else if (tool === Tools.Rotate && selectedShape) {
                // Calculate center point of the selected shape
                let centerX = 0, centerY = 0;
                
                if (selectedShape.type === 'line') {
                    const line = lines[selectedShape.index];
                    centerX = (line.start.x + line.end.x) / 2;
                    centerY = (line.start.y + line.end.y) / 2;
                } else if (selectedShape.type === 'circle') {
                    const circle = circles[selectedShape.index];
                    centerX = circle.center.x;
                    centerY = circle.center.y;
                } else if (selectedShape.type === 'ellipse') {
                    const ellipse = ellipses[selectedShape.index];
                    centerX = ellipse.center.x;
                    centerY = ellipse.center.y;
                } else if (selectedShape.type === 'curve') {
                    const curve = curves[selectedShape.index];
                    const minX = Math.min(curve.p0.x, curve.p1.x, curve.p2.x, curve.p3.x);
                    const maxX = Math.max(curve.p0.x, curve.p1.x, curve.p2.x, curve.p3.x);
                    const minY = Math.min(curve.p0.y, curve.p1.y, curve.p2.y, curve.p3.y);
                    const maxY = Math.max(curve.p0.y, curve.p1.y, curve.p2.y, curve.p3.y);
                    centerX = (minX + maxX) / 2;
                    centerY = (minY + maxY) / 2;
                }
                
                // Calculate angle between center and mouse position
                const startAngle = Math.atan2(startDragPos.y - centerY, startDragPos.x - centerX);
                const currentAngle = Math.atan2(y - centerY, x - centerX);
                const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
                
                // Update rotation angle
                setRotationAngle(prev => (prev + angleDiff) % 360);
                setStartDragPos({ x, y });
            }
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // Only handle clicks for drawing tool
        if (tool !== Tools.Draw) return;
        
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

    const handleEraser = (e: React.MouseEvent) => {
        if (tool !== Tools.Eraser) return;
        
        const canvas = canvasRef?.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        
        const hoveredShape = findHoveredShape(x, y);
        if (hoveredShape) {
            // Remove the shape
            if (hoveredShape.type === 'line') {
                setLines(prev => prev.filter((_, i) => i !== hoveredShape.index));
            } else if (hoveredShape.type === 'circle') {
                setCircles(prev => prev.filter((_, i) => i !== hoveredShape.index));
            } else if (hoveredShape.type === 'ellipse') {
                setEllipses(prev => prev.filter((_, i) => i !== hoveredShape.index));
            } else if (hoveredShape.type === 'curve') {
                setCurves(prev => prev.filter((_, i) => i !== hoveredShape.index));
            }
            
            // Remove the associated layer
            setLayers(prev => prev.filter(layer => layer.id !== hoveredShape.layerId));
            
            // Clear selection
            setSelectedShape(null);
            setHoveredLayerId(null);
        }
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
                onClick={(e) => {
                    if (tool === Tools.Draw) {
                        handleClick(e);
                    } else if (tool === Tools.Eraser) {
                        handleEraser(e);
                    }
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-neutral-200 bg-white w-full h-full"
            />
        </div>
    );
});

export default Canvas;