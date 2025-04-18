import Divider from "@/components/ui/divider";
import { CiCirclePlus, CiImport, CiExport} from "react-icons/ci";

const HomeTab = () => {
  return (
    <div className="flex h-full">
      <button className="px-6 py-2 space-y-1 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <CiCirclePlus className="text-2xl text-neutral-600 mx-auto" />
        <span className="text-slate-600 text-sm">New Project</span>
      </button>
      <Divider />
      <button className="px-10 py-2 space-y-1 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <CiImport className="text-2xl text-neutral-600 mx-auto" />
        <span className="text-slate-600 text-sm">Import</span>
      </button>
      <Divider />
      <button className="px-10 py-2 space-y-1 rounded-sm hover:bg-neutral-100 cursor-pointer">
        <CiExport className="text-2xl text-neutral-600 mx-auto" />
        <span className="text-slate-600 text-sm">Export</span>
      </button>
    </div>
  );
};

export default HomeTab;
