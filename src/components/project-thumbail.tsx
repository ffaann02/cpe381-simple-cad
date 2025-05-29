import React, { useEffect, useRef } from "react";
import { Line, Circle, Ellipse, Curve, Polygon } from "@/interface/shape"; // Import your shape types
import { Layer } from "@/interface/tab";

interface ProjectThumbnailProps {
  projectTitle: string;
}

const ProjectThumbnail: React.FC<ProjectThumbnailProps> = ({ projectTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set a fixed size for the thumbnail canvas
    canvas.width = 300; // Adjust as needed
    canvas.height = 200; // Adjust as needed

    // Clear previous drawing and set a white background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const savedState = localStorage.getItem(`cad_drawing_state_${projectTitle}`);
    if (!savedState) {
      // Draw fallback if no data
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "16px Arial";
      ctx.fillStyle = "#888888";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No Preview", canvas.width / 2, canvas.height / 2);
      return;
    }

    try {
      const parsedState = JSON.parse(savedState);

      const lines: Line[] = parsedState.lines || [];
      const circles: Circle[] = parsedState.circles || [];
      const ellipses: Ellipse[] = parsedState.ellipses || [];
      const curves: Curve[] = parsedState.curves || [];
      const polygons: Polygon[] = parsedState.polygons || [];
      const layers: Layer[] = parsedState.layers || [];
      const canvasSize = parsedState.canvasSize || { width: 800, height: 600, backgroundColor: "#ffffff" };

      // --- Calculate scaling and translation for fitting content ---
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      // Helper to update bounds for a point
      const updateBounds = (x: number, y: number) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      };

      // Calculate bounds for all shapes
      [...lines, ...circles, ...ellipses, ...curves, ...polygons].forEach(shape => {
        if ('start' in shape && 'end' in shape) { // Line
          updateBounds(shape.start.x, shape.start.y);
          updateBounds(shape.end.x, shape.end.y);
        } else if ('center' in shape && 'radius' in shape) { // Circle
          updateBounds(shape.center.x - shape.radius, shape.center.y - shape.radius);
          updateBounds(shape.center.x + shape.radius, shape.center.y + shape.radius);
        } else if ('center' in shape && 'radiusX' in shape) { // Ellipse
          updateBounds(shape.center.x - shape.radiusX, shape.center.y - shape.radiusY);
          updateBounds(shape.center.x + shape.radiusX, shape.center.y + shape.radiusY);
        } else if ('points' in shape && Array.isArray(shape.points)) { // Curve or Polygon
          shape.points.forEach(p => updateBounds(p.x, p.y));
        }
      });

      // If no shapes, just use the canvas size for scaling
      if (minX === Infinity) {
        minX = 0; minY = 0; maxX = canvasSize.width; maxY = canvasSize.height;
      }

      const drawingWidth = maxX - minX;
      const drawingHeight = maxY - minY;

      const padding = 20; // Padding around the drawing in the thumbnail
      const targetWidth = canvas.width - padding * 2;
      const targetHeight = canvas.height - padding * 2;

      let scale = 1;
      let offsetX = 0;
      let offsetY = 0;

      if (drawingWidth > 0 && drawingHeight > 0) {
        const scaleX = targetWidth / drawingWidth;
        const scaleY = targetHeight / drawingHeight;
        scale = Math.min(scaleX, scaleY);

        // Center the drawing in the thumbnail
        offsetX = (canvas.width - drawingWidth * scale) / 2 - minX * scale;
        offsetY = (canvas.height - drawingHeight * scale) / 2 - minY * scale;
      } else {
        // If drawing is empty, center the original canvas area
        scale = Math.min(targetWidth / canvasSize.width, targetHeight / canvasSize.height);
        offsetX = (canvas.width - canvasSize.width * scale) / 2;
        offsetY = (canvas.height - canvasSize.height * scale) / 2;
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // Restore transform before drawing shapes for correct positioning
      ctx.restore();
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);


      // --- Drawing Logic ---
      // Filter visible layers and their shapes
      const visibleLayers = layers.filter(layer => layer.isVisible);
      const visibleLayerIds = new Set(visibleLayers.map(layer => layer.id));

      const getLayerColor = (layerId: string) => {
        const layer = layers.find(l => l.id === layerId);
        return layer?.color || "#000000"; // Default to black if layer not found or color not set
      };

      // Draw Lines
      lines.forEach((line) => {
        if (visibleLayerIds.has(line.layerId)) {
          ctx.beginPath();
          ctx.moveTo(line.start.x, line.start.y);
          ctx.lineTo(line.end.x, line.end.y);
          ctx.strokeStyle = getLayerColor(line.layerId);
          ctx.lineWidth = line.strokeWidth || 1;
          ctx.stroke();
        }
      });

      // Draw Circles
      circles.forEach((circle) => {
        if (visibleLayerIds.has(circle.layerId)) {
          ctx.beginPath();
          ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
          ctx.strokeStyle = getLayerColor(circle.layerId);
          ctx.lineWidth = circle.strokeWidth || 1;
          ctx.stroke();
        }
      });

      // Draw Ellipses
      ellipses.forEach((ellipse) => {
        if (visibleLayerIds.has(ellipse.layerId)) {
          ctx.beginPath();
          ctx.ellipse(
            ellipse.center.x,
            ellipse.center.y,
            ellipse.radiusX,
            ellipse.radiusY,
            ellipse.rotation,
            0,
            2 * Math.PI
          );
          ctx.strokeStyle = getLayerColor(ellipse.layerId);
          ctx.lineWidth = ellipse.strokeWidth || 1;
          ctx.stroke();
        }
      });

      // Draw Curves (assuming they are polylines for simplicity in thumbnail)
      curves.forEach((curve) => {
        if (visibleLayerIds.has(curve.layerId) && curve.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(curve.points[0].x, curve.points[0].y);
          for (let i = 1; i < curve.points.length; i++) {
            ctx.lineTo(curve.points[i].x, curve.points[i].y);
          }
          ctx.strokeStyle = getLayerColor(curve.layerId);
          ctx.lineWidth = curve.strokeWidth || 1;
          ctx.stroke();
        }
      });

      // Draw Polygons
      polygons.forEach((polygon) => {
        if (visibleLayerIds.has(polygon.layerId) && polygon.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
          for (let i = 1; i < polygon.points.length; i++) {
            ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
          }
          ctx.closePath(); // Close the polygon path
          ctx.strokeStyle = getLayerColor(polygon.layerId);
          ctx.lineWidth = polygon.strokeWidth || 1;
          ctx.stroke();
          if (polygon.fillColor) {
            ctx.fillStyle = polygon.fillColor;
            ctx.fill();
          }
        }
      });

      ctx.restore(); // Restore the canvas state

    } catch (error) {
      console.error(`Failed to draw thumbnail for "${projectTitle}":`, error);
      // Draw error fallback
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffcccc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "14px Arial";
      ctx.fillStyle = "#cc0000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Error Loading", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText("Preview", canvas.width / 2, canvas.height / 2 + 10);
    }
  }, [projectTitle]); // Re-render if projectTitle changes

  return (
    <canvas
      ref={canvasRef}
      className="object-contain h-full w-full border border-neutral-300"
    />
  );
};

export default ProjectThumbnail;