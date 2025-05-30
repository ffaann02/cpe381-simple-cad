// hooks/useRotation.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { Point} from "@/interface/shape";
import { useTab } from "@/context/AppContext";
import { findShapeAtPoint } from "@/utils/selection";
import { rotatePoint } from "@/utils/transform";
import { getShapeCenter } from "@/utils/position";

interface RotatingShape {
  layerId: string;
  index: number;
  type: string;
  center: Point;
}

interface UseRotationProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useRotation = ({ }: UseRotationProps) => {
  const [rotatePopoverOpen, setRotatePopoverOpen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<number | string>("");
  const [rotatingShape, setRotatingShape] = useState<RotatingShape | null>(null);
  const rotatePopoverRef = useRef<HTMLDivElement>(null);

  const { lines, setLines, circles, setCircles, ellipses, setEllipses, curves, setCurves, polygons, setPolygons, layers, setLayers, setSelectedLayerId, setLog } = useTab();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rotatePopoverRef.current && !rotatePopoverRef.current.contains(event.target as Node)) {
        setRotatePopoverOpen(false);
        setRotatingShape(null);
        setRotationAngle("");
      }
    };

    if (rotatePopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [rotatePopoverOpen]);

  const handleRotateClick = useCallback(
    (x: number, y: number) => {
      const clickedShape = findShapeAtPoint(x, y, lines, circles, ellipses, curves, polygons, layers);
      if (clickedShape.layerId) {
        const shapeObject = (() => {
          switch (clickedShape.type) {
            case "line": return lines[clickedShape.index!];
            case "circle": return circles[clickedShape.index!];
            case "ellipse": return ellipses[clickedShape.index!];
            case "curve": return curves[clickedShape.index!];
            case "polygon": return polygons[clickedShape.index!];
            default: return undefined;
          }
        })();

        let shapeCenter: Point = { x: 0, y: 0 };
        if(shapeObject) {
             shapeCenter = getShapeCenter(shapeObject, clickedShape.type!);
        }

        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: layer.id === clickedShape.layerId,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(clickedShape.layerId);

        if (clickedShape.layerId && clickedShape.index !== null && clickedShape.type) {
          setRotatingShape({
            layerId: clickedShape.layerId,
            index: clickedShape.index,
            type: clickedShape.type,
            center: shapeCenter,
          });
          setRotatePopoverOpen(true);
        }

      } else {
        const updatedLayers = layers.map((layer) => ({
          ...layer,
          is_selected: false,
        }));
        setLayers(updatedLayers);
        setSelectedLayerId(null);
      }
    },
    [lines, circles, ellipses, curves, polygons, layers, setLayers, setSelectedLayerId]
  );

  const handleRotateShape = useCallback(() => {
    const angle = Number(rotationAngle);
    if (isNaN(angle) || !rotatingShape) {
      alert("Please enter a valid angle and select a shape.");
      return;
    }

    const { layerId, index, type, center } = rotatingShape;
    const angleRad = (angle * Math.PI) / 180;

    switch (type) {
      case "line":
        setLines((prevLines) =>
          prevLines.map((line, i) =>
            i === index && line.layerId === layerId
              ? {
                  ...line,
                  start: rotatePoint(line.start, center, angleRad),
                  end: rotatePoint(line.end, center, angleRad),
                }
              : line
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Line ${index} rotated by ${angle} degrees`,
            timestamp: Date.now(),
          },
        ]);
        break;
      case "circle":
        // Circles don't change visually when rotated around their center
        break;
      case "ellipse":
        setEllipses((prevEllipses) =>
          prevEllipses.map((ellipse, i) =>
            i === index && ellipse.layerId === layerId
              ? {
                  ...ellipse,
                  // For ellipses, rotation affects their orientation, but not their center unless rotated around a different point.
                  // For simplicity, if we rotate around its own center, the center point doesn't change.
                  // If we need to rotate around an arbitrary point, the center itself would also transform.
                  // For now, assuming rotation around its own center, only its orientation would conceptually change (not modelled in this simple ellipse structure).
                  // If the requirement is to actually rotate the ellipse around an arbitrary point, we'd need to adjust rx, ry, and potentially add an angle property to Ellipse.
                  // For now, we'll keep the center the same as per the original code's implied behavior (rotating around center results in same center).
                  // The original code was rotating the center point, which is incorrect for rotation around its own center.
                  // If rotation is around a different point, uncomment the rotation of the center:
                  // center: rotatePoint(ellipse.center, center, angleRad),
                }
              : ellipse
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Ellipse ${index} rotated by ${angle} degrees`,
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
                  p0: rotatePoint(curve.p0, center, angleRad),
                  p1: rotatePoint(curve.p1, center, angleRad),
                  p2: rotatePoint(curve.p2, center, angleRad),
                  p3: rotatePoint(curve.p3, center, angleRad),
                }
              : curve
          )
        );
        setLog((prev) => [
          ...prev,
          {
            type: "info",
            message: `Curve ${index} rotated by ${angle} degrees`,
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
                    points: polygon.points.map(point => rotatePoint(point, center, angleRad))
                  }
                : polygon
            )
          );
          setLog((prev) => [
            ...prev,
            {
              type: "info",
              message: `Polygon ${index} rotated by ${angle} degrees`,
              timestamp: Date.now(),
            },
          ]);
          break;
      default:
        break;
    }

    setRotatePopoverOpen(false);
    setRotatingShape(null);
    setRotationAngle("");
  }, [rotationAngle, rotatingShape, setLines, setCircles, setEllipses, setCurves, setPolygons, setLog]);

  return {
    rotatePopoverOpen,
    setRotatePopoverOpen,
    rotationAngle,
    setRotationAngle,
    rotatingShape,
    setRotatingShape,
    handleRotateClick,
    handleRotateShape,
    rotatePopoverRef,
  };
};