import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTab } from "@/context/AppContext";
import { Select } from "antd";
import dayjs from "dayjs";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";

const cadProjects = [
  {
    title: "A",
    date: "5/28/25, 7:11 PM",
    thumbnail:
      "https://cad-kenkyujo.com/en/wp-content/uploads/2023/02/AutoCAD-e1675502269600.jpg",
  },
  {
    title: "C",
    date: "5/27/25, 3:11 PM",
    thumbnail:
      "https://cad-kenkyujo.com/en/wp-content/uploads/2023/02/AutoCAD-e1675502269600.jpg",
  },
  {
    title: "B",
    date: "1/28/25, 3:11 PM",
    thumbnail:
      "https://cad-kenkyujo.com/en/wp-content/uploads/2023/02/AutoCAD-e1675502269600.jpg",
  },
  {
    title: "E",
    date: "1/28/24, 3:11 PM",
    thumbnail:
      "https://www.3dnatives.com/en/wp-content/uploads/sites/2/2023/01/zwcad.png",
  },
  {
    title: "D",
    date: "1/28/23, 3:04 PM",
    thumbnail:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXcOt-ETBQbIVFrQvDsn0wvYKXx1dYU7bMJDvr2DSLFRP-HAoHxrBRW-JtxpPCz3ZtRVA&usqp=CAU",
  },
];

function timeAgo(dateString: string) {
  const now = dayjs();
  const date = dayjs(dateString, "M/D/YY, h:mm A");
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

const Home = () => {
  const navigate = useNavigate();
  const [IsDescending, setIsDescending] = useState(true);
  const { setModalType, setShowGrid, setOpenHomeModal } = useTab();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("Recent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getSortedProjects = () => {
    let filtered = cadProjects.filter((cad) =>
      cad.title.toLowerCase().includes(search.toLowerCase())
    );
    let sorted = [...filtered];
    if (sortKey === "Recent") {
      sorted.sort((a, b) => {
        const aDate = dayjs(a.date, "M/D/YY, h:mm A");
        const bDate = dayjs(b.date, "M/D/YY, h:mm A");
        return sortOrder === "asc"
          ? aDate.valueOf() - bDate.valueOf()
          : bDate.valueOf() - aDate.valueOf();
      });
    } else if (sortKey === "Name") {
      sorted.sort((a, b) => {
        return sortOrder === "desc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
    } 
    return sorted;
  };

  const filteredProjects = getSortedProjects();

  const handleNewProject = () => {
    setShowGrid(false);
    setModalType("new");
    setOpenHomeModal(true);
    setTimeout(() => {
      navigate("/editor");
    }, 300);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-neutral-600">Recent</h1>
        <div className="flex items-center gap-4">
          <button className="flex text-sm text-neutral-600 bg-neutral-200 rounded px-3 py-1 gap-2 items-center">
            Sort by
            <Select
              className="bg-transparent text-neutral-600"
              defaultValue="Recent"
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
              {IsDescending ? <TbSortAscending /> : <TbSortDescending />}
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

      <div className="grid grid-cols-8 gap-6">
        <button
          className="bg-neutral-200 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-400 hover:bg-neutral-300 transition cursor-pointer h-48"
          onClick={handleNewProject}
        >
          <span className="text-5xl text-gray-400 mb-2">＋</span>
          <span className="text-lg text-neutral-600">Create a CAD</span>
        </button>

        {filteredProjects.map((cad, idx) => (
          <div
            key={idx}
            className="bg-neutral-100 rounded-lg shadow flex flex-col hover:bg-neutral-200 transition cursor-pointer"
          >
            <div className="h-28 bg-black flex items-center justify-center mb-3 rounded-t-lg">
              <img
                src={cad.thumbnail}
                alt={cad.title}
                className="h-full object-contain"
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
  );
};

export default Home;
