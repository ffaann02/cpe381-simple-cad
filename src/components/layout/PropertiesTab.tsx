import React from "react";
import { useTab } from "@/context/AppContext";
import { Circle, Curve, Ellipse, Line } from "@/interface/shape";

const PropertiesTab: React.FC = () => {
  const {
    layers,
    setLayers,
    lines,
    setLines,
    circles,
    setCircles,
    curves,
    setCurves,
    ellipses,
    setEllipses,
    selectedLayerId,
  } = useTab();

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const line = lines.find((l) => l.layerId === selectedLayerId);
  const circle = circles.find((c) => c.layerId === selectedLayerId);
  const curve = curves.find((c) => c.layerId === selectedLayerId);
  const ellipse = ellipses.find((e) => e.layerId === selectedLayerId);

  const handleLineChange = (field: keyof Line, value: any) => {
    if (!selectedLayerId || !line) return;
    const updatedLines = lines.map((l) =>
      l.layerId === selectedLayerId ? { ...l, [field]: value } : l
    );
    setLines(updatedLines);
  };

  const handleLinePointChange = (
    point: "start" | "end",
    axis: "x" | "y",
    value: number
  ) => {
    if (!selectedLayerId || !line) return;
    const updatedLines = lines.map((l) =>
      l.layerId === selectedLayerId
        ? { ...l, [point]: { ...l[point], [axis]: value } }
        : l
    );
    setLines(updatedLines);
  };

  const handleCircleChange = (field: keyof Circle, value: any) => {
    if (!selectedLayerId || !circle) return;
    const updatedCircles = circles.map((c) =>
      c.layerId === selectedLayerId ? { ...c, [field]: value } : c
    );
    setCircles(updatedCircles);
  };

  const handleCircleCenterChange = (axis: "x" | "y", value: number) => {
    if (!selectedLayerId || !circle) return;
    const updatedCircles = circles.map((c) =>
      c.layerId === selectedLayerId
        ? { ...c, center: { ...c.center, [axis]: value } }
        : c
    );
    setCircles(updatedCircles);
  };

  const handleCurveChange = (field: keyof Curve, value: any) => {
    if (!selectedLayerId || !curve) return;
    const updatedCurves = curves.map((c) =>
      c.layerId === selectedLayerId ? { ...c, [field]: value } : c
    );
    setCurves(updatedCurves);
  };

  const handleCurvePointChange = (
    point: "p0" | "p1" | "p2" | "p3",
    axis: "x" | "y",
    value: number
  ) => {
    if (!selectedLayerId || !curve) return;
    const updatedCurves = curves.map((c) =>
      c.layerId === selectedLayerId
        ? { ...c, [point]: { ...c[point], [axis]: value } }
        : c
    );
    setCurves(updatedCurves);
  };

  const handleEllipseChange = (field: keyof Ellipse, value: any) => {
    if (!selectedLayerId || !ellipse) return;
    const updatedEllipses = ellipses.map((e) =>
      e.layerId === selectedLayerId ? { ...e, [field]: value } : e
    );
    setEllipses(updatedEllipses);
  };

  const handleEllipseCenterChange = (axis: "x" | "y", value: number) => {
    if (!selectedLayerId || !ellipse) return;
    const updatedEllipses = ellipses.map((e) =>
      e.layerId === selectedLayerId
        ? { ...e, center: { ...e.center, [axis]: value } }
        : e
    );
    setEllipses(updatedEllipses);
  };

  return (
    <div className="pt-2 p-4 border rounded-md">
      <h2 className="font-bold mb-2 pb-2 border-b">Properties</h2>

      {line && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Line</h3>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              Start:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={line.start.x}
                onChange={(e) =>
                  handleLinePointChange("start", "x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={line.start.y}
                onChange={(e) =>
                  handleLinePointChange("start", "y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              End:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={line.end.x}
                onChange={(e) =>
                  handleLinePointChange("end", "x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={line.end.y}
                onChange={(e) =>
                  handleLinePointChange("end", "y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <label className="block mb-2">
            Color:
            <input
              type="color"
              value={line.color || "#000000"}
              onChange={(e) => handleLineChange("color", e.target.value)}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
        </>
      )}

      {circle && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Circle</h3>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              Center:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={circle.center.x}
                onChange={(e) =>
                  handleCircleCenterChange("x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={circle.center.y}
                onChange={(e) =>
                  handleCircleCenterChange("y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <label className="block mb-2">
            Radius:
            <input
              type="number"
              value={circle.radius}
              onChange={(e) => handleCircleChange("radius", parseFloat(e.target.value))}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
          <label className="block mb-2">
            Background Color:
            <input
              type="color"
              value={circle.backgroundColor || ""}
              onChange={(e) => handleCircleChange("backgroundColor", e.target.value)}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
          <label className="block mb-2">
            Border Color:
            <input
              type="color"
              value={circle.borderColor || "#000000"}
              onChange={(e) => handleCircleChange("borderColor", e.target.value)}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
        </>
      )}

      {curve && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Curve</h3>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              P0:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={curve.p0.x}
                onChange={(e) =>
                  handleCurvePointChange("p0", "x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={curve.p0.y}
                onChange={(e) =>
                  handleCurvePointChange("p0", "y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              P1:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={curve.p1.x}
                onChange={(e) =>
                  handleCurvePointChange("p1", "x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={curve.p1.y}
                onChange={(e) =>
                  handleCurvePointChange("p1", "y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              P2:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={curve.p2.x}
                onChange={(e) =>
                  handleCurvePointChange("p2", "x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={curve.p2.y}
                onChange={(e) =>
                  handleCurvePointChange("p2", "y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              P3:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={curve.p3.x}
                onChange={(e) =>
                  handleCurvePointChange("p3", "x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={curve.p3.y}
                onChange={(e) =>
                  handleCurvePointChange("p3", "y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <label className="block mb-2">
            Color:
            <input
              type="color"
              value={curve.color || "#000000"}
              onChange={(e) => handleCurveChange("color", e.target.value)}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
        </>
      )}

      {ellipse && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Ellipse</h3>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              Center:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={ellipse.center.x}
                onChange={(e) =>
                  handleEllipseCenterChange("x", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={ellipse.center.y}
                onChange={(e) =>
                  handleEllipseCenterChange("y", parseInt(e.target.value))
                }
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 mb-2 gap-x-2">
            <label className="col-span-1 text-sm text-gray-700 my-auto">
              Radius:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <input
                type="number"
                value={ellipse.rx}
                onChange={(e) => handleEllipseChange("rx", parseFloat(e.target.value))}
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <input
                type="number"
                value={ellipse.ry}
                onChange={(e) => handleEllipseChange("ry", parseFloat(e.target.value))}
                className="w-full border rounded-md shadow-sm py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <label className="block mb-2">
            Background Color:
            <input
              type="color"
              value={ellipse.backgroundColor || ""}
              onChange={(e) => handleEllipseChange("backgroundColor", e.target.value)}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
          <label className="block mb-2">
            Border Color:
            <input
              type="color"
              value={ellipse.borderColor || "#000000"}
              onChange={(e) => handleEllipseChange("borderColor", e.target.value)}
              className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
        </>
      )}

      {!line && !circle && !curve && !ellipse && (
        <div className="mt-4 text-sm text-gray-500">
          No layer selected
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;