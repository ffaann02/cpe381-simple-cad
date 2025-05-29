import { Line, Circle, Ellipse, Curve, Polygon } from "@/interface/shape";
import { Layer } from "@/interface/tab";
import { Tools } from "@/interface/tool";
import { Canvas } from "@/interface/canvas";

export interface TabContextType {
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  circles: Circle[];
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  ellipses: Ellipse[];
  setEllipses: React.Dispatch<React.SetStateAction<Ellipse[]>>;
  curves: Curve[];
  setCurves: React.Dispatch<React.SetStateAction<Curve[]>>;
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerId: string | null;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTool: Tools;
  setSelectedTool: React.Dispatch<React.SetStateAction<Tools>>;
  canvasSize: Canvas;
  setCanvasSize: React.Dispatch<React.SetStateAction<Canvas>>;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  projectId: string;
} 