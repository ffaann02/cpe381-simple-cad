import React, { useState } from "react";
import { FaPen } from "react-icons/fa6";
import { LuMousePointer2 } from "react-icons/lu";
import { PiSelectionBold } from "react-icons/pi";
import { MdOutlineOpenWith, MdRotate90DegreesCcw } from "react-icons/md";
import { PiFlipHorizontalFill } from "react-icons/pi";
import { FaFillDrip, FaEraser, FaUndo, FaRedo } from "react-icons/fa";
import { Tools } from "@/interface/tool";
import { useTab } from "@/context/AppContext";

const ToolsTab = () => {
  const { tool, setTool } = useTab();
  const toolButtons = [
    {
        label: "Draw",
        icon: <FaPen className="text-xl text-neutral-600" />,
        type: Tools.Draw,
    },
    {
      label: "Select",
      icon: <LuMousePointer2 className="text-2xl text-neutral-600" />,
      type: Tools.Select,
    },
    {
      label: "Hover",
      icon: <PiSelectionBold className="text-2xl text-neutral-600" />,
      type: Tools.Hover,
    },
    {
      label: "Move",
      icon: <MdOutlineOpenWith className="text-2xl text-neutral-600" />,
      type: Tools.Move,
    },
    {
      label: "Rotate",
      icon: <MdRotate90DegreesCcw className="text-2xl text-neutral-600" />,
      type: Tools.Rotate,
    },
    {
      label: "Flip",
      icon: <PiFlipHorizontalFill  className="text-2xl text-neutral-600" />,
      type: Tools.Flip,
    },
    {
      label: "Color",
      icon: <FaFillDrip className="text-2xl text-neutral-600" />,
      type: Tools.Color,
    },
    {
      label: "Eraser",
      icon: <FaEraser className="text-2xl text-neutral-600" />,
      type: Tools.Eraser,
    },
    {
      label: "Undo",
      icon: <FaUndo className="text-2xl text-neutral-600" />,
      type: Tools.Undo,
    },
    {
      label: "Redo",
      icon: <FaRedo className="text-2xl text-neutral-600" />,
      type: Tools.Redo,
    },
  ];

  return (
    <div className="absolute left-4 top-2 bg-white border rounded-sm pt-1 px-2 z-10">
      <p className="text-center border-b font-semibold pb-0.5">Tools</p>
      <div className="flex flex-col space-y-2 py-2">
        {toolButtons.map((button) => (
          <button
            key={button.type}
            className={`flex cursor-pointer items-center space-x-1 px-1.5 py-1 rounded-sm transition
              ${
                tool === button.type
                  ? "bg-neutral-200 border border-neutral-400"
                  : "bg-neutral-100 border border-neutral-100 hover:bg-neutral-300"
              }
            `}
            onClick={() => setTool(button.type)}
          >
            {button.icon}
            <p className="text-sm text-neutral-600 my-auto">{button.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolsTab;
