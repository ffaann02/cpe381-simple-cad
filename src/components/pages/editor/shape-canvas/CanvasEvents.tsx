import React from "react";
import { Point } from "@/interface/shape";
import DrawPolygonModal from "@/components/ui/modal/canvas/DrawPolygonModal";
import RotateModal from "@/components/ui/modal/canvas/RotateModal";
import EraseShapeModal from "@/components/ui/modal/canvas/EraseShapeModal";
import FlipShapeModal from "@/components/ui/modal/canvas/FlipShapeModal";
import { useCanvasEvents } from "@/hooks/useCanvas";
import { useTab } from "@/context/AppContext";
import { Tools } from "@/interface/tool";

interface CanvasEventsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setMousePos: React.Dispatch<React.SetStateAction<Point | null>>;
  isMoving: boolean;
  setIsMoving: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: {
    layerId: string | null;
    index: number | null;
    type: "line" | "circle" | "ellipse" | "curve" | null;
    offset: Point;
  } | null;
  setSelectedShape: React.Dispatch<
    React.SetStateAction<{
      layerId: string | null;
      index: number | null;
      type: "line" | "circle" | "ellipse" | "curve" | null;
      offset: Point;
    } | null>
  >;
}

const CanvasEvents: React.FC<CanvasEventsProps> = (props) => {
  const {
    handleClick,
    handleMouseMove,
    erasingShape,
    erasingModalVisible,
    setErasingModalVisible,
    deleteShape,
    popoverRef,
    rotatePopoverOpen,
    setRotatePopoverOpen,
    rotationAngle,
    setRotationAngle,
    rotatingShape,
    setRotatingShape,
    handleRotateShape,
    rotatePopoverRef,
    flipModalVisible,
    setFlipModalVisible,
    modalPosition,
    shapeToFlip,
    flipShape,
    willingToDrawPolygon,
    setWillingToDrawPolygon,
  } = useCanvasEvents(props);

  const { points, polygonCornerNumber, setPolygonCornerNumber, tool, zoomLevel, setZoomLevel, zoomOffsetX, setZoomOffsetX, zoomOffsetY, setZoomOffsetY } = useTab();

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tool === Tools.Zoom && e.shiftKey) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const oldZoom = zoomLevel;
      const newZoom = Math.max(1.0, Math.min(10, zoomLevel + (e.deltaY < 0 ? 0.1 : -0.1)));
      if (newZoom !== oldZoom) {
        // Adjust offset so the point under the mouse stays fixed
        const scale = newZoom / oldZoom;
        setZoomOffsetX(mouseX - scale * (mouseX - zoomOffsetX));
        setZoomOffsetY(mouseY - scale * (mouseY - zoomOffsetY));
        setZoomLevel(newZoom);
      }
    }
  };

  return (
    <>
      <div
        className="absolute top-0 left-0 w-full h-full"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      >
        {flipModalVisible && modalPosition && (
          <FlipShapeModal
            modalPosition={modalPosition}
            flipShape={flipShape}
          />
        )}
        {erasingShape && erasingModalVisible && (
          <EraseShapeModal
            erasingShape={erasingShape}
            setErasingShape={() => setErasingModalVisible(false)}
            deleteShape={deleteShape}
            popoverRef={popoverRef}
            setErasingModalVisible={setErasingModalVisible}
          />
        )}
        {rotatingShape && rotatePopoverOpen && (
          <RotateModal
            rotatePopoverRef={rotatePopoverRef}
            rotatingShape={rotatingShape}
            rotationAngle={rotationAngle}
            setRotationAngle={setRotationAngle}
            handleRotateShape={handleRotateShape}
            setRotatePopoverOpen={setRotatePopoverOpen}
            setRotatingShape={setRotatingShape}
          />
        )}
        {willingToDrawPolygon && points.length > 0 && (
          <DrawPolygonModal
            points={points}
            polygonCornerNumber={polygonCornerNumber}
            setPolygonCornerNumber={setPolygonCornerNumber}
            setWillingToDrawPolygon={setWillingToDrawPolygon}
          />
        )}
      </div>
    </>
  );
};

export default CanvasEvents;