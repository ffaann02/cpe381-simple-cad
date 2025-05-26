import { useTab } from "@/context/AppContext";
import { MdAdd, MdClose } from "react-icons/md";

const FileTab = () => {
  const { setOpenHomeModal, setShowGrid, setModalType, projects } = useTab();
  return (
    <div className="flex gap-x-2">
      {projects.length > 0 &&
        projects.map((project, index) => (
          <button
            key={index}
            className="flex rounded-sm border border-neutral-300 items-center bg-white px-2 py-0.5"
            onClick={() => {
              // setOpenHomeModal(true);
              // console.log(`Project ${project.name} clicked`);
            }}
          >
            <p>{project.name}</p>
            <MdClose className="text-lg text-neutral-600 m-auto ml-4 cursor-pointer" />
          </button>
        ))}
      <button
        className="flex rounded-sm border border-neutral-300 bg-neutral-100 px-2 py-0.5 space-x-2 cursor-pointer"
        onClick={() => {
          setShowGrid(false);
          setModalType("new");
          setOpenHomeModal(true);
          console.log("New Project triggered");
        }}
      >
        {projects.length <= 0  && <p>New project</p>}
        <MdAdd className="text-lg text-neutral-600 m-auto" />
      </button>
    </div>
  );
};

export default FileTab;
