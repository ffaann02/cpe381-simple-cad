import React, { useState, useRef } from "react";
import { File, FilePlus, Image, FileText, Upload as UploadIcon } from "lucide-react"; // Renamed Upload to UploadIcon to avoid conflict with Ant Design Upload
import { useTab } from "@/context/AppContext";
import { Circle, Curve, Ellipse, Line } from "@/interface/shape";
import { Layer } from "@/interface/tab";
import { Input, InputNumber, Modal, Button, message, Tabs, Upload } from "antd"; // Import Upload

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
    setImportTimestamp,
    layers,
    setLayers,
    setShowGrid,
    setCanvasSize,
    setProjects
  } = useTab();
  const [formData, setFormData] = useState({
    projectName: "",
    width: 800,
    height: 600,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // fileInputRef is no longer needed

  const onNewDesignSubmit = () => {
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
      console.log("New Project Data:", formData);
      setProjects((prev) => [
        ...prev,
        {
          id: `project-${Date.now()}`, // Unique ID based on timestamp
          name: formData.projectName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      setOpenHomeModal(false);
      setFormData({ projectName: "", width: 800, height: 600 });
      setErrors({});
      setLines([]);
      setCircles([]);
      setEllipses([]);
      setCurves([]);
      setCanvasSize({
        width: formData.width,
        height: formData.height,
        backgroundColor: "#ffffff",
      });
      message.success("New design created!");
      setShowGrid(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberInputChange = (value: number | null, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  };

  const handleImportFile = (file: File) => { // Renamed from handleImport to avoid confusion with the previous one
    clearCurrentCanvas();

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
          // Only add layer if it doesn't already exist to prevent duplicates on import
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
                backgroundColor: "#ffffff", // Default background for imported canvas
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
      message.success("Design imported successfully!");
    };

    reader.readAsText(file);
    setShowGrid(true);
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
      a.download = "drawing.cad"; // Changed to .cad extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success("CAD file exported successfully!");
    } else {
      message.info(
        `Exporting as ${format.toUpperCase()} is not yet fully implemented. CAD data logged to console.`
      );
      console.log(generateCadText(lines, circles, ellipses, curves));
    }
    setOpenHomeModal(false);
  };

  const draggerProps = {
    name: 'file',
    multiple: false,
    accept: '.cad,.txt',
    beforeUpload: (file: File) => {
      // Prevent Ant Design from automatically uploading the file
      // We will handle the file reading manually
      handleImportFile(file);
      return false;
    },
    // customRequest: () => { /* No operation as beforeUpload handles the file */ },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const getModalContent = () => {
    switch (modalType) {
      case "new":
        return (
          <form className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700"
              >
                Design Name
              </label>
              <Input
                id="projectName"
                name="projectName"
                size="large"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter design name"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm">{errors.projectName}</p>
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
                <InputNumber
                  style={{ width: "100%" }}
                  id="width"
                  name="width"
                  size="large"
                  min={1}
                  max={100000}
                  value={formData.width}
                  onChange={(value) => handleNumberInputChange(value, "width")}
                />
                {errors.width && (
                  <p className="text-red-500 text-sm">{errors.width}</p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="height"
                  className="block text-sm font-medium text-gray-700"
                >
                  Height
                </label>
                <InputNumber
                  style={{ width: "100%" }}
                  id="height"
                  name="height"
                  size="large"
                  min={1}
                  max={100000}
                  value={formData.height}
                  onChange={(value) => handleNumberInputChange(value, "height")}
                />
                {errors.height && (
                  <p className="text-red-500 text-sm">{errors.height}</p>
                )}
              </div>
            </div>
            <div className="sm:mt-6 sm:flex sm:justify-end">
              <Button
                type="primary"
                size="large"
                onClick={onNewDesignSubmit}
                className="w-full sm:w-auto"
              >
                Create Design
              </Button>
            </div>
          </form>
        );
      case "import":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Upload.Dragger {...draggerProps}>
                <p className="ant-upload-drag-icon">
                  <UploadIcon className="mx-auto text-neutral-400" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single .cad or .txt file.
                </p>
              </Upload.Dragger>
            </div>
          </div>
        );
      case "export":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Export your drawing in various formats.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => handleExport("jpg")}
                className="flex items-center"
                size="large"
              >
                <Image className="mr-2 h-4 w-4" />
                JPG
              </Button>
              <Button
                onClick={() => handleExport("png")}
                className="flex items-center"
                size="large"
              >
                <Image className="mr-2 h-4 w-4" />
                PNG
              </Button>
              <Button
                onClick={() => handleExport("cad")}
                className="flex items-center"
                size="large"
              >
                <FileText className="mr-2 h-4 w-4" />
                CAD
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title="Project Settings"
      open={openHomeModal}
      onCancel={() => setOpenHomeModal(false)}
      footer={null} // Hide default Ant Design modal footer
      width={600}
    >
      <p className="text-sm text-gray-500 mb-4">
        Manage project settings, import, and export.
      </p>
      <div>
        <Tabs
          activeKey={modalType}
          onChange={(key) => setModalType(key as "new" | "import" | "export")}
          items={[
            {
              key: "new",
              label: (
                <span>
                  <FilePlus className="mr-2 h-4 w-4 inline-block" />
                  New Design
                </span>
              ),
            },
            {
              key: "import",
              label: (
                <span>
                  <File className="mr-2 h-4 w-4 inline-block" />
                  Import
                </span>
              ),
            },
            {
              key: "export",
              label: (
                <span>
                  <Image className="mr-2 h-4 w-4 inline-block" />
                  Export
                </span>
              ),
            },
          ]}
          tabBarGutter={24}
        />
      </div>
      {getModalContent()}
    </Modal>
  );
};

export default ModalSwitcher;