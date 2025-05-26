import React, { useEffect, useRef, useState } from "react";

const CircleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [circles, setCircles] = useState<
    { center: { x: number; y: number }; radius: number }[]
  >([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

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
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawCircle = (
    cx: number,
    cy: number,
    radius: number,
    ctx: CanvasRenderingContext2D,
    color = "black"
  ) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all confirmed circles
    circles.forEach(({ center, radius }) => {
      drawCircle(center.x, center.y, radius, ctx);
    });

    // Draw center marker
    if (points.length === 1) {
      drawMarker(points[0].x, points[0].y, ctx);
    }

    // Draw draft circle if hovering after 1st point
    if (points.length === 1 && mousePos) {
      const dx = mousePos.x - points[0].x;
      const dy = mousePos.y - points[0].y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      drawCircle(points[0].x, points[0].y, radius, ctx, "gray");
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
      const dx = newPoints[1].x - newPoints[0].x;
      const dy = newPoints[1].y - newPoints[0].y;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const newCircle = { center: newPoints[0], radius };
      setCircles((prev) => [...prev, newCircle]);
      setPoints([]);
      setMousePos(null);
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
  }, [points, circles, mousePos]);

  return (
    <div className="flex flex-col items-center cursor-pointer h-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="border border-neutral-200 bg-white w-full h-full rounded-sm"
      />
    </div>
  );
};

export default CircleCanvas;