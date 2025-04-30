import React, { useEffect, useRef, useState } from "react";

const CurveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [curves, setCurves] = useState<
    { p0: { x: number; y: number }; p1: { x: number; y: number }; p2: { x: number; y: number }; p3: { x: number; y: number } }[]
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
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawCubicBezier = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    ctx: CanvasRenderingContext2D,
    color = "black"
  ) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // วาดเส้นโค้งที่ยืนยันแล้ว
    curves.forEach(({ p0, p1, p2, p3 }) => {
      drawCubicBezier(p0, p1, p2, p3, ctx);
    });

    // วาดจุดชั่วคราว
    points.forEach((pt) => drawMarker(pt.x, pt.y, ctx));

    // วาดเส้นร่างถ้ามีครบ 4 จุด
    if (points.length === 4) {
      const [p0, p1, p2, p3] = points;
      drawCubicBezier(p0, p1, p2, p3, ctx, "gray");
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const newPoints = [...points, { x, y }];

    if (newPoints.length < 4) {
      setPoints(newPoints);
    } else if (newPoints.length === 4) {
      const [p0, p1, p2, p3] = newPoints;
      setCurves((prev) => [...prev, { p0, p1, p2, p3 }]);
      setPoints([]); // reset after drawing
      setMousePos(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (points.length === 0 || points.length >= 4) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    setMousePos({ x, y });
  };

  useEffect(() => {
    redraw();
  }, [points, curves, mousePos]);

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

export default CurveCanvas;