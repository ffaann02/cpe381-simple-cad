// hooks/useDrawing.ts
import { useCallback } from "react";
import { Point, ShapeMode, Line, Circle, Curve, Ellipse, Polygon } from "@/interface/shape";
import { Layer } from "@/interface/tab";
import { v4 as uuidv4 } from "uuid";
import { useTab } from "@/context/AppContext";

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
    saveState,
    currentColor
  } = useTab();

  const handleDrawClick = useCallback(
    (x: number, y: number, shapeMode: ShapeMode) => {
      const newPoints = [...points, { x, y, color: currentColor }];
      const newLayerId = uuidv4();
      let newLayer: Layer | null = null;

      if (shapeMode === ShapeMode.Line && newPoints.length === 2) {
        const newLine: Line = {
          start: newPoints[0],
          end: newPoints[1],
          layerId: newLayerId,
          color: currentColor,
        };
        setLines([...lines, newLine]);
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
          thickness: 1
        };
        setLayers([...layers, newLayer!]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
        setTimeout(saveState, 0);
      } else if (shapeMode === ShapeMode.Circle && newPoints.length === 2) {
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const newCircle: Circle = {
          center: newPoints[0],
          radius: Math.sqrt(dx * dx + dy * dy),
          layerId: newLayerId,
          borderColor: currentColor,
        };
        setCircles([...circles, newCircle]);
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
          thickness: 1
        };
        setLayers([...layers, newLayer!]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
        setTimeout(saveState, 0);
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
            color: currentColor,
          };
          setCurves([...curves, newCurve]);
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
            thickness: 1
          };
          setLayers([...layers, newLayer!]);
          setSelectedLayerId(newLayer.id);
          setPoints([]);
          setTimeout(saveState, 0);
        }
      } else if (shapeMode === ShapeMode.Ellipse && newPoints.length === 2) {
        const dx = Math.abs(newPoints[1].x - newPoints[0].x);
        const dy = Math.abs(newPoints[1].y - newPoints[0].y);
        const newEllipse: Ellipse = {
          center: newPoints[0],
          rx: dx,
          ry: dy,
          layerId: newLayerId,
          borderColor: currentColor,
        };
        setEllipses([...ellipses, newEllipse]);
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
          thickness: 1
        };
        setLayers([...layers, newLayer!]);
        setSelectedLayerId(newLayer.id);
        setPoints([]);
        setTimeout(saveState, 0);
      } else if (shapeMode === ShapeMode.Polygon) {
        setPoints(newPoints);
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
            borderColor: currentColor,
            backgroundColor: "transparent",
          };
          setPolygons([...polygons, newPolygon]);
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
            thickness: 1
          };
          setLayers([...layers, newLayer!]);
          setSelectedLayerId(newLayerId);
          setPoints([]);
          setTimeout(saveState, 0);
        }
      }
      else {
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
      saveState,
      currentColor,
    ]
  );

  return { handleDrawClick };
};