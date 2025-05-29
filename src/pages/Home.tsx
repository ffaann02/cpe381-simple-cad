import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTab } from "@/context/AppContext";
import { Select, message } from "antd"; // Import message for notifications
import dayjs from "dayjs";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";
import { Line, Circle, Ellipse, Curve, Polygon } from "@/interface/shape"; // Import necessary shape types
import { Layer } from "@/interface/tab"; // Import Layer type

const fallbackThumbnail =
  "https://cad-kenkyujo.com/en/wp-content/uploads/2023/02/AutoCAD-e1675502269600.jpg";

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
    setLines, // Destructure setters for shapes
    setCircles,
    setEllipses,
    setCurves,
    setPolygons, // Added setPolygons
    setLayers, // Added setLayers
    setCanvasSize, // Added setCanvasSize
    setCurrentProject, // Added setCurrentProject
    setSelectedLayerId, // Added setSelectedLayerId
    resetCanvasState, // Added resetCanvasState
    setProjects,
    setTab,
  } = useTab();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("Recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [cadProjects, setCadProjects] = useState<CADProject[]>([]);

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
    // Reset canvas state to a new, empty project
    resetCanvasState();
    // Set a temporary project name or open a modal for user to input
    // For now, let's navigate to editor and allow user to save later
    setCurrentProject(null); // Clear current project so a new one can be created/saved
    setShowGrid(true); // Show grid for new project
    setTab("file"); // Set the current tab to editor
    navigate("/editor");
    setCurrentProject(""); // Reset current project
  };

  const handleProjectCardClick = (projectTitle: string) => {
    try {
      const savedState = localStorage.getItem(getLocalStorageKey(projectTitle));
      if (!savedState) {
        message.error(`Project "${projectTitle}" not found.`);
        return;
      }
      const parsedState = JSON.parse(savedState);

      // Update global state with loaded project data
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
      setCurrentProject(projectTitle); // Set the current project
      setSelectedLayerId(parsedState.layers?.[0]?.id || null); // Select the first layer or null
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
      navigate("/editor"); // Navigate to the editor page
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

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-600">Recent</h1>
          <div className="flex items-center gap-4">
            <button className="flex text-sm text-neutral-600 bg-neutral-200 rounded px-3 py-1 gap-2 items-center">
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
              className="rounded-full px-4 py-1 bg-neutral-50 border-2 border-neutral-300 text-neutral-600"
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
              className="bg-neutral-100 rounded-lg shadow flex flex-col hover:bg-neutral-200 transition cursor-pointer"
              onClick={() => handleProjectCardClick(cad.title)} // Attach click handler here
            >
              <div className="h-48 flex items-center justify-center mb-3 rounded-t-lg border-b border-b-neutral-300">
                <img
                  src={cad.thumbnail}
                  alt={cad.title}
                  className="object-cover h-full w-full" // Added w-full for better image scaling
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
