import React from "react";
import { Point } from "@/interface/shape";
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
  currentProject: string;
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
    modalPosition,
    flipShape,
    handleMouseDown,
    handleMouseUp,
  } = useCanvasEvents({ ...props, currentProject: props.currentProject });

  const { tool, zoomLevel, setZoomLevel, zoomOffsetX, setZoomOffsetX, zoomOffsetY, setZoomOffsetY } = useTab();

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tool === Tools.Zoom && e.shiftKey) {
      const rect = e.currentTarget.getBoundingClientRect();
      // Get mouse position relative to the canvas element
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const oldZoom = zoomLevel;
      // Ensure newZoom doesn't go below 1.0
      const newZoom = Math.max(1.0, Math.min(10, zoomLevel + (e.deltaY < 0 ? 0.1 : -0.1)));
      
      if (newZoom !== oldZoom) {
        // If zooming out to the original level, reset offsets to 0
        if (newZoom === 1.0) {
          setZoomOffsetX(0);
          setZoomOffsetY(0);
        } else {
          // Calculate the scale factor
          const scale = newZoom / oldZoom;
          
          // Calculate new offsets to keep the point under the mouse fixed
          setZoomOffsetX(mouseX - scale * (mouseX - zoomOffsetX));
          setZoomOffsetY(mouseY - scale * (mouseY - zoomOffsetY));
        }
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
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
      </div>
    </>
  );
};

export default CanvasEvents;
