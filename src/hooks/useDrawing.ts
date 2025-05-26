// hooks/useDrawing.ts
import { useState, useCallback } from "react";
import { Point, ShapeMode, Line, Circle, Curve, Ellipse, Polygon } from "@/interface/shape";
import { GlobalColor } from "@/interface/color";
import { v4 as uuidv4 } from "uuid";
import { useTab } from "@/context/AppContext";

const drawColor = GlobalColor.DraftDrawColor;

interface UseDrawingProps {
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  setMousePos: React.Dispatch<React.SetStateAction<Point | null>>;
}

export const useDrawing = ({ points, setPoints, setMousePos }: UseDrawingProps) => {
  const {
    lines,
    setLines,
    circles,
    setCircles,
    curves,
    setCurves,
    ellipses,
    setEllipses,
    polygons,
    setPolygons,
    polygonCornerNumber,
    layers,
    setLayers,
    setSelectedLayerId,
    setLog,
  } = useTab();

  const [willingToDrawPolygon, setWillingToDrawPolygon] = useState<boolean>(false);

  const handleDrawClick = useCallback(
    (x: number, y: number, shapeMode: ShapeMode) => {
      const newPoints = [...points, { x, y, color: drawColor }];
      const newLayerId = uuidv4();
      let newLayer = null;

      if (shapeMode === ShapeMode.Line && newPoints.length === 2) {
        const newLine: Line = {
          start: newPoints[0],
          end: newPoints[1],
          layerId: newLayerId,
          color: drawColor,
        };
        setLines((prev) => [...prev, newLine]);
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Line ${lines.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
        newLayer = {
          id: newLayerId,
          name: `Line ${lines.length + 1}`,
          icon: "🖊️",
          is_selected: false,
          is_visible: true,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
      } else if (shapeMode === ShapeMode.Circle && newPoints.length === 2) {
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const newCircle: Circle = {
          center: newPoints[0],
          radius: Math.sqrt(dx * dx + dy * dy),
          layerId: newLayerId,
          borderColor: drawColor,
        };
        setCircles((prev) => [...prev, newCircle]);
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Circle ${circles.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
        newLayer = {
          id: newLayerId,
          name: `Circle ${circles.length + 1}`,
          icon: "⚪",
          is_selected: false,
          is_visible: true,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
      } else if (shapeMode === ShapeMode.Curve) {
        if (newPoints.length < 4) {
          setPoints(newPoints);
        }
        if (newPoints.length === 4) {
          const [p0, p1, p2, p3] = newPoints;
          const newCurve: Curve = {
            p0,
            p1,
            p2,
            p3,
            layerId: newLayerId,
            color: drawColor,
          };
          setCurves((prev) => [...prev, newCurve]);
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Curve ${curves.length + 1} created`,
              timestamp: Date.now(),
            },
          ]);
          newLayer = {
            id: newLayerId,
            name: `Curve ${curves.length + 1}`,
            icon: "➰",
            is_selected: false,
            is_visible: true,
          };
          setLayers((prev) => [...prev, newLayer]);
          setSelectedLayerId(newLayer.id);
          setPoints([]);
        }
      } else if (shapeMode === ShapeMode.Ellipse && newPoints.length === 2) {
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
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Ellipse ${ellipses.length + 1} created`,
            timestamp: Date.now(),
          },
        ]);
        newLayer = {
          id: newLayerId,
          name: `Ellipse ${ellipses.length + 1}`,
          icon: "🧿",
          is_selected: false,
          is_visible: true,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
      } else if (shapeMode === ShapeMode.Polygon) {
        setPoints(newPoints);
        if (newPoints.length === 1) {
          setWillingToDrawPolygon(true);
        }
        if (newPoints.length === 2) {
          const center = newPoints[0];
          const radius = Math.sqrt(
            Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
          );
          const numSides = polygonCornerNumber;
          const polygonPoints: Point[] = [];
          for (let i = 0; i < numSides; i++) {
            const angle = (2 * Math.PI * i) / numSides;
            polygonPoints.push({
              x: Math.round(center.x + radius * Math.cos(angle)),
              y: Math.round(center.y + radius * Math.sin(angle)),
            });
          }
          const newPolygon: Polygon = {
            points: polygonPoints,
            layerId: newLayerId,
            borderColor: "black",
            backgroundColor: "transparent",
          };
          setPolygons((prev) => [...prev, newPolygon]);
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Polygon ${polygons.length + 1} created`,
              timestamp: Date.now(),
            },
          ]);
          newLayer = {
            id: newLayerId,
            name: `Polygon ${polygons.length + 1}`,
            icon: "△",
            is_selected: true,
            is_visible: true,
          };
          setLayers((prev) => [...prev, newLayer]);
          setSelectedLayerId(newLayerId);
          setPoints([]);
          setWillingToDrawPolygon(false);
        }
      } else {
        setPoints(newPoints);
      }
      setMousePos(null);
      if (newLayer) {
        setSelectedLayerId(newLayer.id);
      }
    },
    [
      points,
      lines,
      circles,
      curves,
      ellipses,
      polygons,
      polygonCornerNumber,
      layers,
      setPoints,
      setLines,
      setCircles,
      setCurves,
      setEllipses,
      setPolygons,
      setLayers,
      setSelectedLayerId,
      setLog,
      setMousePos,
    ]
  );

  return { handleDrawClick, willingToDrawPolygon, setWillingToDrawPolygon };
};