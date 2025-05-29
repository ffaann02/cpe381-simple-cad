import { Canvas } from "@/interface/canvas";
import { LogEntry } from "@/interface/log";
import { Project } from "@/interface/project";
import {
  Circle,
  Curve,
  Ellipse,
  Line,
  Point,
  Polygon,
  ShapeMode,
} from "@/interface/shape";
import { Layer, Tabs } from "@/interface/tab";
import { Tools } from "@/interface/tool";
import { message } from "antd";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useCallback,
  useEffect,
} from "react";

interface HistoryState {
  lines: Line[];
  circles: Circle[];
  curves: Curve[];
  ellipses: Ellipse[];
  polygons: Polygon[];
  layers: Layer[];
  canvasSize: Canvas;
}

interface TabContextType {
  modalType: "new" | "import" | "export";
  setModalType: (value: "new" | "import" | "export") => void;
  openHomeModal: boolean;
  setOpenHomeModal: (value: boolean) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProject: string | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<string | null>>;
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
  polygons: Polygon[];
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  polygonCornerNumber: number;
  setPolygonCornerNumber: React.Dispatch<React.SetStateAction<number>>;
  // Add other shape types as needed
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  importTimestamp?: number;
  setImportTimestamp?: React.Dispatch<React.SetStateAction<number | undefined>>;
  log: LogEntry[];
  setLog: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  addLogEntry: (entry: LogEntry) => void;
  resetCanvasState: () => void; // Function to reset all drawing states
  handleImportFile: (file: File) => void; // Function to handle file import
  handleUndo: () => void;
  handleRedo: () => void;
  saveState: () => void;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  zoomOffsetX: number;
  setZoomOffsetX: (x: number) => void;
  zoomOffsetY: number;
  setZoomOffsetY: (y: number) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<"new" | "import" | "export">(
    "new"
  );
  const [openHomeModal, setOpenHomeModal] = useState<boolean>(false);

  const [tab, setTab] = useState<string>(Tabs.File);
  const [tool, setTool] = useState<Tools>(Tools.Draw);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  const [snapEnabled, setSnapEnabled] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<Canvas>({
    width: 800,
    height: 600,
    backgroundColor: "white",
  });
  const [points, setPoints] = useState<Point[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [curves, setCurves] = useState<Curve[]>([]);
  const [ellipses, setEllipses] = useState<Ellipse[]>([]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [polygonCornerNumber, setPolygonCornerNumber] = useState<number>(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [importTimestamp, setImportTimestamp] = useState<number | undefined>(
    undefined
  );

  const [shape, setShape] = useState<ShapeMode>(ShapeMode.Line);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [zoomOffsetX, setZoomOffsetX] = useState<number>(0);
  const [zoomOffsetY, setZoomOffsetY] = useState<number>(0);

  const history = useRef<HistoryState[]>([]);
  const currentIndex = useRef<number>(-1);

  // Initialize history with current state when component mounts
  useEffect(() => {
    const initialState: HistoryState = {
      lines: [],
      circles: [],
      curves: [],
      ellipses: [],
      polygons: [],
      layers: [],
      canvasSize: { ...canvasSize },
    };
    history.current = [initialState];
    currentIndex.current = 0;
  }, []); // Empty dependency array means this runs once on mount

  const arraysEqual = (a: any[], b: any[]) => JSON.stringify(a) === JSON.stringify(b);
  const objectsEqual = (a: object, b: object) => JSON.stringify(a) === JSON.stringify(b);

  const saveState = useCallback(() => {
    const currentState: HistoryState = {
      lines: [...lines],
      circles: [...circles],
      curves: [...curves],
      ellipses: [...ellipses],
      polygons: [...polygons],
      layers: [...layers],
      canvasSize: { ...canvasSize },
    };

    if (currentIndex.current < history.current.length - 1) {
      history.current = history.current.slice(0, currentIndex.current + 1);
    }

    const lastState = history.current[currentIndex.current];
    const hasChanges = !lastState ||
      !arraysEqual(lastState.lines, currentState.lines) ||
      !arraysEqual(lastState.circles, currentState.circles) ||
      !arraysEqual(lastState.curves, currentState.curves) ||
      !arraysEqual(lastState.ellipses, currentState.ellipses) ||
      !arraysEqual(lastState.polygons, currentState.polygons) ||
      !arraysEqual(lastState.layers, currentState.layers) ||
      !objectsEqual(lastState.canvasSize, currentState.canvasSize);

    if (hasChanges) {
      history.current.push(currentState);
      currentIndex.current = history.current.length - 1;
      if (history.current.length > 50) {
        history.current = history.current.slice(-50);
        currentIndex.current = history.current.length - 1;
      }
    }
  }, [lines, circles, curves, ellipses, polygons, layers, canvasSize]);

  const handleUndo = useCallback(() => {
    if (currentIndex.current > 0) {
      currentIndex.current--;
      const previousState = history.current[currentIndex.current];
      
      // Only update the states that have changed
      if (previousState.lines.length !== lines.length) {
        setLines(previousState.lines);
      }
      if (previousState.circles.length !== circles.length) {
        setCircles(previousState.circles);
      }
      if (previousState.curves.length !== curves.length) {
        setCurves(previousState.curves);
      }
      if (previousState.ellipses.length !== ellipses.length) {
        setEllipses(previousState.ellipses);
      }
      if (previousState.polygons.length !== polygons.length) {
        setPolygons(previousState.polygons);
      }
      if (previousState.layers.length !== layers.length) {
        setLayers(previousState.layers);
      }
      
      setLog((prev) => [
        ...prev,
        {
          type: "info",
          message: "Undo operation performed",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [lines, circles, curves, ellipses, polygons, layers, setLines, setCircles, setCurves, setEllipses, setPolygons, setLayers, setLog]);

  const handleRedo = useCallback(() => {
    if (currentIndex.current < history.current.length - 1) {
      currentIndex.current++;
      const nextState = history.current[currentIndex.current];

      setLines(nextState.lines);
      setCircles(nextState.circles);
      setCurves(nextState.curves);
      setEllipses(nextState.ellipses);
      setPolygons(nextState.polygons);
      setLayers(nextState.layers);
      setCanvasSize(nextState.canvasSize);

      setLog((prev) => [
        ...prev,
        {
          type: "info",
          message: "Redo operation performed",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [setLines, setCircles, setCurves, setEllipses, setPolygons, setLayers, setCanvasSize, setLog]);

  const addLogEntry = (entry: LogEntry) => {
    setLog((prevLog) => [...prevLog, entry]);
  };

  // Function to reset all relevant canvas states
  const resetCanvasState = useCallback(() => {
    setPoints([]);
    setLines([]);
    setCircles([]);
    setCurves([]);
    setEllipses([]);
    setPolygons([]);
    // Reset layers to a default if you want to start fresh, or clear them
    setLayers([]);
    // setSelectedLayerId("default-layer-id"); // Reset selected layer
    // Optionally reset other drawing-related states like shape, tool, etc.
    setShape(ShapeMode.Line);
    setTool(Tools.Draw);
  }, []);

  const handleImportFile = (file: File) => {
    // Get project name from file name (remove extension)
    const projectName = file.name.replace(/\.(cad|txt)$/i, "");
    // Check if project already exists
    const existingProject = projects.find((p) => p.name === projectName);

    // If not already in projects, add it
    if (!existingProject) {
      setProjects((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: projectName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }

    setCurrentProject(projectName);

    // Clear current canvas state
    setLines([]);
    setCircles([]);
    setEllipses([]);
    setCurves([]);
    setLayers([]);
    if (canvasRef?.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      }
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const linesFromFile: Line[] = [];
      const circlesFromFile: Circle[] = [];
      const ellipsesFromFile: Ellipse[] = [];
      const curvesFromFile: Curve[] = [];
      const newLayers: Layer[] = [];

      let layerIdCounter = 1;

      text?.split("\n").forEach((line) => {
        const parts = line
          .trim()
          .split(",")
          .map((p) => p.trim());
        const command = parts[0]?.toUpperCase();

        const addLayer = (layerId: string, name: string) => {
          if (
            !newLayers.some((layer) => layer.id === layerId) &&
            !layers.some((layer) => layer.id === layerId)
          ) {
            newLayers.push({
              id: layerId,
              name,
              is_selected: true,
              is_visible: true,
            });
          }
        };

        switch (command) {
          case "CANVAS":
            if (parts.length === 3) {
              setCanvasSize({
                width: parseFloat(parts[1]),
                height: parseFloat(parts[2]),
                backgroundColor: "#ffffff",
              });
            }
            break;
          case "LINE":
            if (parts.length === 6) {
              const newLine = {
                start: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                end: { x: parseFloat(parts[3]), y: parseFloat(parts[4]) },
                color: parts[5],
                layerId: `layer-${layerIdCounter}`,
              };
              linesFromFile.push(newLine);
              addLayer(newLine.layerId, `Layer ${layerIdCounter}`);
              layerIdCounter++;
            }
            break;
          case "CIRCLE":
            if (parts.length >= 5) {
              const newCircle: Circle = {
                center: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                radius: parseFloat(parts[3]),
                borderColor: parts[4],
                layerId: `layer-${layerIdCounter}`,
                backgroundColor: parts.length >= 6 ? parts[5] : undefined,
              };
              circlesFromFile.push(newCircle);
              addLayer(newCircle.layerId, `Layer ${layerIdCounter}`);
              layerIdCounter++;
            }
            break;
          case "ELLIPSE":
            if (parts.length >= 6) {
              const newEllipse: Ellipse = {
                center: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                rx: parseFloat(parts[3]),
                ry: parseFloat(parts[4]),
                borderColor: parts[5],
                layerId: `layer-${layerIdCounter}`,
                backgroundColor: parts.length >= 7 ? parts[6] : undefined,
              };
              ellipsesFromFile.push(newEllipse);
              addLayer(newEllipse.layerId, `Layer ${layerIdCounter}`);
              layerIdCounter++;
            }
            break;
          case "CURVE":
            if (parts.length === 10) {
              const newCurve = {
                p0: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                p1: { x: parseFloat(parts[3]), y: parseFloat(parts[4]) },
                p2: { x: parseFloat(parts[5]), y: parseFloat(parts[6]) },
                p3: { x: parseFloat(parts[7]), y: parseFloat(parts[8]) },
                color: parts[9],
                layerId: `layer-${layerIdCounter}`,
              };
              curvesFromFile.push(newCurve);
              addLayer(newCurve.layerId, `Layer ${layerIdCounter}`);
              layerIdCounter++;
            }
            break;
          default:
            console.warn(`Unknown CAD command: ${command}`);
        }
      });

      setLines(linesFromFile);
      setCircles(circlesFromFile);
      setEllipses(ellipsesFromFile);
      setCurves(curvesFromFile);
      setLayers((prevLayers) => [...prevLayers, ...newLayers]);
      setOpenHomeModal(false);
      if (setImportTimestamp) {
        setImportTimestamp(Date.now());
      }
      setShowGrid(true);

      // Save imported data to localStorage under the new project key
      const stateToSave = {
        lines: linesFromFile,
        circles: circlesFromFile,
        ellipses: ellipsesFromFile,
        curves: curvesFromFile,
        layers: newLayers,
        canvasSize,
        lastSaved: Date.now(),
      };
      console.log("TEST 3")
      console.log(stateToSave)
      localStorage.setItem(
        `cad_drawing_state_${projectName}`,
        JSON.stringify(stateToSave)
      );

      message.success("Design imported successfully!");
    };

    reader.readAsText(file);
    setShowGrid(false);
  };

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
    polygons,
    setPolygons,
    polygonCornerNumber,
    setPolygonCornerNumber,
    canvasRef,
    importTimestamp,
    setImportTimestamp,
    log,
    setLog,
    addLogEntry,
    projects,
    setProjects,
    currentProject,
    setCurrentProject,
    resetCanvasState,
    handleImportFile,
    handleUndo,
    handleRedo,
    saveState,
    zoomLevel,
    setZoomLevel,
    zoomOffsetX,
    setZoomOffsetX,
    zoomOffsetY,
    setZoomOffsetY,
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
