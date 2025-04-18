import React, { useEffect, useRef, useState } from "react";

const LineCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const parent = canvas.parentElement;
        canvas.width = parent?.clientWidth || 800;
        canvas.height = parent?.clientHeight || 600;
      }
    }, []);
  
    const drawPixel = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "black";
      ctx.fillRect(x, y, 1, 1);
    };
  
    const drawMarker = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
    };
  
    const drawBresenhamLine = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      ctx: CanvasRenderingContext2D
    ) => {
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
  
      let err = dx - dy;
      let x = x0;
      let y = y0;
  
      while (true) {
        drawPixel(x, y, ctx);
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
  
    const handleCanvasClick = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
  
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor(e.clientX - rect.left);
      const y = Math.floor(e.clientY - rect.top);
  
      const newPoints = [...points, { x, y }];
  
      if (newPoints.length === 1) {
        drawMarker(x, y, ctx);
        setPoints(newPoints);
      } else if (newPoints.length === 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBresenhamLine(newPoints[0].x, newPoints[0].y, newPoints[1].x, newPoints[1].y, ctx);
        setPoints([]);
      }
    };
  

  return (
    <div className="flex flex-col items-center cursor-pointer h-full">
      <canvas
        ref={canvasRef}
        // width={CANVAS_WIDTH}
        // height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        className="border border-neutral-200 bg-white w-full h-full rounded-sm"
      />
    </div>
  );
};

export default LineCanvas;
