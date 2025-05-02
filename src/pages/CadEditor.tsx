import FileTab from "@/components/pages/editor/FileTab";
import TopMenuTabs from "@/components/pages/editor/Tabs";
import HomeTab from "@/components/pages/editor/tabs/HomeTab";
import ShapeTab from "@/components/pages/editor/tabs/ShapeTab";
import ToolsTab from "@/components/layout/ToolsTab";
import { useTab } from "@/context/AppContext";
import RightTab from "@/components/layout/RightTab";
import { LuMousePointer2 } from "react-icons/lu";
import { PiSelectionBold } from "react-icons/pi";
import Canvas from "@/components/pages/editor/shape-canvas/Canvas";
import PropertiesTab from "@/components/layout/PropertiesTab";
import { MdGridOff, MdGridOn } from "react-icons/md";
import { TbMagnet, TbMagnetOff } from "react-icons/tb";
import ModalSwitcher from "@/components/layout/ModalSwitcher";

const gridOpacity = 0.4;

const CadEditor = () => {
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
  } = useTab();

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const renderTab = () => {
    switch (tab) {
      case "home":
        return <HomeTab />;
      case "shape":
        return <ShapeTab />;
      case "tools":
        return <ToolsTab />;
      default:
        return null;
    }
  };

  return (
    <div>
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
        <TopMenuTabs value={tab} handleTabChange={handleTabChange} />
      </div>
      <div className="bg-neutral-50 py-2 border-b">{renderTab()}</div>
      <div className="w-full my-1">
        <div className="w-full bg-neutral-200 p-1">
          <FileTab />
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
    </div>
  );
};

export default CadEditor;
