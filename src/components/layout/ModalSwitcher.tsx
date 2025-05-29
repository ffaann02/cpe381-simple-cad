import React, { useState, useRef } from "react";
import {
  File,
  FilePlus,
  Image,
  FileText,
  Upload as UploadIcon,
} from "lucide-react"; // Renamed Upload to UploadIcon to avoid conflict with Ant Design Upload
import { useTab } from "@/context/AppContext";
import { Circle, Curve, Ellipse, Line, Polygon } from "@/interface/shape";
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
  polygons: Polygon[],
  canvasWidth: number = 800,
  canvasHeight: number = 600,
  canvasBackgroundColor: string = "#ffffff",
  layers: Layer[] = []
): string => {
  // First line with canvas width, height, and background color
  let cadText = `CANVAS,${canvasWidth},${canvasHeight},${canvasBackgroundColor}\n`;

  // Add lines with their colors and thickness
  lines.forEach((line) => {
    const layer = layers.find(l => l.id === line.layerId);
    cadText += `LINE,${line.start.x},${line.start.y},${line.end.x},${line.end.y},${line.color || "black"},${layer?.thickness || 1}\n`;
  });

  // Add circles with their border and background colors and thickness
  circles.forEach((circle) => {
    const layer = layers.find(l => l.id === circle.layerId);
    cadText += `CIRCLE,${circle.center.x},${circle.center.y},${circle.radius},${circle.borderColor || "black"},${circle.backgroundColor || ""},${layer?.thickness || 1}\n`;
  });

  // Add ellipses with their border and background colors and thickness
  ellipses.forEach((ellipse) => {
    const layer = layers.find(l => l.id === ellipse.layerId);
    cadText += `ELLIPSE,${ellipse.center.x},${ellipse.center.y},${ellipse.rx},${ellipse.ry},${ellipse.borderColor || "black"},${ellipse.backgroundColor || ""},${layer?.thickness || 1}\n`;
  });

  // Add curves with their colors and thickness
  curves.forEach((curve) => {
    const layer = layers.find(l => l.id === curve.layerId);
    cadText += `CURVE,${curve.p0.x},${curve.p0.y},${curve.p1.x},${curve.p1.y},${curve.p2.x},${curve.p2.y},${curve.p3.x},${curve.p3.y},${curve.color || "black"},${layer?.thickness || 1}\n`;
  });

  // Add polygons with their points, border and background colors and thickness
  polygons.forEach((polygon) => {
    const layer = layers.find(l => l.id === polygon.layerId);
    const points = polygon.points.map(p => `${p.x},${p.y}`).join(',');
    cadText += `POLYGON,${points},${polygon.borderColor || "black"},${polygon.backgroundColor || ""},${layer?.thickness || 1}\n`;
  });

  return cadText;
};

interface ExportModalProps {
  lines: Line[];
  circles: Circle[];
  ellipses: Ellipse[];
  curves: Curve[];
  polygons: Polygon[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  setCircles: React.Dispatch<React.SetStateAction<Circle[]>>;
  setEllipses: React.Dispatch<React.SetStateAction<Ellipse[]>>;
  setCurves: React.Dispatch<React.SetStateAction<Curve[]>>;
  setPolygons: React.Dispatch<React.SetStateAction<Polygon[]>>;
  tabs?: ("new" | "import" | "export")[]; // Make tabs optional
}

const ModalSwitcher: React.FC<ExportModalProps> = ({
  lines,
  circles,
  ellipses,
  curves,
  polygons,
  setLines,
  setCircles,
  setEllipses,
  setCurves,
  setPolygons,
  tabs = ["new", "import", "export"], // Default to all tabs if not provided
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
    projects,
    setProjects,
    setCurrentProject,
    handleImportFile,
    currentProject,
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
      if (!projects.some((p) => p.name === formData.projectName)) {
        setProjects((prev) => [
          ...prev,
          {
            id: `project-${Date.now()}`, // Unique ID based on timestamp
            name: formData.projectName,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        setCurrentProject(formData.projectName);
      } else {
        setCurrentProject(formData.projectName); // Just switch to it if already open
      }
      setOpenHomeModal(false);
      setErrors({});
      message.success("New design created!");
      setShowGrid(true);
      setCurrentProject(formData.projectName); // Set the current project to the new one
      setCanvasSize({
        width: formData.width,
        height: formData.height,
        backgroundColor: "#ffffff",
      });
      setFormData({ projectName: "", width: 800, height: 600 });
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
    setPolygons([]);
    setLayers([]);
    if (canvasRef?.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      }
    }
  };

  const handleExport = (format: "jpg" | "png" | "cad") => {
    if (format === "cad") {
      const cadText = generateCadText(
        lines,
        circles,
        ellipses,
        curves,
        polygons,
        canvasSize.width,
        canvasSize.height,
        canvasSize.backgroundColor,
        layers
      );
      const blob = new Blob([cadText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject || "drawing"}.cad`; // Use current project name if available
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success("CAD file exported successfully!");
    } else {
      // Get the canvas element
      const canvas = document.querySelector('#main-canvas canvas') as HTMLCanvasElement;
      if (!canvas) {
        message.error("Could not find canvas element");
        return;
      }

      // Create a temporary canvas to draw the final image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        message.error("Could not create canvas context");
        return;
      }

      // Set the temporary canvas size to match the main canvas
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      // Fill with canvas background color
      tempCtx.fillStyle = canvasSize.backgroundColor || '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the main canvas content
      tempCtx.drawImage(canvas, 0, 0);

      // Convert to blob and download
      tempCanvas.toBlob((blob) => {
        if (!blob) {
          message.error("Failed to create image");
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentProject || "drawing"}.${format}`; // Use current project name if available
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success(`${format.toUpperCase()} file exported successfully!`);
      }, `image/${format}`, 1.0);
    }
    setOpenHomeModal(false);
  };

  const draggerProps = {
    name: "file",
    multiple: false,
    accept: ".txt,.cad", // Accept only .txt or .cad files
    beforeUpload: (file: File) => {
      // Prevent Ant Design from automatically uploading the file
      // We will handle the file reading manually
      handleImportFile(file);
      return false;
    },
    // customRequest: () => { /* No operation as beforeUpload handles the file */ },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const allTabs = [
    {
      key: "new",
      label: (
        <span>
          <FilePlus className="mr-2 h-4 w-4 inline-block" />
          New Design
        </span>
      ),
      content: (
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
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Upload.Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <UploadIcon className="mx-auto text-neutral-400" />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single .cad or .txt file.
              </p>
            </Upload.Dragger>
          </div>
        </div>
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
      content: (
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
      ),
    },
  ];

  // Filter tabs based on the 'tabs' prop
  const filteredTabs = allTabs.filter((tab) =>
    tabs.includes(tab.key as "new" | "import" | "export")
  );

  // Determine which content to show based on the activeKey (modalType)
  const getModalContent = () => {
    const activeTab = filteredTabs.find((tab) => tab.key === modalType);
    return activeTab ? activeTab.content : null;
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
          items={filteredTabs.map(({ key, label }) => ({ key, label }))} // Pass only key and label to items
          tabBarGutter={24}
        />
      </div>
      {getModalContent()}
    </Modal>
  );
};

export default ModalSwitcher;