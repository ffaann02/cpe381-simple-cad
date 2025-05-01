import React, { useState, useRef } from "react";
import { File, FilePlus, Image, FileText, Settings } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import { useTab } from "@/context/AppContext";
import { Circle, Curve, Ellipse, Line, Point } from "@/interface/shape";
import { Layer } from "@/interface/tab";
import { clear } from "console";

// CAD Export Format Definition
// Example:
// LINE startX, startY, endX, endY, color
// CIRCLE centerX, centerY, radius, borderColor, fillColor
// ELLIPSE centerX, centerY, radiusX, radiusY, borderColor, fillColor
// CURVE p0x,p0y,p1x,p1y,p2x,p2y,p3x,p3y,color

export enum ShapeMode {
  Line = "line",
  Curve = "curve",
  Circle = "circle",
  Ellipse = "ellipse",
}

const generateCadText = (
  lines: Line[],
  circles: Circle[],
  ellipses: Ellipse[],
  curves: Curve[],
  canvasWidth: number = 800,
  canvasHeight: number = 600
): string => {
  let cadText = `CANVAS,${canvasWidth},${canvasHeight}\n`; // First line with canvas width and height

  lines.forEach((line) => {
    cadText += `LINE,${line.start.x},${line.start.y},${line.end.x},${
      line.end.y
    },${line.color || "black"}\n`;
  });

  circles.forEach((circle) => {
    cadText += `CIRCLE,${circle.center.x},${circle.center.y},${circle.radius},${
      circle.borderColor || "black"
    },${circle.backgroundColor || ""}\n`;
  });

  ellipses.forEach((ellipse) => {
    cadText += `ELLIPSE,${ellipse.center.x},${ellipse.center.y},${ellipse.rx},${
      ellipse.ry
    },${ellipse.borderColor || "black"},${ellipse.backgroundColor || ""}\n`;
  });

  curves.forEach((curve) => {
    cadText += `CURVE,${curve.p0.x},${curve.p0.y},${curve.p1.x},${curve.p1.y},${
      curve.p2.x
    },${curve.p2.y},${curve.p3.x},${curve.p3.y},${curve.color || "black"}\n`;
  });

  return cadText;
};

interface ExportModalProps {
  lines: Line[];
  circles: Circle[];
  ellipses: Ellipse[];
  curves: Curve[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  setEllipses: React.Dispatch<React.SetStateAction<Ellipse[]>>;
  setCurves: React.Dispatch<React.SetStateAction<Curve[]>>;
}

const ModalSwitcher: React.FC<ExportModalProps> = ({
  lines,
  circles,
  ellipses,
  curves,
  setLines,
  setCircles,
  setEllipses,
  setCurves,
}) => {
  const {
    modalType,
    setModalType,
    openHomeModal,
    setOpenHomeModal,
    canvasRef,
    canvasSize,
    importTimestamp,
    setImportTimestamp,
    layers,
    setLayers,
    setShowGrid
  } = useTab();
  const [formData, setFormData] = useState({
    projectName: "",
    width: 800,
    height: 600,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onNewProjectSubmit = () => {
    let hasErrors = false;
    const newErrors: { [key: string]: string } = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
      hasErrors = true;
    }
    if (formData.width <= 0) {
      newErrors.width = "Width must be greater than 0";
      hasErrors = true;
    }
    if (formData.height <= 0) {
      newErrors.height = "Height must be greater than 0";
      hasErrors = true;
    }

    setErrors(newErrors);

    if (!hasErrors) {
      // Handle new project creation (e.g., create a new canvas, reset state)
      console.log("New Project Data:", formData);
      setOpenHomeModal(false); // Close the modal
      setFormData({ projectName: "", width: 800, height: 600 }); // Reset form
      setErrors({});
      setLines([]);
      setCircles([]);
      setEllipses([]);
      setCurves([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearCurrentCanvas = () => {
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
  }

  const handleImport = () => {
    if (fileInputRef.current?.files?.[0]) {
      clearCurrentCanvas(); // Clear the current canvas before importing
      
      const file = fileInputRef.current.files[0];
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
          const parts = line.trim().split(",").map(p => p.trim());
          const command = parts[0]?.toUpperCase();
  
          const addLayer = (layerId: string, name: string) => {
            newLayers.push({
              id: layerId,
              name,
              is_selected: true,
              is_visible: true,
            });
          };
  
          switch (command) {
            case "LINE":
              if (parts.length === 6) {
                const newLine = {
                  start: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                  end: { x: parseFloat(parts[3]), y: parseFloat(parts[4]) },
                  color: parts[5],
                  layerId: layerIdCounter.toString(),
                };
                linesFromFile.push(newLine);
                addLayer(newLine.layerId, `Layer ${newLine.layerId}`);
                layerIdCounter++;
              }
              break;
            case "CIRCLE":
              if (parts.length >= 5) {
                const newCircle: Circle = {
                  center: { x: parseFloat(parts[1]), y: parseFloat(parts[2]) },
                  radius: parseFloat(parts[3]),
                  borderColor: parts[4],
                  layerId: layerIdCounter.toString(),
                  backgroundColor: parts.length >= 6 ? parts[5] : undefined,
                };
                circlesFromFile.push(newCircle);
                addLayer(newCircle.layerId, `Layer ${newCircle.layerId}`);
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
                  layerId: layerIdCounter.toString(),
                  backgroundColor: parts.length >= 7 ? parts[6] : undefined,
                };
                ellipsesFromFile.push(newEllipse);
                addLayer(newEllipse.layerId, `Layer ${newEllipse.layerId}`);
                layerIdCounter++;
              }
              break;
            case "CURVE":
              if (parts.length === 10) {
                const newCurve = {
                  p0: { x: parseFloat(parts[1]), y: parseFloat(parts[2]), color: parts[9] },
                  p1: { x: parseFloat(parts[3]), y: parseFloat(parts[4]), color: parts[9] },
                  p2: { x: parseFloat(parts[5]), y: parseFloat(parts[6]), color: parts[9] },
                  p3: { x: parseFloat(parts[7]), y: parseFloat(parts[8]), color: parts[9] },
                  color: parts[9],
                  layerId: layerIdCounter.toString(),
                };
                curvesFromFile.push(newCurve);
                addLayer(newCurve.layerId, `Layer ${newCurve.layerId}`);
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
        setLayers([...layers, ...newLayers]);
        setOpenHomeModal(false);
        if (setImportTimestamp) {
          setImportTimestamp(Date.now());
        }
      };
  
      reader.readAsText(file);
      setShowGrid(true); // Hide grid after import
    }
  };
  

  const handleExport = (format: "jpg" | "png" | "cad") => {
    if (format === "cad") {
      const cadText = generateCadText(
        lines,
        circles,
        ellipses,
        curves,
        canvasSize.width,
        canvasSize.height
      );
      const blob = new Blob([cadText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "drawing.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      console.log(`Exporting as ${format.toUpperCase()}...`);
      alert(
        `Exporting as ${format.toUpperCase()} is not fully implemented here. See console for CAD output.`
      );
      console.log(generateCadText(lines, circles, ellipses, curves));
    }
    setOpenHomeModal(false);
  };

  return (
    <>
      <div className="relative">
        {openHomeModal && (
          <div className="fixed z-100 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Modal backdrop */}
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* This element is to trick the browser into centering the modal content. */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modal panel */}
              <div className="fixed left-1/2 top-1/2 z-[9999] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg text-left overflow-hidden shadow-xl transition-all sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 py-5">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        Settings
                      </h3>
                      <button
                        className="absolute cursor-pointer top-3 right-3"
                        onClick={() => setOpenHomeModal(false)}
                      >
                        <RxCross2 className="text-xl" />
                      </button>
                      <div className="mt-2 mb-4">
                        <p className="text-sm text-gray-500">
                          Manage project settings, import, and export.
                        </p>
                      </div>
                      <div className="w-full">
                        <div className="border-b border-gray-200">
                          <div className="flex space-x-4">
                            <button
                              className={`px-4 py-2 text-sm font-medium ${
                                modalType === "new"
                                  ? "border-b-2 border-blue-500 text-blue-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                              onClick={() => setModalType("new")}
                            >
                              <FilePlus className="mr-2 h-4 w-4 inline-block" />
                              New Project
                            </button>
                            <button
                              className={`px-4 py-2 text-sm font-medium ${
                                modalType === "import"
                                  ? "border-b-2 border-blue-500 text-blue-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                              onClick={() => setModalType("import")}
                            >
                              <File className="mr-2 h-4 w-4 inline-block" />
                              Import
                            </button>
                            <button
                              className={`px-4 py-2 text-sm font-medium ${
                                modalType === "export"
                                  ? "border-b-2 border-blue-500 text-blue-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                              onClick={() => setModalType("export")}
                            >
                              <Image className="mr-2 h-4 w-4 inline-block" />
                              Export
                            </button>
                          </div>
                        </div>
                        {modalType === "new" && (
                          <form className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="projectName"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Project Name
                              </label>
                              <input
                                id="projectName"
                                name="projectName"
                                value={formData.projectName}
                                onChange={handleInputChange}
                                placeholder="Enter project name"
                                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                  errors.projectName ? "border-red-500" : ""
                                }`}
                              />
                              {errors.projectName && (
                                <p className="text-red-500 text-sm">
                                  {errors.projectName}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label
                                  htmlFor="width"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Width
                                </label>
                                <input
                                  id="width"
                                  type="number"
                                  name="width"
                                  value={formData.width}
                                  onChange={handleInputChange}
                                  placeholder="Width"
                                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                    errors.width ? "border-red-500" : ""
                                  }`}
                                />
                                {errors.width && (
                                  <p className="text-red-500 text-sm">
                                    {errors.width}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label
                                  htmlFor="height"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  Height
                                </label>
                                <input
                                  id="height"
                                  type="number"
                                  name="height"
                                  value={formData.height}
                                  onChange={handleInputChange}
                                  placeholder="Height"
                                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                    errors.height ? "border-red-500" : ""
                                  }`}
                                />
                                {errors.height && (
                                  <p className="text-red-500 text-sm">
                                    {errors.height}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-6 sm:flex sm:justify-end">
                              <button
                                type="button"
                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onNewProjectSubmit}
                              >
                                Create Project
                              </button>
                            </div>
                          </form>
                        )}
                        {modalType === "import" && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="importFile"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Import File
                              </label>
                              <input
                                id="importFile"
                                type="file"
                                accept=".cad, .txt"
                                ref={fileInputRef}
                                onChange={handleImport}
                                className="w-full"
                              />
                              <p className="text-sm text-gray-500">
                                Import a .cad or .txt file containing drawing
                                data.
                              </p>
                            </div>
                          </div>
                        )}
                        {modalType === "export" && (
                          <div className="mt-4 space-y-4">
                            <p className="text-sm text-gray-700">
                              Export your drawing in various formats.
                            </p>
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleExport("jpg")}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Image className="mr-2 h-4 w-4" />
                                JPG
                              </button>
                              <button
                                onClick={() => handleExport("png")}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Image className="mr-2 h-4 w-4" />
                                PNG
                              </button>
                              <button
                                onClick={() => handleExport("cad")}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                CAD
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ModalSwitcher;
