import { useTab } from "@/context/AppContext";
import { MdAdd, MdClose } from "react-icons/md";
import { Modal } from "antd";
import { useState } from "react";

const FileTab = () => {
  const {
    setOpenHomeModal,
    setShowGrid,
    setModalType,
    projects,
    currentProject,
    setCurrentProject,
    setProjects,
  } = useTab();

  const [closingProject, setClosingProject] = useState<string | null>(null);

  const handleProjectRemoval = (projectName: string) => {
    const newProjects = projects.filter((p) => p.name !== projectName);
    setProjects(newProjects);

    if (currentProject === projectName) {
      const index = projects.findIndex((p) => p.name === projectName);
      if (newProjects.length > 0) {
        const newIndex = index > 0 ? index - 1 : 0;
        setCurrentProject(newProjects[newIndex].name);
      } else {
        setCurrentProject("");
      }
    }
  };

  const handleClose = (projectName: string) => {
    const key = `cad_drawing_state_${projectName}`;
    const data = localStorage.getItem(key);

    if (data) {
      try {
        const parsed = JSON.parse(data);
        const isEmpty =
          Array.isArray(parsed.lines) &&
          parsed.lines.length === 0 &&
          Array.isArray(parsed.circles) &&
          parsed.circles.length === 0 &&
          Array.isArray(parsed.ellipses) &&
          parsed.ellipses.length === 0 &&
          Array.isArray(parsed.curves) &&
          parsed.curves.length === 0 &&
          Array.isArray(parsed.polygons) &&
          parsed.polygons.length === 0 &&
          Array.isArray(parsed.layers) &&
          parsed.layers.length === 0;

        if (isEmpty) {
          // localStorage.removeItem(key);
          handleProjectRemoval(projectName);
        } else {
          setClosingProject(projectName);
        }
      } catch (e) {
        // localStorage.removeItem(key);
        handleProjectRemoval(projectName);
      }
    } else {
      handleProjectRemoval(projectName);
    }
  };

  const confirmClose = () => {
    if (closingProject) {
      const key = `cad_drawing_state_${closingProject}`;
      localStorage.removeItem(key);
      handleProjectRemoval(closingProject);
      setClosingProject(null);
    }
  };

  return (
    <div className="flex gap-x-1">
      {projects.length > 0 &&
        projects.map((project, index) => {
          const isOpen = currentProject === project.name;
          return (
            <button
              key={index}
              className={`flex cursor-pointer hover:bg-white rounded-sm border border-neutral-300 items-center pl-2 pr-1 py-0.5 ${
                isOpen ? "bg-white" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              <p
                onClick={() => {
                  setCurrentProject(project.name);
                }}
              >
                {project.name}.cad
              </p>
              <MdClose
                className="text-lg text-neutral-600 m-auto ml-2 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(project.name);
                }}
              />
            </button>
          );
        })}

      <button
        className="flex rounded-sm border border-neutral-300 bg-neutral-100 px-0.5 py-0.5 space-x-2 cursor-pointer"
        onClick={() => {
          setShowGrid(false);
          setModalType("new");
          setOpenHomeModal(true);
        }}
      >
        <MdAdd className="text-xl text-neutral-600 m-auto" />
      </button>

      <Modal
        open={!!closingProject}
        onOk={confirmClose}
        onCancel={() => setClosingProject(null)}
        okText="Confirm"
        cancelText="Cancel"
        title="Close Project"
        okType="danger"
      >
        <p>
          This project has unsaved drawing data. Are you sure you want to close
          it? All data will be lost.
        </p>
      </Modal>
    </div>
  );
};

export default FileTab;
