// hooks/useFlip.ts
import { useState, useCallback } from "react";
import { Point, Polygon } from "@/interface/shape";
import { useTab } from "@/context/AppContext";
import { findShapeAtPoint } from "@/utils/selection";
import { flipPoint } from "@/utils/transform";
import { getShapeCenter } from "@/utils/position";

interface ShapeToFlip {
  layerId: string | null;
  index: number | null;
  type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
}

export const useFlip = () => {
  const [flipModalVisible, setFlipModalVisible] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<Point | null>(null);
  const [shapeToFlip, setShapeToFlip] = useState<ShapeToFlip | null>(null);

  const { lines, setLines, circles, setCircles, ellipses, setEllipses, curves, setCurves, polygons, setPolygons, layers, setLayers, setSelectedLayerId, setLog } = useTab();

  const handleFlipClick = useCallback(
    (x: number, y: number) => {
      const clickedShape = findShapeAtPoint(x, y, lines, circles, ellipses, curves, polygons, layers);
      if (clickedShape.layerId) {
        if (clickedShape.index !== null && clickedShape.type !== null) {
          setFlipModalVisible(true);
          setModalPosition({ x, y });
          setShapeToFlip(clickedShape);

          const updatedLayers = layers.map((layer) => ({
            ...layer,
            is_selected: layer.id === clickedShape.layerId,
          }));
          setLayers(updatedLayers);
          setSelectedLayerId(clickedShape.layerId);
        } else {
          const updatedLayers = layers.map((layer) => ({
            ...layer,
            is_selected: false,
          }));
          setLayers(updatedLayers);
          setSelectedLayerId(null);
          setFlipModalVisible(false);
          setShapeToFlip(null);
        }
      } else {
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: false,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(null);
        setFlipModalVisible(false);
        setShapeToFlip(null);
      }
    },
    [lines, circles, ellipses, curves, polygons, layers, setLayers, setSelectedLayerId]
  );

  const flipShape = useCallback(
    (direction: "horizontal" | "vertical") => {
      if (!shapeToFlip) return;

      const { layerId, index, type } = shapeToFlip;
      const shapeObject = (() => {
        switch (type) {
          case "line": return lines[index!];
          case "circle": return circles[index!];
          case "ellipse": return ellipses[index!];
          case "curve": return curves[index!];
          case "polygon": return polygons[index!];
          default: return undefined;
        }
      })();

      if (!shapeObject) return;

      const shapeCenter = getShapeCenter(shapeObject as any, type!);

      switch (type) {
        case "line":
          setLines((prevLines) =>
            prevLines.map((line, i) =>
              i === index && line.layerId === layerId
                ? {
                    ...line,
                    start: flipPoint(line.start, direction, shapeCenter),
                    end: flipPoint(line.end, direction, shapeCenter),
                  }
                : line
            )
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Line ${index} flipped ${direction}`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "circle":
          break;
        case "ellipse":
          setEllipses((prevEllipses) =>
            prevEllipses.map((ellipse, i) =>
              i === index && ellipse.layerId === layerId
                ? {
                    ...ellipse,
                    center: flipPoint(ellipse.center, direction, shapeCenter),
                  }
                : ellipse
            )
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Ellipse ${index} flipped ${direction}`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "curve":
          setCurves((prevCurves) =>
            prevCurves.map((curve, i) =>
              i === index && curve.layerId === layerId
                ? {
                    ...curve,
                    p0: flipPoint(curve.p0, direction, shapeCenter),
                    p1: flipPoint(curve.p1, direction, shapeCenter),
                    p2: flipPoint(curve.p2, direction, shapeCenter),
                    p3: flipPoint(curve.p3, direction, shapeCenter),
                  }
                : curve
            )
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Curve ${index} flipped ${direction}`,
              timestamp: Date.now(),
            },
          ]);
          break;
        case "polygon":
          setPolygons((prevPolygons) =>
            prevPolygons.map((polygon, i) =>
              i === index && polygon.layerId === layerId
                ? {
                    ...polygon,
                    points: polygon.points.map(point => flipPoint(point, direction, shapeCenter))
                  }
                : polygon
            )
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Polygon ${index} flipped ${direction}`,
              timestamp: Date.now(),
            },
          ]);
          break;
        default:
          break;
      }

      setFlipModalVisible(false);
      setShapeToFlip(null);
    },
    [shapeToFlip, setLines, setCircles, setEllipses, setCurves, setPolygons, setLog]
  );

  return { flipModalVisible, setFlipModalVisible, modalPosition, shapeToFlip, handleFlipClick, flipShape };
};