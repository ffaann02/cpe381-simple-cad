import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTab } from "@/context/AppContext";
import { Select, message, Modal, Input, Dropdown, MenuProps } from "antd"; // Import Modal, Input, Dropdown
import dayjs from "dayjs";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";
import { Line, Circle, Ellipse, Curve, Polygon } from "@/interface/shape";
import { Layer } from "@/interface/tab";
import { RxDotsHorizontal, RxDotsVertical } from "react-icons/rx";

const fallbackThumbnail =
  "https://static.thenounproject.com/png/140281-200.png";

function timeAgo(dateString: string) {
  const now = dayjs();
  const date = dayjs(dateString);
  const diffSeconds = now.diff(date, "second");

  if (diffSeconds < 60) return "just now";
  const diffMinutes = now.diff(date, "minute");
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  const diffHours = now.diff(date, "hour");
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = now.diff(date, "day");
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffMonths = now.diff(date, "month");
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  const diffYears = now.diff(date, "year");
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

interface CADProject {
  title: string;
  date: string;
  thumbnail: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [isDescending, setIsDescending] = useState(true);
  const {
    setModalType,
    setShowGrid,
    setOpenHomeModal,
    setLines,
    setCircles,
    setEllipses,
    setCurves,
    setPolygons,
    setLayers,
    setCanvasSize,
    setCurrentProject,
    setSelectedLayerId,
    resetCanvasState,
    setProjects,
    setTab,
  } = useTab();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("Recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [cadProjects, setCadProjects] = useState<CADProject[]>([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CADProject | null>(
    null
  );
  const [newProjectName, setNewProjectName] = useState("");

  // Helper to generate the localStorage key based on the project title
  const getLocalStorageKey = (projectTitle: string) =>
    `cad_drawing_state_${projectTitle}`;

  // Load from localStorage
  useEffect(() => {
    const loadedProjects: CADProject[] = [];

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cad_drawing_state_")) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;

          const data = JSON.parse(raw);
          const title = key.replace("cad_drawing_state_", "");
          const date = data.lastSaved || new Date().toISOString();
          const thumbnail = data.thumbnail || fallbackThumbnail;

          loadedProjects.push({ title, date, thumbnail });
        } catch (e) {
          console.error("Error parsing localStorage item", key, e);
        }
      }
    });

    setCadProjects(loadedProjects);
  }, []);

  const getSortedProjects = () => {
    let filtered = cadProjects.filter((cad) =>
      cad.title.toLowerCase().includes(search.toLowerCase())
    );

    let sorted = [...filtered];
    if (sortKey === "Recent") {
      sorted.sort((a, b) => {
        const aDate = dayjs(a.date);
        const bDate = dayjs(b.date);
        return sortOrder === "asc"
          ? aDate.valueOf() - bDate.valueOf()
          : bDate.valueOf() - aDate.valueOf();
      });
    } else if (sortKey === "Name") {
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      );
    }
    return sorted;
  };

  const filteredProjects = getSortedProjects();

  const handleNewProject = () => {
    resetCanvasState();
    setCurrentProject(null);
    setShowGrid(true);
    setTab("file");
    navigate("/editor");
    setCurrentProject("");
  };

  const handleProjectCardClick = (projectTitle: string) => {
    try {
      const savedState = localStorage.getItem(getLocalStorageKey(projectTitle));
      if (!savedState) {
        message.error(`Project "${projectTitle}" not found.`);
        return;
      }
      const parsedState = JSON.parse(savedState);

      setLines(parsedState.lines || []);
      setCircles(parsedState.circles || []);
      setCurves(parsedState.curves || []);
      setEllipses(parsedState.ellipses || []);
      setPolygons(parsedState.polygons || []);
      setLayers(parsedState.layers || []);
      setCanvasSize(
        parsedState.canvasSize || {
          width: 800,
          height: 600,
          backgroundColor: "#ffffff",
        }
      );
      setCurrentProject(projectTitle);
      setSelectedLayerId(parsedState.layers?.[0]?.id || null);
      setProjects((prev) => {
        if (prev.some((p) => p.name === projectTitle)) return prev;
        return [
          ...prev,
          {
            id: `project-${Date.now()}`,
            name: projectTitle,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      });
      setCurrentProject(projectTitle);
      message.success(`Project "${projectTitle}" loaded successfully!`);
      setTab("file");
      navigate("/editor");
    } catch (error) {
      console.error(`Failed to load project "${projectTitle}":`, error);
      message.error(
        `Failed to load project "${projectTitle}". Data might be corrupted.`
      );
    }
  };

  const handleChange = (value: string) => {
    setSortKey(value);
  };

  const handleSortOrderSwap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescending((prev) => !prev);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // --- New functions for Rename and Delete ---

  const handleRenameProject = () => {
    if (!selectedProject || !newProjectName.trim()) {
      message.error("Invalid project or new name.");
      return;
    }

    const oldTitle = selectedProject.title;
    const newTitle = newProjectName.trim();

    if (oldTitle === newTitle) {
      message.info("New name is the same as the old name.");
      setShowRenameModal(false);
      return;
    }

    if (
      cadProjects.some(
        (p) => p.title.toLowerCase() === newTitle.toLowerCase()
      )
    ) {
      message.error("A project with this name already exists.");
      return;
    }

    try {
      const oldKey = getLocalStorageKey(oldTitle);
      const newKey = getLocalStorageKey(newTitle);
      const savedState = localStorage.getItem(oldKey);

      if (savedState) {
        localStorage.setItem(newKey, savedState);
        localStorage.removeItem(oldKey);

        setCadProjects((prev) =>
          prev.map((project) =>
            project.title === oldTitle
              ? { ...project, title: newTitle }
              : project
          )
        );
        message.success(`Project "${oldTitle}" renamed to "${newTitle}".`);
      } else {
        message.error(`Project "${oldTitle}" not found in storage.`);
      }
    } catch (error) {
      console.error(`Error renaming project "${oldTitle}":`, error);
      message.error(`Failed to rename project "${oldTitle}".`);
    } finally {
      setShowRenameModal(false);
      setSelectedProject(null);
      setNewProjectName("");
    }
  };

  const handleDeleteProject = () => {
    if (!selectedProject) {
      message.error("No project selected for deletion.");
      return;
    }

    const projectTitle = selectedProject.title;
    const keyToDelete = getLocalStorageKey(projectTitle);

    try {
      localStorage.removeItem(keyToDelete);
      setCadProjects((prev) =>
        prev.filter((project) => project.title !== projectTitle)
      );
      message.success(`Project "${projectTitle}" deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting project "${projectTitle}":`, error);
      message.error(`Failed to delete project "${projectTitle}".`);
    } finally {
      setShowDeleteModal(false);
      setSelectedProject(null);
    }
  };

  const handleMenuClick =
    (project: CADProject, type: "rename" | "delete") =>
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click from firing
      setSelectedProject(project);
      if (type === "rename") {
        setNewProjectName(project.title); // Pre-fill current name
        setShowRenameModal(true);
      } else {
        setShowDeleteModal(true);
      }
    };

  const items = (project: CADProject): MenuProps["items"] => [
    {
      key: "1",
      label: (
        <span onClick={handleMenuClick(project, "rename")}>Rename</span>
      ),
    },
    {
      key: "2",
      label: (
        <span onClick={handleMenuClick(project, "delete")}>Delete</span>
      ),
      danger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 p-8 pt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-600">Recent</h1>
          <div className="flex items-center gap-4">
            <button className="flex text-sm text-neutral-600 rounded px-3 py-1 gap-2 items-center">
              Sort by
              <Select
                className="bg-transparent text-neutral-600"
                style={{ width: 90 }}
                onChange={handleChange}
                options={[
                  { value: "Recent", label: "Recent" },
                  { value: "Name", label: "Name" },
                ]}
                value={sortKey}
              />
              <button
                className="inline ml-1 cursor-pointer text-xl"
                onClick={handleSortOrderSwap}
              >
                {isDescending ? <TbSortAscending /> : <TbSortDescending />}
              </button>
            </button>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md px-4 py-1 bg-neutral-50 border-2 border-neutral-300 text-neutral-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <button
            className="bg-neutral-200 min-h-48 h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-400 hover:bg-neutral-300 transition cursor-pointer"
            onClick={handleNewProject}
          >
            <span className="text-5xl text-gray-400 mb-2">＋</span>
            <span className="text-lg text-neutral-600">Create a CAD</span>
          </button>

          {filteredProjects.map((cad, idx) => (
            <div
              key={idx}
              className="bg-neutral-100 rounded-lg shadow flex flex-col hover:bg-neutral-200 transition cursor-pointer relative" // Added relative for dropdown positioning
              onClick={() => handleProjectCardClick(cad.title)}
            >
              <div className="h-48 flex items-center justify-center mb-3 rounded-t-lg border-b border-b-neutral-300">
                <img
                  src={cad.thumbnail}
                  alt={cad.title}
                  className="object-cover h-full w-full"
                />
              </div>
              <div className="p-3">
                <div className="font-medium text-neutral-600 truncate">
                  {cad.title}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  {timeAgo(cad.date)}
                </div>
              </div>
              {/* Dropdown for rename/delete */}
              <div
                className="absolute top-2 right-2"
                onClick={(e) => e.stopPropagation()} // Prevent card click when clicking dropdown area
              >
                <Dropdown
                  menu={{ items: items(cad) }}
                  trigger={["click"]}
                  placement="bottomRight"
                  arrow
                >
                  <button className="p-1 hover:bg-neutral-300 rounded-md cursor-pointer">
                    <RxDotsHorizontal className="text-neutral-500 text-xl" />
                  </button>
                </Dropdown>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        title="Rename Project"
        open={showRenameModal}
        onOk={handleRenameProject}
        onCancel={() => setShowRenameModal(false)}
        okText="Rename"
        cancelText="Cancel"
      >
        <Input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Enter new project name"
          onPressEnter={handleRenameProject}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Delete Project"
        open={showDeleteModal}
        onOk={handleDeleteProject}
        onCancel={() => setShowDeleteModal(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete "
          <span className="font-semibold">{selectedProject?.title}</span>"?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Home;