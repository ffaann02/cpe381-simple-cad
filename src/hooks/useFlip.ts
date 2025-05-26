// hooks/useFlip.ts
import { useState, useCallback } from "react";
import { Point } from "@/interface/shape";
import { useTab } from "@/context/AppContext";
import { findShapeAtPoint } from "@/utils/selection";
import { flipPoint } from "@/utils/transform";
import { getShapeCenter } from "@/utils/position";

interface ShapeToFlip {
  layerId: string | null;
  index: number | null;
  type: "line" | "circle" | "ellipse" | "curve" | null;
}

export const useFlip = () => {
  const [flipModalVisible, setFlipModalVisible] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState<Point | null>(null);
  const [shapeToFlip, setShapeToFlip] = useState<ShapeToFlip | null>(null);

  const { lines, setLines, circles, setCircles, ellipses, setEllipses, curves, setCurves, layers, setLayers, setSelectedLayerId, setLog } = useTab();

  const handleFlipClick = useCallback(
    (x: number, y: number) => {
      const clickedShape = findShapeAtPoint(x, y, lines, circles, ellipses, curves, layers);
      if (clickedShape.layerId) {
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
      }
    },
    [lines, circles, ellipses, curves, layers, setLayers, setSelectedLayerId]
  );

  const flipShape = useCallback(
    (direction: "horizontal" | "vertical") => {
      if (!shapeToFlip) return;

      const { layerId, index, type } = shapeToFlip;
      switch (type) {
        case "line":
          setLines((prevLines) =>
            prevLines.map((line, i) =>
              i === index && line.layerId === layerId
                ? {
                    ...line,
                    start: flipPoint(line.start, direction, getShapeCenter(line, "line")),
                    end: flipPoint(line.end, direction, getShapeCenter(line, "line")),
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
          // Circles don't change visually when flipped
          break;
        case "ellipse":
          setEllipses((prevEllipses) =>
            prevEllipses.map((ellipse, i) =>
              i === index && ellipse.layerId === layerId
                ? {
                    ...ellipse,
                    center: flipPoint(ellipse.center, direction, getShapeCenter(ellipse, "ellipse")),
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
                    p0: flipPoint(curve.p0, direction, getShapeCenter(curve, "curve")),
                    p1: flipPoint(curve.p1, direction, getShapeCenter(curve, "curve")),
                    p2: flipPoint(curve.p2, direction, getShapeCenter(curve, "curve")),
                    p3: flipPoint(curve.p3, direction, getShapeCenter(curve, "curve")),
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
        default:
          break;
      }

      setFlipModalVisible(false);
      setShapeToFlip(null);
    },
    [shapeToFlip, setLines, setCircles, setEllipses, setCurves, setLog]
  );

  return { flipModalVisible, setFlipModalVisible, modalPosition, shapeToFlip, handleFlipClick, flipShape };
};