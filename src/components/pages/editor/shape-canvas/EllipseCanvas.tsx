import React, { useEffect, useRef, useState } from "react";

const EllipseCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ellipses, setEllipses] = useState<
    { cx: number; cy: number; rx: number; ry: number }[]
  >([]);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rx, setRx] = useState(50);
  const [ry, setRy] = useState(30);

  const [popupPosition, setPopupPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || 800;
      canvas.height = parent?.clientHeight || 600;
    }
  }, []);

  const drawEllipseMidpoint = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    ctx: CanvasRenderingContext2D,
    color = "black"
  ) => {
    let x = 0;
    let y = ry;

    const rxSq = rx * rx;
    const rySq = ry * ry;

    let px = 0;
    let py = 2 * rxSq * y;

    ctx.fillStyle = color;

    const plotEllipsePoints = (x: number, y: number) => {
      ctx.fillRect(cx + x, cy + y, 1, 1);
      ctx.fillRect(cx - x, cy + y, 1, 1);
      ctx.fillRect(cx + x, cy - y, 1, 1);
      ctx.fillRect(cx - x, cy - y, 1, 1);
    };

    let p1 = rySq - rxSq * ry + 0.25 * rxSq;
    while (px < py) {
      plotEllipsePoints(x, y);
      x++;
      px += 2 * rySq;
      if (p1 < 0) {
        p1 += rySq + px;
      } else {
        y--;
        py -= 2 * rxSq;
        p1 += rySq + px - py;
      }
    }

    let p2 = rySq * (x + 0.5) * (x + 0.5) + rxSq * (y - 1) * (y - 1) - rxSq * rySq;
    while (y >= 0) {
      plotEllipsePoints(x, y);
      y--;
      py -= 2 * rxSq;
      if (p2 > 0) {
        p2 += rxSq - py;
      } else {
        x++;
        px += 2 * rySq;
        p2 += rxSq - py + px;
      }
    }
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ellipses.forEach(({ cx, cy, rx, ry }) => {
      drawEllipseMidpoint(cx, cy, rx, ry, ctx);
    });

    if (center) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(center.x, center.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    setCenter({ x, y });
    setShowForm(true);
  };

  const handleCreateEllipse = () => {
    if (!center) return;
    setEllipses([...ellipses, { cx: center.x, cy: center.y, rx, ry }]);
    setCenter(null);
    setShowForm(false);
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - popupPosition.x,
      y: e.clientY - popupPosition.y,
    };
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return;
    setPopupPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const stopDrag = () => {
    setDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging]);

  useEffect(() => {
    redraw();
  }, [ellipses, center]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="border border-neutral-300 bg-white w-full h-full rounded-sm cursor-pointer"
      />

      {showForm && center && (
        <div
          className="absolute bg-white shadow-md p-4 rounded border border-gray-200 z-10 w-64"
          style={{ top: popupPosition.y, left: popupPosition.x }}
        >
          <div
            className="flex justify-between items-center mb-2 cursor-move"
            onMouseDown={startDrag}
          >
            <h2 className="font-bold">Create Ellipse</h2>
            <button
              onClick={() => {
                setShowForm(false);
                setCenter(null);
              }}
              className="text-gray-500 hover:text-red-500 font-bold text-lg"
            >
              ×
            </button>
          </div>
          <div className="mb-2">
            <label className="block text-sm">rx:</label>
            <input
              type="number"
              value={rx}
              onChange={(e) => setRx(Number(e.target.value))}
              className="border px-2 py-1 w-full rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">ry:</label>
            <input
              type="number"
              value={ry}
              onChange={(e) => setRy(Number(e.target.value))}
              className="border px-2 py-1 w-full rounded"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowForm(false);
                setCenter(null);
              }}
              className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateEllipse}
              className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EllipseCanvas;
