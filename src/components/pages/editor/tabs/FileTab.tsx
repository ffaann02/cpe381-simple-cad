import Divider from "@/components/ui/divider";
import { useTab } from "@/context/AppContext";
import { CiCirclePlus, CiImport, CiExport } from "react-icons/ci";

const FileTab = () => {
  const { setModalType, setShowGrid, setOpenHomeModal } = useTab();

  const handleNewProject = () => {
    setShowGrid(false);
    setModalType("new");
    setOpenHomeModal(true);
    console.log("New Project triggered");
  };

  const handleImport = () => {
    setShowGrid(false);
    setOpenHomeModal(true);
    setModalType("import");
    console.log("Import triggered");
  };

  const handleExport = () => {
    setShowGrid(false);
    setOpenHomeModal(true);
    setModalType("export");
    console.log("Export triggered");
  };

  return (
    <div className="flex h-full">
      <button
        className="px-6 py-2 space-y-1 rounded-sm hover:bg-neutral-100 cursor-pointer"
        onClick={handleNewProject}
      >
        <CiCirclePlus className="text-2xl text-neutral-600 mx-auto" />
        <span className="text-slate-600 text-sm">New Design</span>
      </button>
      <Divider />
      <button
        className="px-10 py-2 space-y-1 rounded-sm hover:bg-neutral-100 cursor-pointer"
        onClick={handleImport}
      >
        <CiImport className="text-2xl text-neutral-600 mx-auto" />
        <span className="text-slate-600 text-sm">Import</span>
      </button>
      <Divider />
      <button
        className="px-10 py-2 space-y-1 rounded-sm hover:bg-neutral-100 cursor-pointer"
        onClick={handleExport}
      >
        <CiExport className="text-2xl text-neutral-600 mx-auto" />
        <span className="text-slate-600 text-sm">Export</span>
      </button>
    </div>
  );
};

export default FileTab;