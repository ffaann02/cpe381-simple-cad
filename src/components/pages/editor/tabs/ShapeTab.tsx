import Divider from "@/components/ui/divider";
import { useTab } from "@/context/AppContext";
import { ShapeMode } from "@/interface/shape";
import { Tools } from "@/interface/tool";

const ShapeTab = () => {
  const { shape, setShape, tool } = useTab();

  const isSelected = (currentShape: ShapeMode) => shape === currentShape;
  const isDrawToolActive = tool === Tools.Draw;

  return (
    <div className="flex h-full ml-2 space-x-2">
      <button
        className={`px-10 py-1.5 rounded-sm cursor-pointer ${
          isSelected(ShapeMode.Line)
            ? "border-2 border-neutral-300 bg-neutral-200"
            : "hover:bg-neutral-100"
        } ${isDrawToolActive ? "" : "pointer-events-none opacity-50"}`}
        onClick={() => setShape(ShapeMode.Line)}
        disabled={!isDrawToolActive}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/9613/9613407.png"
          alt="line"
          className="w-[16px] text-neutral-600 mx-auto my-2"
        />
        <span className="text-slate-600 text-sm">Line</span>
      </button>
      <Divider />
      <button
        className={`px-10 py-1.5 rounded-sm cursor-pointer ${
          isSelected(ShapeMode.Curve)
            ? "border-2 border-neutral-300 bg-neutral-200"
            : "hover:bg-neutral-100"
        } ${isDrawToolActive ? "" : "pointer-events-none opacity-50"}`}
        onClick={() => setShape(ShapeMode.Curve)}
        disabled={!isDrawToolActive}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/2708/2708381.png"
          alt="curve"
          className="w-[16px] text-neutral-600 mx-auto my-2"
        />
        <span className="text-slate-600 text-sm">Curve</span>
      </button>
      <Divider />
      <button
        className={`px-10 py-1.5 rounded-sm cursor-pointer ${
          isSelected(ShapeMode.Circle)
            ? "border-2 border-neutral-300 bg-neutral-200"
            : "hover:bg-neutral-100"
        } ${isDrawToolActive ? "" : "pointer-events-none opacity-50"}`}
        onClick={() => setShape(ShapeMode.Circle)}
        disabled={!isDrawToolActive}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/481/481078.png"
          alt="circle"
          className="w-[16px] text-neutral-600 mx-auto my-2"
        />
        <span className="text-slate-600 text-sm">Circle</span>
      </button>
      <Divider />
      <button
        className={`px-10 py-1.5 rounded-sm cursor-pointer ${
          isSelected(ShapeMode.Ellipse)
            ? "border-2 border-neutral-300 bg-neutral-200"
            : "hover:bg-neutral-100"
        } ${isDrawToolActive ? "" : "pointer-events-none opacity-50"}`}
        onClick={() => setShape(ShapeMode.Ellipse)}
        disabled={!isDrawToolActive}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/1014/1014918.png"
          alt="ellipse"
          className="w-[16px] text-neutral-600 mx-auto my-2"
        />
        <span className="text-slate-600 text-sm">Ellipse</span>
      </button>
      <Divider />
      <button
        className={`px-10 py-1.5 rounded-sm cursor-pointer ${
          isSelected(ShapeMode.Polygon)
            ? "border-2 border-neutral-300 bg-neutral-200"
            : "hover:bg-neutral-100"
        } ${isDrawToolActive ? "" : "pointer-events-none opacity-50"}`}
        onClick={() => setShape(ShapeMode.Polygon)}
        disabled={!isDrawToolActive}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/274/274375.png"
          alt="polygon"
          className="w-[16px] text-neutral-600 mx-auto my-2"
        />
        <span className="text-slate-600 text-sm">Polygon</span>
      </button>
    </div>
  );
};

export default ShapeTab;
