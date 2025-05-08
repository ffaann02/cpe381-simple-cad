import React, { useState, useEffect } from "react";
import { Popover } from "antd";
import { FaPen, FaFillDrip, FaEraser, FaUndo, FaRedo } from "react-icons/fa";
import { LuMousePointer2 } from "react-icons/lu";
import { PiFlipHorizontalFill } from "react-icons/pi";
import { MdOutlineOpenWith, MdRotate90DegreesCcw } from "react-icons/md";
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
  const { tool, setTool, shape, setShape } = useTab();
  const [isPopoverVisible, setIsPopoverVisible] = useState<boolean>(false);

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
    setIsPopoverVisible(false);
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
    </div>
  );

  const popoverContent = (
    <div className="flex flex-col space-y-2">
      <p className="text-sm font-medium text-neutral-700">Select Shape</p>
      {renderShapeButtons()}
    </div>
  );

  const toolButtons = [
    {
      label: "Draw",
      icon: <FaPen className="text-xl text-neutral-600" />,
      type: Tools.Draw,
      isPopover: true,
      onClick: handleDrawClick,
    },
    {
      label: "Select",
      icon: <LuMousePointer2 className="text-2xl text-neutral-600" />,
      type: Tools.Select,
      onClick: () => setTool(Tools.Select),
    },
    {
      label: "Move",
      icon: <MdOutlineOpenWith className="text-2xl text-neutral-600" />,
      type: Tools.Move,
      onClick: () => setTool(Tools.Move),
    },
    {
      label: "Rotate",
      icon: <MdRotate90DegreesCcw className="text-2xl text-neutral-600" />,
      type: Tools.Rotate,
      onClick: () => setTool(Tools.Rotate),
    },
    {
      label: "Flip",
      icon: <PiFlipHorizontalFill className="text-2xl text-neutral-600" />,
      type: Tools.Flip,
      onClick: () => setTool(Tools.Flip),
    },
    {
      label: "Eraser",
      icon: <FaEraser className="text-2xl text-neutral-600" />,
      type: Tools.Eraser,
      onClick: () => setTool(Tools.Eraser),
    },
    {
      label: "Color",
      icon: <FaFillDrip className="text-2xl text-neutral-600" />,
      type: Tools.Color,
      onClick: () => setTool(Tools.Color),
    },
    {
      label: "Undo",
      icon: <FaUndo className="text-2xl text-neutral-600" />,
      type: Tools.Undo,
      onClick: () => setTool(Tools.Undo),
    },
    {
      label: "Redo",
      icon: <FaRedo className="text-2xl text-neutral-600" />,
      type: Tools.Redo,
      onClick: () => setTool(Tools.Redo),
    },
  ];

  return (
    <div className="absolute left-4 top-2 bg-white border rounded-sm pt-1 px-2 z-10">
      <p className="text-center border-b font-semibold pb-0.5">Tools</p>
      <div className="flex flex-col space-y-2 py-2">
        {toolButtons.map((button) => {
          const btnElement = (
            <button
              key={button.type}
              className={`flex items-center space-x-1 px-1.5 py-1 rounded-sm transition ${
                tool === button.type
                  ? "bg-neutral-200 border border-neutral-400"
                  : "bg-neutral-100 border border-neutral-100 hover:bg-neutral-300"
              }`}
              onClick={button.onClick}
            >
              {button.icon}
              <p className="text-sm text-neutral-600">{button.label}</p>
            </button>
          );

          return button.isPopover ? (
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
          ) : (
            btnElement
          );
        })}
      </div>
    </div>
  );
};

export default ToolsTab;