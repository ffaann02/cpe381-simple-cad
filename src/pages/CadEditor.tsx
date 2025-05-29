import FileWorkspaceTab from "@/components/pages/editor/FileTab";
import TopMenuTabs from "@/components/pages/editor/Tabs";
import FileTab from "@/components/pages/editor/tabs/FileTab";
import ShapeTab from "@/components/pages/editor/tabs/ShapeTab";
import ToolsTab from "@/components/layout/ToolsTab";
import { useTab } from "@/context/AppContext";
import RightTab from "@/components/layout/RightTab";
import Canvas from "@/components/pages/editor/shape-canvas/Canvas";
import PropertiesTab from "@/components/layout/PropertiesTab";
import { MdGridOff, MdGridOn } from "react-icons/md";
import { TbMagnet, TbMagnetOff } from "react-icons/tb";
import ModalSwitcher from "@/components/layout/ModalSwitcher";
import { Drawer, Upload } from "antd";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoDocumentOutline } from "react-icons/io5";
import { FiBox } from "react-icons/fi";
import { UploadIcon } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";
const gridOpacity = 0.4;

const CadEditor = () => {
  const navigate = useNavigate();
  const {
    tab,
    setTab,
    canvasSize,
    showGrid,
    setShowGrid,
    snapEnabled,
    setSnapEnabled,
    points,
    lines,
    curves,
    ellipses,
    circles,
    setPoints,
    setLines,
    setCurves,
    setEllipses,
    setCircles,
    log,
    projects,
    currentProject,
    handleImportFile,
    setCurrentProject,
    setProjects,
  } = useTab();

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const renderTab = () => {
    switch (tab) {
      case "file":
        return <FileTab />;
      case "shape":
        return <ShapeTab />;
      case "tools":
        return <ToolsTab />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // remove comment after home page is implemented
    // if (!currentProject && projects.length === 0) {
    //   navigate("/");
    // }
  }, []);

  const draggerProps = {
    name: "file",
    multiple: false,
    accept: ".cad,.txt",
    beforeUpload: (file: File) => {
      // Prevent Ant Design from automatically uploading the file
      // We will handle the file reading manually
      // Remove .cad or .txt extension before setting as current project
      const projectName = file.name.replace(/\.(cad|txt)$/i, "");
      setCurrentProject(projectName);
      setProjects((prev) => {
        const existingProject = prev.find((p) => p.name === projectName);
        if (existingProject) {
          return prev; // Project already exists, no need to add again
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            name: projectName,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      });
      handleImportFile(file);
      console.log("File ready for import:", file);
      return false;
    },
    // customRequest: () => { /* No operation as beforeUpload handles the file */ },
    onDrop(e: React.DragEvent<HTMLDivElement>) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const [openLogDrawer, setOpenLogDrawer] = useState<boolean>(false);
  const [openCodeEditor, setOpenCodeEditor] = useState<boolean>(false);
  if (!currentProject && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center max-w-5xl mx-auto mt-12">
        <Link to="/" className="underline mb-4">
          <FaChevronLeft className="inline mr-1" />
          Back to Home
        </Link>
        <img
          src="https://png.pngtree.com/png-vector/20220902/ourmid/pngtree-text-effect-for-logo-word-png-image_236809.png"
          className="bg-red-200 h-72"
        />
        <div className="flex space-x-4 mt-4">
          <button className="flex space-x-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 px-4 py-2 rounded-md border border-neutral-200 cursor-pointer">
            <IoDocumentOutline className="text-4xl text-neutral-500" />
            <p className="text-xl my-auto">New Project</p>
          </button>
          <button className="flex space-x-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 px-4 py-2 rounded-md border border-neutral-200 cursor-pointer">
            <FiBox className="text-4xl text-neutral-500" />
            <p className="text-xl my-auto">Template</p>
          </button>
        </div>
        <div className="mt-6 w-1/2">
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
        <h1 className="text-2xl text-neutral-600 my-6">
          Please create or select a project.
        </h1>
      </div>
    );
  }
  return (
    <div className="relative">
      <ModalSwitcher
        lines={lines}
        curves={curves}
        ellipses={ellipses}
        circles={circles}
        setLines={setLines}
        setCurves={setCurves}
        setEllipses={setEllipses}
        setCircles={setCircles}
      />
      <div className="w-full bg-neutral-100 px-2 py-1 border-b">
        <TopMenuTabs
          value={tab}
          handleTabChange={handleTabChange}
          setOpenCodeEditor={setOpenCodeEditor}
        />
      </div>
      <div className="bg-neutral-50 py-2 border-b border-t-0">
        {renderTab()}
      </div>
      <div className="w-full my-1">
        <div className="w-full bg-neutral-200 p-1">
          <FileWorkspaceTab />
        </div>
      </div>
      <div className="relative grid grid-cols-12 gap-x-2 px-2 pb-2 h-[calc(100vh-12rem)]">
        <ToolsTab />
        <div className="relative bg-neutral-100 border rounded-md col-span-10 flex items-center justify-center">
          <div className="absolute grid grid-rows-2 top-2 right-2 z-10 gap-2">
            <button
              className="bg-neutral-200 cursor-pointer p-1 rounded-md hover:bg-neutral-300"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? (
                <MdGridOff className="text-xl text-neutral-600" />
              ) : (
                <MdGridOn className="text-xl text-neutral-600" />
              )}
            </button>

            <button
              className={`p-1 rounded-md ${
                showGrid
                  ? "bg-neutral-200 hover:bg-neutral-300 cursor-pointer"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              }`}
              onClick={() => {
                if (showGrid) setSnapEnabled((prev) => !prev);
              }}
              disabled={!showGrid}
            >
              {snapEnabled ? (
                <TbMagnet className="text-xl text-neutral-600" />
              ) : (
                <TbMagnetOff className="text-xl text-neutral-600" />
              )}
            </button>
          </div>
          <div
            id="canvas"
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              backgroundColor: canvasSize.backgroundColor,
              border: "1px solid #ccc",
              position: "relative",
            }}
          >
            {showGrid && (
              <svg
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                  position: "absolute",
                  zIndex: 20,
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                  opacity: gridOpacity,
                }}
              >
                {/* Vertical Lines */}
                {[...Array(Math.floor(canvasSize.width / 20))].map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * 20}
                    y1={0}
                    x2={i * 20}
                    y2={canvasSize.height}
                    stroke="red"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Horizontal Lines */}
                {[...Array(Math.floor(canvasSize.height / 20))].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * 20}
                    x2={canvasSize.width}
                    y2={i * 20}
                    stroke="red"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Scale Text */}
                {[...Array(Math.floor(canvasSize.width / 100))].map((_, i) => (
                  <text
                    key={`x-tick-${i}`}
                    x={i * 100 + 2}
                    y={10}
                    fontSize="10"
                    fill="red"
                  >
                    {i * 100}
                  </text>
                ))}
                {[...Array(Math.floor(canvasSize.height / 100))].map((_, i) => (
                  <text
                    key={`y-tick-${i}`}
                    x={2}
                    y={i * 100 + 10}
                    fontSize="10"
                    fill="red"
                  >
                    {i * 100}
                  </text>
                ))}
              </svg>
            )}
            <Canvas />
          </div>
        </div>
        <div className="col-span-2 h-fit space-y-2">
          <PropertiesTab />
          <RightTab />
        </div>
      </div>
      <Drawer
        title="Log"
        placement="bottom"
        height={240}
        style={{ overflowY: "auto" }}
        closable={true}
        onClose={() => setOpenLogDrawer(false)}
        open={openLogDrawer}
      >
        <div className="flex flex-col gap-2 p-2">
          {[...log]
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry, index) => (
              <div
                key={index}
                className="flex items-center space-x-12 border-b pb-2"
              >
                <span className="text-neutral-700">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span>{entry.message}</span>
              </div>
            ))}
        </div>
      </Drawer>
      <button
        className="cursor-pointer fixed px-4 py-2 text-sm bottom-0 rounded-t-xl left-8 border border-neutral-400 bg-neutral-300 text-neutral-600"
        onClick={() => setOpenLogDrawer(true)}
      >
        Open Log
      </button>
    </div>
  );
};

export default CadEditor;
