import Properties from "@/components/pages/docs/Properties";
import Shotcut from "@/components/pages/docs/Shortcut";
import Tools from "@/components/pages/docs/Tools";
import { useState, useRef, useEffect } from "react";
import { FaShapes } from "react-icons/fa";
import { RiToolsFill } from "react-icons/ri";
import { LuTableProperties, LuBringToFront } from "react-icons/lu";
import { MdShortcut } from "react-icons/md";
import { TbLine ,TbPolygon ,TbTopologyRing } from "react-icons/tb";
import { PiBezierCurveDuotone } from "react-icons/pi";

const Docs = () => {
  const [tab, setTab] = useState("");
  const [activeSection, setActiveSection] = useState<
    "shape" | "line" | "curve" | "circle" | "ellipse" | "polygon"
  >("shape");

  const shapeRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const lineRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const curveRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const circleRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const ellipseRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const polygonRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    const sections = [
      { ref: shapeRef, name: "shape" },
      { ref: lineRef, name: "line" },
      { ref: curveRef, name: "curve" },
      { ref: circleRef, name: "circle" },
      { ref: ellipseRef, name: "ellipse" },
      { ref: polygonRef, name: "polygon" },
    ];

    const observer = new window.IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const entry = visible[0];
          const found = sections.find((s) => s.ref.current === entry.target);
          if (found) setActiveSection(found.name as typeof activeSection);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -70% 0px",
        threshold: [0.2, 0.5, 1],
      }
    );

    sections.forEach((section) => {
      if (section.ref.current) observer.observe(section.ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToHeading = (
    ref: React.RefObject<HTMLDivElement>,
    section: typeof activeSection
  ) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(section);
    }
  };

  const renderTab = () => {
    switch (tab) {
      case "tools":
        return <Tools />;
      case "properties":
        return <Properties />;
      case "shotcut":
        return <Shotcut />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-neutral-100 p-2 shadow-sm flex flex-col">
        <h1 className="text-2xl text-neutral-600 font-bold m-4">
          Documentation
        </h1>
        <nav className="flex px-2 flex-col">
          <button
            className={`flex gap-2 items-center rounded p-2 text-left hover:text-blue-400 ${
              tab === ""
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-neutral-600"
            }`}
            onClick={() => setTab("")}
          >
            <FaShapes />
            Shape
          </button>
          <button
            className={`flex gap-1 items-center rounded p-2 text-left hover:text-blue-400 ${
              tab === "tools"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-neutral-600"
            }`}
            onClick={() => setTab("tools")}
          >
            <RiToolsFill className="text-xl" />
            Tools
          </button>
          <button
            className={`flex gap-1 items-center rounded p-2 text-left hover:text-blue-400 ${
              tab === "properties"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-neutral-600"
            }`}
            onClick={() => setTab("properties")}
          >
            <LuTableProperties />
            Properties
          </button>
          <button
            className={`flex gap-1 items-center rounded p-2 text-left hover:text-blue-400 ${
              tab === "shotcut"
                ? "bg-blue-100 text-blue-500 font-bold"
                : "text-neutral-600"
            }`}
            onClick={() => setTab("shotcut")}
          >
            <MdShortcut className="text-xl" />
            Shortcut
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-neutral-50 p-4">
        {tab === "" ? (
          <div className="grid grid-cols-7 gap-8 w-full min-h-screen">
            <div className="flex flex-col gap-5 px-4 col-span-4 col-start-2">
              <div ref={shapeRef}>
                <h2 className="text-3xl font-bold text-neutral-700 mb-4">
                  Shape
                </h2>
                <p className="text-base text-neutral-700">
                  In this project, a <b>Shape</b> is any basic geometric object
                  that can be drawn and manipulated on the canvas. The main
                  types of shapes supported are lines, curves, circles, and
                  polygons. Each type of shape has its own unique properties and
                  is constructed using specific mathematical algorithms. The
                  following sections will introduce each shape in detail,
                  explaining how they are defined and how they are rendered.
                </p>
              </div>

              <div
                ref={lineRef}
                className="shadow rounded-xl bg-white text-neutral-600 p-4"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold mb-4">Line</h2>
                  <TbLine className="text-4xl text-neutral-500 mb-2" />
                </div>
                <p className="text-base">
                  A <b>Line</b> is the simplest geometric shape, defined by two
                  points (start and end). The line is rendered using{" "}
                  <b>Bresenham's Line Algorithm</b>, which efficiently
                  determines which pixels should be plotted to form a close
                  approximation to a straight line between two points. The
                  algorithm uses only integer addition, subtraction, and bit
                  shifting, avoiding floating-point arithmetic.
                  <br />
                  <b>Formula:</b> For two points (x₁, y₁) and (x₂, y₂), the
                  algorithm increments x and y based on the error term to decide
                  the next pixel.
                </p>
                <ul className="list-disc ml-6 my-2 text-base">
                  <li>
                    <b>Definition:</b> A straight segment connecting two points
                    in 2D or 3D space.
                  </li>
                  <li>
                    <b>Properties:</b> Start point (x₁, y₁), end point (x₂, y₂),
                    length, angle.
                  </li>
                  <li>
                    <b>Usage:</b> Used to create wireframes, boundaries, and as
                    construction guides.
                  </li>
                </ul>
                <div className="bg-neutral-200 rounded p-3 my-2">
                  <b>Algorithm:</b> Bresenham's Line Algorithm
                  <br />
                  <b>Key step:</b> error = dx - dy; update x and y based on
                  error.
                </div>
              </div>

              <div
                ref={curveRef}
                className="shadow rounded-xl bg-white text-neutral-600 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-3xl font-bold">Curve</h2>
                  <PiBezierCurveDuotone className="text-4xl rotate-45" />
                </div>
                <p className="text-base">
                  A <b>Curve</b> (specifically a cubic Bézier curve) is defined
                  by four control points. The curve is rendered using the{" "}
                  <b>Bézier Curve Algorithm</b>, which computes intermediate
                  points using the Bernstein polynomial formula.
                  <br />
                  <b>Formula:</b> For parameter t ∈ [0,1]:
                  <br />
                  B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
                </p>
                <ul className="list-disc ml-6 my-2 text-base">
                  <li>
                    <b>Definition:</b> A smooth, continuous line defined by
                    mathematical equations and control points.
                  </li>
                  <li>
                    <b>Properties:</b> Control points (P₀, P₁, P₂, P₃), degree,
                    curvature.
                  </li>
                  <li>
                    <b>Usage:</b> Used for drawing smooth paths, splines, and
                    complex shapes.
                  </li>
                </ul>
                <div className="bg-neutral-200 rounded p-3 my-2">
                  <b>Algorithm:</b> Bézier Curve Algorithm
                  <br />
                  <b>Key formula:</b> B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂
                  + t³P₃
                </div>
              </div>

              <div
                ref={circleRef}
                className="shadow rounded-xl bg-white text-neutral-600 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-3xl font-bold">Circle</h2>
                  <TbTopologyRing  className="text-4xl" />
                </div>
                <p className="text-base">
                  A <b>Circle</b> is defined by a center point and a radius. The
                  circle is rendered using the <b>Midpoint Circle Algorithm</b>,
                  which determines the points needed to draw a circle by
                  incrementally calculating the next pixel based on the previous
                  one, exploiting the circle's symmetry.
                  <br />
                  <b>Formula:</b> The set of points (x, y) that satisfy (x - h)²
                  + (y - k)² = r², where (h, k) is the center and r is the
                  radius.
                </p>
                <ul className="list-disc ml-6 my-2 text-base">
                  <li>
                    <b>Definition:</b> A set of points equidistant from a center
                    point in a plane.
                  </li>
                  <li>
                    <b>Properties:</b> Center (h, k), radius (r), circumference,
                    area.
                  </li>
                  <li>
                    <b>Usage:</b> Used for arcs, round features, and holes in
                    designs.
                  </li>
                </ul>
                <div className="bg-neutral-200 rounded p-3 my-2">
                  <b>Algorithm:</b> Midpoint Circle Algorithm
                  <br />
                  <b>Key step:</b> Decision parameter p = 1 - r; update x and y
                  based on p.
                </div>
              </div>

              <div
                ref={ellipseRef}
                className="shadow rounded-xl bg-white text-neutral-600 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-3xl font-bold">Ellipse</h2>
                  <LuBringToFront className="text-2xl" />
                </div>
                <p className="text-base">
                  An <b>Ellipse</b> is defined by a center point and two radii
                  (horizontal and vertical). The ellipse is rendered using the{" "}
                  <b>Midpoint Ellipse Algorithm</b>, which incrementally
                  determines the next pixel to plot based on a decision
                  parameter, efficiently drawing the ellipse by exploiting its
                  symmetry.
                  <br />
                  <b>Formula:</b> The set of points (x, y) that satisfy{" "}
                  <code>(x - h)² / rx² + (y - k)² / ry² = 1</code>, where (h, k)
                  is the center, rx is the horizontal radius, and ry is the
                  vertical radius.
                </p>
                <ul className="list-disc ml-6 my-2 text-base">
                  <li>
                    <b>Definition:</b> A set of points equidistant from a center
                    point in a plane.
                  </li>
                  <li>
                    <b>Properties:</b> Center (h, k), radius (r), circumference,
                    area.
                  </li>
                  <li>
                    <b>Usage:</b> Used for arcs, round features, and holes in
                    designs.
                  </li>
                </ul>
                <div className="bg-neutral-200 rounded p-3 my-2">
                  <b>Algorithm:</b> Midpoint Ellipse Algorithm
                  <br />
                  <b>Key step:</b> Use two regions with separate decision
                  parameters to determine whether to move horizontally,
                  vertically, or diagonally, updating x and y based on the
                  midpoint's position relative to the ellipse.
                </div>
              </div>

              <div
                ref={polygonRef}
                className="shadow rounded-xl bg-white text-neutral-600 p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-3xl font-bold">Polygon</h2>
                  <TbPolygon className="text-4xl" />
                </div>
                <p className="text-base">
                  A <b>Polygon</b> is a closed shape defined by a sequence of
                  connected points (vertices). The edges of the polygon are
                  rendered by connecting each pair of consecutive vertices using{" "}
                  <b>Bresenham's Line Algorithm</b>.
                  <br />
                  <b>Formula:</b> For each edge, draw a line from vertex Vₙ to
                  Vₙ₊₁ using the line algorithm. The polygon is closed by
                  connecting the last vertex back to the first.
                </p>
                <ul className="list-disc ml-6 my-2 text-base">
                  <li>
                    <b>Definition:</b> A closed figure with three or more
                    straight sides.
                  </li>
                  <li>
                    <b>Properties:</b> Vertices (points), number of sides,
                    perimeter, area.
                  </li>
                  <li>
                    <b>Usage:</b> Used for complex shapes, meshes, and
                    boundaries.
                  </li>
                </ul>
                <div className="bg-neutral-200 rounded p-3 my-2">
                  <b>Algorithm:</b> Bresenham's Line Algorithm (for edges)
                  <br />
                  <b>Key step:</b> For each edge, apply the line algorithm
                  between consecutive vertices.
                </div>
              </div>
            </div>
            <div className="flex flex-col sticky top-8 h-fit col-span-1 col-start-7">
              <button
                onClick={() => scrollToHeading(shapeRef, "shape")}
                className={`flex items-center min-h-[44px] p-2 text-xl font-semibold transition-all
                  ${
                    activeSection === "shape"
                      ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                      : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
                  }`}
              >
                Shape
              </button>
              <button
                onClick={() => scrollToHeading(lineRef, "line")}
                className={`flex items-center min-h-[44px] p-4 text-xl font-semibold transition-all
                  ${
                    activeSection === "line"
                      ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                      : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
                  }`}
              >
                - Line
              </button>
              <button
                onClick={() => scrollToHeading(curveRef, "curve")}
                className={`flex items-center min-h-[44px] p-4 text-xl font-semibold transition-all
                  ${
                    activeSection === "curve"
                      ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                      : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
                  }`}
              >
                - Curve
              </button>
              <button
                onClick={() => scrollToHeading(circleRef, "circle")}
                className={`flex items-center min-h-[44px] p-4 text-xl font-semibold transition-all
                  ${
                    activeSection === "circle"
                      ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                      : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
                  }`}
              >
                - Circle
              </button>
              <button
                onClick={() => scrollToHeading(ellipseRef, "ellipse")}
                className={`flex items-center min-h-[44px] p-4 text-xl font-semibold transition-all
                  ${
                    activeSection === "ellipse"
                      ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                      : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
                  }`}
              >
                - Ellipse
              </button>
              <button
                onClick={() => scrollToHeading(polygonRef, "polygon")}
                className={`flex items-center min-h-[44px] p-4 text-xl font-semibold transition-all
                  ${
                    activeSection === "polygon"
                      ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                      : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
                  }`}
              >
                - Polygon
              </button>
            </div>
          </div>
        ) : (
          renderTab()
        )}
      </main>
    </div>
  );
};

export default Docs;
