import { useTab } from "@/context/AppContext";
import { MdAdd, MdClose } from "react-icons/md";

const FileTab = () => {
  const { setOpenHomeModal, setShowGrid, setModalType, projects } = useTab();
  return (
    <div className="flex gap-x-1">
      {projects.length > 0 &&
        projects.map((project, index) => (
          <button
            key={index}
            className="flex rounded-sm border border-neutral-300 items-center bg-white pl-2 pr-1 py-0.5"
            onClick={() => {
              setOpenHomeModal(true);
              console.log(`Project ${project.name} clicked`);
            }}
          >
            <p>{project.name}</p>
            <MdClose className="text-lg text-neutral-600 m-auto ml-4 cursor-pointer" />
          </button>
        ))}
      <button
        className="flex rounded-sm border border-neutral-300 bg-neutral-100 px-0.5 py-0.5 space-x-2 cursor-pointer"
        onClick={() => {
          setShowGrid(false);
          setModalType("new");
          setOpenHomeModal(true);
          console.log("New Project triggered");
        }}
      >
        <MdAdd className="text-xl text-neutral-600 m-auto" />
      </button>
    </div>
  );
};

export default FileTab;
