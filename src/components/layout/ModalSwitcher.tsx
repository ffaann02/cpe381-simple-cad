import React, { useState, useRef } from "react";
import { File, FilePlus, Image, FileText, Settings } from "lucide-react";
import { useTab } from "@/context/AppContext";

// CAD Export Format Definition
// Example:
// # Lines
// LINE startX, startY, endX, endY, color
// LINE 10,20,30,40,red
// # Circles
// CIRCLE centerX, centerY, radius, borderColor, fillColor
// CIRCLE 50,60,25,blue,yellow
// # Rectangles
// RECT x, y, width, height, borderColor, fillColor
// RECT 100,120,40,50,green,orange
// # Ellipses
// ELLIPSE centerX, centerY, radiusX, radiusY, borderColor, fillColor
// ELLIPSE 150,170,30,20,purple,pink
// # Curves
// CURVE p0x,p0y,p1x,p1y,p2x,p2y,p3x,p3y,color
// CURVE 200,220,230,240,250,260,270,280,black

export enum ShapeMode {
  Line = "line",
  Curve = "curve",
  Circle = "circle",
  Ellipse = "ellipse",
}

export type Point = {
  x: number;
  y: number;
  color?: string;
};

export type Line = {
  start: Point;
  end: Point;
  borderRadius?: string;
  color?: string;
};

export type Circle = {
  center: Point;
  radius: number;
  backgroundColor?: string;
  borderRadius?: string;
  borderColor?: string;
};

export type Curve = {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
  borderRadius?: string;
  color?: string;
};

export type Ellipse = {
  center: Point;
  rx: number;
  ry: number;
  borderRadius?: string;
  backgroundColor?: string;
  borderColor?: string;
};

const generateCadText = (
  lines: Line[],
  circles: Circle[],
  ellipses: Ellipse[],
  curves: Curve[]
): string => {
  let cadText = "";

  if (lines.length > 0) {
    cadText += "# Lines\n";
    lines.forEach((line) => {
      cadText += `LINE ${line.start.x},${line.start.y},${line.end.x},${
        line.end.y
      },${line.color || "black"}\n`;
    });
  }

  if (circles.length > 0) {
    cadText += "# Circles\n";
    circles.forEach((circle) => {
      cadText += `CIRCLE ${circle.center.x},${circle.center.y},${
        circle.radius
      },${circle.borderColor || "black"},${circle.backgroundColor || ""}\n`;
    });
  }

  if (ellipses.length > 0) {
    cadText += "# Ellipses\n";
    ellipses.forEach((ellipse) => {
      cadText += `ELLIPSE ${ellipse.center.x},${ellipse.center.y},${
        ellipse.rx
      },${ellipse.ry},${ellipse.borderColor || "black"},${
        ellipse.backgroundColor || ""
      }\n`;
    });
  }

  if (curves.length > 0) {
    cadText += "# Curves\n";
    curves.forEach((curve) => {
      cadText += `CURVE ${curve.p0.x},${curve.p0.y},${curve.p1.x},${
        curve.p1.y
      },${curve.p2.x},${curve.p2.y},${curve.p3.x},${curve.p3.y},${
        curve.color || "black"
      }\n`;
    });
  }

  return cadText;
};

interface ExportModalProps {
  lines: Line[];
  circles: Circle[];

  ellipses: Ellipse[];
  curves: Curve[];
}

const ModalSwitcher: React.FC<ExportModalProps> = ({
  lines,
  circles,
  ellipses,
  curves,
}) => {
  const { modalType, setModalType, openHomeModal, setOpenHomeModal } = useTab();
  const [formData, setFormData] = useState({
    projectName: "",
    width: 800,
    height: 600,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [importedFileContent, setImportedFileContent] = useState<string>("");
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
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImport = () => {
    if (fileInputRef.current?.files?.[0]) {
      const file = fileInputRef.current.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setImportedFileContent(text);
        console.log("Imported file content:", text);
        setOpenHomeModal(false);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = (format: "jpg" | "png" | "cad") => {
    if (format === "cad") {
      const cadText = generateCadText(lines, circles, ellipses, curves);
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
        `Exporting as ${format.toUpperCase()} is not fully implemented here.  See console for CAD output.`
      );
    }
    setOpenHomeModal(false);
  };

  return (
    <>
      <div className="relative">
        {openHomeModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
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
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        Settings
                      </h3>
                      <div className="mt-2">
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
                                accept=".txt"
                                ref={fileInputRef}
                                onChange={handleImport}
                                className="w-full"
                              />
                              <p className="text-sm text-gray-500">
                                Import a text file containing drawing data.
                              </p>
                            </div>
                            {importedFileContent && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Imported Content
                                </label>
                                <div className="border rounded-md p-4 bg-gray-100 overflow-auto max-h-48">
                                  <pre className="text-sm">
                                    {importedFileContent}
                                  </pre>
                                </div>
                              </div>
                            )}
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
