import { useState, useEffect } from "react";
import { Popover } from "antd";
import {
  FaPen,
  FaFillDrip,
  FaEraser,
  FaUndo,
  FaRedo,
  FaSearchPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { LuMousePointer2 } from "react-icons/lu";
import { MdOutlineOpenWith, MdOutlineAspectRatio } from "react-icons/md";
import { Tools } from "@/interface/tool";
import { useTab } from "@/context/AppContext";
import { ShapeMode } from "@/interface/shape";

const shapeButtons = [
  {
    type: ShapeMode.Line,
    icon: "https://cdn-icons-png.flaticon.com/512/9613/9613407.png",
    label: "Line",
  },
  {
    type: ShapeMode.Curve,
    icon: "https://cdn-icons-png.flaticon.com/512/2708/2708381.png",
    label: "Curve",
  },
  {
    type: ShapeMode.Circle,
    icon: "https://cdn-icons-png.flaticon.com/512/481/481078.png",
    label: "Circle",
  },
  {
    type: ShapeMode.Ellipse,
    icon: "https://cdn-icons-png.flaticon.com/512/1014/1014918.png",
    label: "Ellipse",
  },
  {
    type: ShapeMode.Polygon,
    icon: "https://cdn-icons-png.flaticon.com/512/274/274375.png",
    label: "Polygon",
  },
];

const ToolsTab = () => {
  const {
    tool,
    setTool,
    shape,
    setShape,
    handleUndo,
    handleRedo,
    currentColor,
    setCurrentColor,
    polygonCornerNumber,
    setPolygonCornerNumber,
  } = useTab();
  const [isPopoverVisible, setIsPopoverVisible] = useState<boolean>(false);
  const [isColorPopoverVisible, setIsColorPopoverVisible] =
    useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  useEffect(() => {
    if (tool !== Tools.Draw) {
      setIsPopoverVisible(false);
    }
  }, [tool]);

  const handleDrawClick = () => {
    setTool(Tools.Draw);
    setIsPopoverVisible(true);
  };

  const handleShapeSelect = (newShape: ShapeMode) => {
    setShape(newShape);
  };

  const renderShapeButtons = () => (
    <div className="flex flex-col space-y-1">
      {shapeButtons.map((s) => (
        <button
          key={s.type}
          onClick={() => handleShapeSelect(s.type)}
          className={`px-3 py-1 rounded-sm flex flex-col items-center ${
            shape === s.type
              ? "border-2 border-neutral-300 bg-neutral-200"
              : "hover:bg-neutral-100"
          }`}
        >
          <img src={s.icon} alt={s.label} className="w-[16px] my-2" />
          <span className="text-xs text-slate-600">{s.label}</span>
        </button>
      ))}
      {/* Polygon corners slider shown only if Polygon is selected */}
      {shape === ShapeMode.Polygon && (
        <div className="mt-2">
          <p className="text-xs font-medium text-neutral-700 mb-2">
            Number of Corners
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="3"
              max="16"
              value={polygonCornerNumber}
              onChange={(e) => setPolygonCornerNumber(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-neutral-600">
              {polygonCornerNumber}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const popoverContent = (
    <div className="flex flex-col space-y-2">
      <p className="text-sm font-medium text-neutral-700">Select Shape</p>
      {renderShapeButtons()}
    </div>
  );

  const colorPickerContent = (
    <div className="p-2">
      <input
        type="color"
        value={currentColor}
        className="w-32 h-8 cursor-pointer"
        onChange={(e) => setCurrentColor(e.target.value)}
      />
    </div>
  );

  const toolButtons = [
    {
      label: "Draw",
      icon: <FaPen className="text-xl text-neutral-600" />,
      type: Tools.Draw,
      isPopover: true,
      onClick: handleDrawClick,
      shortcut: "D",
    },
    {
      label: "Select",
      icon: <LuMousePointer2 className="text-2xl text-neutral-600" />,
      type: Tools.Select,
      onClick: () => setTool(Tools.Select),
      shortcut: "S",
    },
    {
      label: "Move",
      icon: <MdOutlineOpenWith className="text-2xl text-neutral-600" />,
      type: Tools.Move,
      onClick: () => setTool(Tools.Move),
      shortcut: "R",
    },
    {
      label: "Scale",
      icon: <MdOutlineAspectRatio className="text-2xl text-neutral-600" />,
      type: Tools.Scale,
      onClick: () => setTool(Tools.Scale),
      shortcut: "L",
    },
    {
      label: "Eraser",
      icon: <FaEraser className="text-2xl text-neutral-600" />,
      type: Tools.Eraser,
      onClick: () => setTool(Tools.Eraser),
      shortcut: "E",
    },
    {
      label: "Color",
      icon: <FaFillDrip className="text-2xl text-neutral-600" />,
      type: Tools.Color,
      isPopover: true,
      popoverContent: colorPickerContent,
      onClick: () => {
        setTool(Tools.Color);
        setIsColorPopoverVisible(true);
      },
      extraContent: (
        <div
          className="w-full h-1 mt-1 rounded-sm mx-auto mb-0.5"
          style={{ backgroundColor: currentColor }}
        />
      ),
      shortcut: "C",
    },
    {
      label: "Zoom",
      icon: <FaSearchPlus className="text-2xl text-neutral-600" />,
      type: Tools.Zoom,
      onClick: () => setTool(Tools.Zoom),
      shortcut: "Shift + Scroll",
    },
    {
      label: "Undo",
      icon: <FaUndo className="text-2xl text-neutral-600" />,
      type: Tools.Undo,
      onClick: handleUndo,
      shortcut: "Ctrl+Z",
    },
    {
      label: "Redo",
      icon: <FaRedo className="text-2xl text-neutral-600" />,
      type: Tools.Redo,
      onClick: handleRedo,
      shortcut: "Ctrl+Y",
    },
  ];

  return (
    <div className="absolute left-4 top-2 bg-white border rounded-sm pt-1 px-2 z-10">
      <div className="flex items-center justify-between border-b pb-0.5">
        <p className="font-semibold">Tools</p>
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="text-neutral-600 hover:text-neutral-800 cursor-pointer"
        >
          {!showShortcuts ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <div className="flex flex-col space-y-2 py-2">
        {toolButtons.map((button) => {
          const btnElement = (
            <button
              key={button.type}
              className={`flex flex-col items-center space-x-1 px-1.5 py-1 rounded-sm transition relative ${
                tool === button.type
                  ? "bg-neutral-200 border border-neutral-400"
                  : "bg-neutral-100 border border-neutral-100 hover:bg-neutral-300"
              }`}
              onClick={button.onClick}
            >
              <div className="flex items-center my-1">
                {button.icon}
                <p className="text-sm text-neutral-600 ml-1">{button.label}</p>
              </div>
              {button.extraContent}
              {button.shortcut && showShortcuts && (
                <div className="text-neutral-600 text-xs w-full border-t pt-1 border-neutral-400">
                  Key: {button.shortcut}
                </div>
              )}
            </button>
          );

          if (button.type === Tools.Draw) {
            return (
              <Popover
                key={button.type}
                content={popoverContent}
                trigger="click"
                placement="rightTop"
                open={isPopoverVisible}
                onOpenChange={(open) => setIsPopoverVisible(open)}
              >
                {btnElement}
              </Popover>
            );
          }

          if (button.type === Tools.Color) {
            return (
              <Popover
                key={button.type}
                content={button.popoverContent}
                trigger="click"
                placement="bottom"
                open={isColorPopoverVisible}
                onOpenChange={(open) => setIsColorPopoverVisible(open)}
              >
                {btnElement}
              </Popover>
            );
          }

          return btnElement;
        })}
      </div>
    </div>
  );
};

export default ToolsTab;
