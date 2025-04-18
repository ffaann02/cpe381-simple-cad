import Divider from "@/components/ui/divider";

const ShapeTab = () => {
  return (
    <div className="flex h-full">
      <button className="px-10 py-1.5 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <img src="https://cdn-icons-png.flaticon.com/512/9613/9613407.png" alt="line" className="w-[16px] text-neutral-600 mx-auto my-2" />
        <span className="text-slate-600 text-sm">Line</span>
      </button>
      <Divider />
      <button className="px-10 py-1.5 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <img src="https://cdn-icons-png.flaticon.com/512/2708/2708381.png" alt="line" className="w-[16px] text-neutral-600 mx-auto my-2" />
        <span className="text-slate-600 text-sm">Curve</span>
      </button>
      <Divider />
      <button className="px-10 py-1.5 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <img src="https://cdn-icons-png.flaticon.com/512/481/481078.png" alt="line" className="w-[16px] text-neutral-600 mx-auto my-2" />
        <span className="text-slate-600 text-sm">Circle</span>
      </button>
      <Divider />
      <button className="px-10 py-1.5 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <img src="https://cdn-icons-png.flaticon.com/512/1014/1014918.png" alt="line" className="w-[16px] text-neutral-600 mx-auto my-2" />
        <span className="text-slate-600 text-sm">Ellipse</span>
      </button>
    </div>
  );
};

export default ShapeTab;
