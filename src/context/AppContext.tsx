import { Canvas } from "@/interface/canvas";
import {
  Circle,
  Curve,
  Ellipse,
  Line,
  Point,
  ShapeMode,
} from "@/interface/shape";
import { Layer, Tabs } from "@/interface/tab";
import { Tools } from "@/interface/tool";
import { createContext, useContext, useState, ReactNode, useRef } from "react";

interface TabContextType {
  modalType: "new" | "import" | "export";
  setModalType: (value: "new" | "import" | "export") => void;
  openHomeModal: boolean;
  setOpenHomeModal: (value: boolean) => void;
  tab: string;
  setTab: (value: string) => void;
  tool: Tools;
  setTool: (tool: Tools) => void;
  showGrid: boolean;
  setShowGrid: (showGrid: boolean) => void;
  snapEnabled: boolean;
  setSnapEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (layerId: string | null) => void;
  canvasSize: Canvas;
  setCanvasSize: (canvasSize: Canvas) => void;
  shape: ShapeMode;
  setShape: (shape: ShapeMode) => void;
  points: Point[];
  setPoints: React.Dispatch<React.SetStateAction<Point[]>>;
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  circles: Circle[];
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  curves: Curve[];
  setCurves: React.Dispatch<React.SetStateAction<Curve[]>>;
  ellipses: Ellipse[];
  setEllipses: React.Dispatch<React.SetStateAction<Ellipse[]>>;
  // Add other shape types as needed
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  importTimestamp?: number;
  setImportTimestamp?: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<"new" | "import" | "export">(
    "new"
  );
  const [openHomeModal, setOpenHomeModal] = useState<boolean>(false);

  const [tab, setTab] = useState<string>(Tabs.Shape);
  const [tool, setTool] = useState<Tools>(Tools.Draw);

  const [snapEnabled, setSnapEnabled] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<Canvas>({
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
  });
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [curves, setCurves] = useState<Curve[]>([]);
  const [ellipses, setEllipses] = useState<Ellipse[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [importTimestamp, setImportTimestamp] = useState<number | undefined>(
    undefined
  );

  const [shape, setShape] = useState<ShapeMode>(ShapeMode.Line);
  const value = {
    modalType,
    setModalType,
    openHomeModal,
    setOpenHomeModal,
    tab,
    setTab,
    tool,
    setTool,
    showGrid,
    setShowGrid,
    snapEnabled,
    setSnapEnabled,
    layers,
    setLayers,
    selectedLayerId,
    setSelectedLayerId,
    canvasSize,
    setCanvasSize,
    shape,
    setShape,
    points,
    setPoints,
    lines,
    setLines,
    circles,
    setCircles,
    curves,
    setCurves,
    ellipses,
    setEllipses,
    canvasRef,
    importTimestamp,
    setImportTimestamp,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};