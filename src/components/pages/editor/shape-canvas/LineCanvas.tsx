import { useTab } from "@/context/AppContext";
import { Layer } from "@/interface/tab";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useRef, useState } from "react";

type Line = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  layerId: string;
};

const LineCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const { layers, setLayers, canvasSize } = useTab();

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
    ctx.arc(x, y, 1, 0, 2 * Math.PI);
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
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;
    let x = x0;
    let y = y0;

    ctx.fillStyle = color;

    while (true) {
      ctx.fillRect(x, y, 1, 1);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
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

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all visible lines
    lines.forEach(({ start, end, layerId }) => {
      const layer = layers.find((l) => l.id === layerId);
      if (layer?.is_visible) {
        drawBresenhamLine(start.x, start.y, end.x, end.y, ctx);
      }
    });

    // Draw marker if one point is selected
    if (points.length === 1) {
      drawMarker(points[0].x, points[0].y, ctx);
    }

    // Draw draft line if hovering after 1st point
    if (points.length === 1 && mousePos) {
      drawBresenhamLine(points[0].x, points[0].y, mousePos.x, mousePos.y, ctx, "gray");
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const newPoints = [...points, { x, y }];

    if (newPoints.length === 1) {
      setPoints(newPoints);
    } else if (newPoints.length === 2) {
      const newLayerId = uuidv4();
      const newLine: Line = {
        start: newPoints[0],
        end: newPoints[1],
        layerId: newLayerId,
      };
      setLines((prev) => [...prev, newLine]);
      setPoints([]);
      setMousePos(null);

      const newLayer: Layer = {
        id: newLayerId,
        icon: "🖊️",
        name: `Line ${lines.length + 1}`,
        is_selected: false,
        is_visible: true,
      };
      setLayers([...layers, newLayer]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (points.length !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    setMousePos({ x, y });
  };

  useEffect(() => {
    redraw();
  }, [points, lines, mousePos, layers]);

  return (
    <div className="flex flex-col items-center cursor-pointer h-full">
      <canvas
      width={canvasSize.width}
      height={canvasSize.height}
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="border border-neutral-200 bg-white w-full h-full rounded-sm"
      />
    </div>
  );
};

export default LineCanvas;
