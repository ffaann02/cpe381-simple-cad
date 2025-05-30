// hooks/useSelectionAndMovement.ts
import { useCallback } from "react";
import { Point } from "@/interface/shape";
import { useTab } from "@/context/AppContext";
import { findShapeAtPoint } from "@/utils/selection";

interface UseSelectionAndMovementProps {
  isMoving: boolean;
  setIsMoving: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: {
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
    offset: Point;
  } | null;
  setSelectedShape: React.Dispatch<
    React.SetStateAction<{
      layerId: string | null;
      index: number | null;
      type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
      offset: Point;
    } | null>
  >;
  setMousePos: React.Dispatch<React.SetStateAction<Point | null>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentProject: string;
}

export const useSelectionAndMovement = ({
  isMoving,
  setIsMoving,
  selectedShape,
  setSelectedShape,
  canvasRef,
  currentProject,
}: UseSelectionAndMovementProps) => {
  const { lines, setLines, circles, setCircles, ellipses, setEllipses, curves, setCurves, polygons, setPolygons, layers, setLayers, setSelectedLayerId, setLog } = useTab();

  const highlightShape = useCallback(
    (clickedShape: {
      layerId: string | null;
      index: number | null;
      type: "line" | "circle" | "ellipse" | "curve" | "polygon" | null;
    }) => {
      const updatedLayers = layers.map((layer) => ({
        ...layer,
        is_selected: layer.id === clickedShape.layerId,
      }));
      setLayers(updatedLayers);
      setSelectedLayerId(clickedShape.layerId);
    },
    [layers, setLayers, setSelectedLayerId]
  );

  const cancelHighlightShape = useCallback(() => {
    const updatedLayers = layers.map((layer) => ({
      ...layer,
      is_selected: false,
    }));
    setLayers(updatedLayers);
    setSelectedLayerId(null);
  }, [layers, setLayers, setSelectedLayerId]);

  const handleSelectClick = useCallback(
    (x: number, y: number) => {
      const clickedShape = findShapeAtPoint(x, y, lines, circles, ellipses, curves, polygons, layers);
      if (clickedShape.layerId) {
        highlightShape(clickedShape);
        setSelectedShape({
          ...clickedShape,
          offset: { x: 0, y: 0 }
        });
      } else {
        cancelHighlightShape();
        setSelectedShape(null);
      }
    },
    [lines, circles, ellipses, curves, polygons, layers, highlightShape, cancelHighlightShape, setSelectedShape]
  );

  const handleMoveClick = useCallback(
    (x: number, y: number) => {
      const clickedShape = findShapeAtPoint(x, y, lines, circles, ellipses, curves, polygons, layers);
      if (clickedShape.layerId) {
        if (isMoving) {
          cancelHighlightShape();
          setSelectedLayerId(null);
          setIsMoving(false);
          setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
              const thumbnail = canvas.toDataURL('image/png');
              const stateToSave = {
                lines,
                circles,
                curves,
                ellipses,
                polygons,
                layers,
                canvasSize: { width: canvas.width, height: canvas.height, backgroundColor: "#ffffff" },
                lastSaved: new Date().toISOString(),
                thumbnail,
              };
              localStorage.setItem(`cad_drawing_state_${currentProject}`, JSON.stringify(stateToSave));
            }
          }, 0);
        } else {
          setIsMoving(true);
          let shapePosition: Point = { x: 0, y: 0 };
          switch (clickedShape.type) {
            case "line":
              shapePosition = lines[clickedShape.index!].start;
              break;
            case "circle":
              shapePosition = circles[clickedShape.index!].center;
              break;
            case "ellipse":
              shapePosition = ellipses[clickedShape.index!].center;
              break;
            case "curve":
              shapePosition = curves[clickedShape.index!].p0;
              break;
            case "polygon":
              shapePosition = polygons[clickedShape.index!].points[0];
              break;
          }
          highlightShape(clickedShape);
          setSelectedShape({
            ...clickedShape,
            offset: {
              x: x - shapePosition.x,
              y: y - shapePosition.y,
            },
          });
        }
      } else {
        cancelHighlightShape();
        setSelectedShape(null);
      }
    },
    [
      isMoving,
      lines,
      circles,
      ellipses,
      curves,
      polygons,
      layers,
      setIsMoving,
      highlightShape,
      setSelectedShape,
      setSelectedLayerId,
      cancelHighlightShape,
      canvasRef,
      currentProject,
    ]
  );

  const handleMoveMouseMove = useCallback(
    (x: number, y: number) => {
      if (isMoving && selectedShape) {
        const newX = x - selectedShape.offset.x;
        const newY = y - selectedShape.offset.y;

        switch (selectedShape.type) {
          case "line":
            const updatedLines = lines.map((line, index) =>
              index === selectedShape.index
                ? {
                    ...line,
                    start: { x: newX, y: newY },
                    end: {
                      x: line.end.x + (newX - line.start.x),
                      y: line.end.y + (newY - line.start.y),
                    },
                  }
                : line
            );
            setLines(updatedLines);
            setLog((prev) => [
              ...prev,
              {
                type: "info",
                message: `Line ${selectedShape.index} moved to (${newX}, ${newY})`,
                timestamp: Date.now(),
              },
            ]);
            break;
          case "circle":
            const updatedCircles = circles.map((circle, index) =>
              index === selectedShape.index ? { ...circle, center: { x: newX, y: newY } } : circle
            );
            setCircles(updatedCircles);
            setLog((prev) => [
              ...prev,
              {
                type: "info",
                message: `Circle ${selectedShape.index} moved to (${newX}, ${newY})`,
                timestamp: Date.now(),
              },
            ]);
            break;
          case "ellipse":
            const updatedEllipses = ellipses.map((ellipse, index) =>
              index === selectedShape.index ? { ...ellipse, center: { x: newX, y: newY } } : ellipse
            );
            setEllipses(updatedEllipses);
            setLog((prev) => [
              ...prev,
              {
                type: "info",
                message: `Ellipse ${selectedShape.index} moved to (${newX}, ${newY})`,
                timestamp: Date.now(),
              },
            ]);
            break;
          case "curve":
            const updatedCurves = curves.map((curve, index) => {
              if (index === selectedShape.index) {
                const dx = newX - curve.p0.x;
                const dy = newY - curve.p0.y;
                return {
                  ...curve,
                  p0: { x: newX, y: newY },
                  p1: { x: curve.p1.x + dx, y: curve.p1.y + dy },
                  p2: { x: curve.p2.x + dx, y: curve.p2.y + dy },
                  p3: { x: curve.p3.x + dx, y: curve.p3.y + dy },
                };
              }
              return curve;
            });
            setCurves(updatedCurves);
            setLog((prev) => [
              ...prev,
              {
                type: "info",
                message: `Curve ${selectedShape.index} moved to (${newX}, ${newY})`,
                timestamp: Date.now(),
              },
            ]);
            break;
          case "polygon":
            const updatedPolygons = polygons.map((polygon, index) => {
              if (index === selectedShape.index) {
                const dx = newX - polygon.points[0].x;
                const dy = newY - polygon.points[0].y;
                const newPoints = polygon.points.map(point => ({
                  x: point.x + dx,
                  y: point.y + dy,
                }));
                return { ...polygon, points: newPoints };
              }
              return polygon;
            });
            setPolygons(updatedPolygons);
            setLog((prev) => [
              ...prev,
              {
                type: "info",
                message: `Polygon ${selectedShape.index} moved to (${newX}, ${newY})`,
                timestamp: Date.now(),
              },
            ]);
            break;
        }
      } else {
        const canvas = canvasRef.current;
        if (canvas) {
          const hoverInfo = findShapeAtPoint(x, y, lines, circles, ellipses, curves, polygons, layers);
          if (hoverInfo.layerId) {
            canvas.style.cursor = "move";
          } else {
            canvas.style.cursor = "default";
          }
        }
      }
    },
    [isMoving, selectedShape, lines, circles, ellipses, curves, polygons, layers, setLines, setCircles, setEllipses, setCurves, setPolygons, setLog, canvasRef]
  );

  return { handleSelectClick, handleMoveClick, handleMoveMouseMove, highlightShape, cancelHighlightShape };
};