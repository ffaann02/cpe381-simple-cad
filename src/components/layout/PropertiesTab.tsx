import React, { useEffect, useState } from "react";
import { useTab } from "@/context/AppContext";
import { Circle, Curve, Ellipse, Line, Polygon } from "@/interface/shape";
import { MdRotate90DegreesCcw } from "react-icons/md";
import { PiFlipHorizontalFill } from "react-icons/pi";
import { Tools } from "@/interface/tool";
import { Layer } from "@/interface/tab";
import { rotatePoint, flipPoint } from "@/utils/transform";
import { getShapeCenter } from "@/utils/position";
import { Tabs, InputNumber } from "antd";
import ThicknessSlider from "@/components/pages/editor/properties-tab/ThicknessSlider";

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
    polygons,
    setPolygons,
    selectedLayerId,
    tool,
    setLog,
  } = useTab();

  const [rotationAngle, setRotationAngle] = useState<string | number>("90");
  const [rotationCenter, setRotationCenter] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isCenterManuallySet, setIsCenterManuallySet] = useState(false);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const line = lines.find((l) => l.layerId === selectedLayerId);
  const circle = circles.find((c) => c.layerId === selectedLayerId);
  const curve = curves.find((c) => c.layerId === selectedLayerId);
  const ellipse = ellipses.find((e) => e.layerId === selectedLayerId);
  const polygon = polygons.find((p) => p.layerId === selectedLayerId);

  const handleLineChange = (field: keyof Line, value: any) => {
    if (!selectedLayerId || !line) return;
    const updatedLines = lines.map((l) =>
      l.layerId === selectedLayerId ? { ...l, [field]: value } : l
    );
    setLines(updatedLines);

    // Update layer color
    const updatedLayers = layers.map((l) =>
      l.id === selectedLayerId ? { ...l, borderColor: value } : l
    );
    setLayers(updatedLayers);
  };

  const handleLinePointChange = (
    point: "start" | "end",
    axis: "x" | "y",
    value: number | null
  ) => {
    if (!selectedLayerId || !line || value === null) return;
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

    // Update layer color
    const updatedLayers = layers.map((l) =>
      l.id === selectedLayerId
        ? {
            ...l,
            ...(field === "borderColor" ? { borderColor: value } : {}),
            ...(field === "backgroundColor" ? { backgroundColor: value } : {}),
          }
        : l
    );
    setLayers(updatedLayers);
  };

  const handleCircleCenterChange = (axis: "x" | "y", value: number | null) => {
    if (!selectedLayerId || !circle || value === null) return;
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

    // Update layer color
    const updatedLayers = layers.map((l) =>
      l.id === selectedLayerId ? { ...l, borderColor: value } : l
    );
    setLayers(updatedLayers);
  };

  const handleCurvePointChange = (
    point: "p0" | "p1" | "p2" | "p3",
    axis: "x" | "y",
    value: number | null
  ) => {
    if (!selectedLayerId || !curve || value === null) return;
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

    // Update layer color
    const updatedLayers = layers.map((l) =>
      l.id === selectedLayerId
        ? {
            ...l,
            ...(field === "borderColor" ? { borderColor: value } : {}),
            ...(field === "backgroundColor" ? { backgroundColor: value } : {}),
          }
        : l
    );
    setLayers(updatedLayers);
  };

  const handleEllipseCenterChange = (axis: "x" | "y", value: number | null) => {
    if (!selectedLayerId || !ellipse || value === null) return;
    const updatedEllipses = ellipses.map((e) =>
      e.layerId === selectedLayerId
        ? { ...e, center: { ...e.center, [axis]: value } }
        : e
    );
    setEllipses(updatedEllipses);
  };

  const handlePolygonChange = (field: keyof Polygon, value: any) => {
    if (!selectedLayerId || !polygon) return;
    const updatedPolygons = polygons.map((p) =>
      p.layerId === selectedLayerId ? { ...p, [field]: value } : p
    );
    setPolygons(updatedPolygons);

    // Update layer color
    const updatedLayers = layers.map((l) =>
      l.id === selectedLayerId
        ? {
            ...l,
            ...(field === "borderColor" ? { borderColor: value } : {}),
            ...(field === "backgroundColor" ? { backgroundColor: value } : {}),
          }
        : l
    );
    setLayers(updatedLayers);
  };

  const handlePolygonPointChange = (
    index: number,
    axis: "x" | "y",
    value: number | null
  ) => {
    if (!selectedLayerId || !polygon || value === null) return;
    const updatedPolygons = polygons.map((p) =>
      p.layerId === selectedLayerId
        ? {
            ...p,
            points: p.points.map((point, i) =>
              i === index ? { ...point, [axis]: value } : point
            ),
          }
        : p
    );
    setPolygons(updatedPolygons);
  };

  const handleRotate = () => {
    if (!selectedLayerId) return;

    // Find the shape and its index
    const lineIndex = lines.findIndex((l) => l.layerId === selectedLayerId);
    const circleIndex = circles.findIndex((c) => c.layerId === selectedLayerId);
    const curveIndex = curves.findIndex((c) => c.layerId === selectedLayerId);
    const ellipseIndex = ellipses.findIndex(
      (e) => e.layerId === selectedLayerId
    );
    const polygonIndex = polygons.findIndex(
      (p) => p.layerId === selectedLayerId
    );

    let shapeType: "line" | "circle" | "ellipse" | "curve" | "polygon" | null =
      null;
    let shapeIndex = -1;

    if (lineIndex !== -1) {
      shapeType = "line";
      shapeIndex = lineIndex;
    } else if (circleIndex !== -1) {
      shapeType = "circle";
      shapeIndex = circleIndex;
    } else if (curveIndex !== -1) {
      shapeType = "curve";
      shapeIndex = curveIndex;
    } else if (ellipseIndex !== -1) {
      shapeType = "ellipse";
      shapeIndex = ellipseIndex;
    } else if (polygonIndex !== -1) {
      shapeType = "polygon";
      shapeIndex = polygonIndex;
    }

    if (shapeType && shapeIndex !== -1) {
      const center = rotationCenter;
      const angle =
        typeof rotationAngle === "string"
          ? parseFloat(rotationAngle) || 0
          : rotationAngle;

      switch (shapeType) {
        case "line":
          setLines((prevLines) =>
            prevLines.map((l, i) =>
              i === shapeIndex
                ? {
                    ...l,
                    start: rotatePoint(
                      l.start,
                      center,
                      (angle * Math.PI) / 180
                    ),
                    end: rotatePoint(l.end, center, (angle * Math.PI) / 180),
                  }
                : l
            )
          );
          break;
        case "circle":
          setCircles((prevCircles) =>
            prevCircles.map((c, i) =>
              i === shapeIndex
                ? {
                    ...c,
                    center: rotatePoint(
                      c.center,
                      center,
                      (angle * Math.PI) / 180
                    ),
                  }
                : c
            )
          );
          break;
        case "ellipse":
          setEllipses((prevEllipses) =>
            prevEllipses.map((e, i) =>
              i === shapeIndex
                ? {
                    ...e,
                    center: rotatePoint(
                      e.center,
                      center,
                      (angle * Math.PI) / 180
                    ),
                  }
                : e
            )
          );
          break;
        case "curve":
          setCurves((prevCurves) =>
            prevCurves.map((c, i) =>
              i === shapeIndex
                ? {
                    ...c,
                    p0: rotatePoint(c.p0, center, (angle * Math.PI) / 180),
                    p1: rotatePoint(c.p1, center, (angle * Math.PI) / 180),
                    p2: rotatePoint(c.p2, center, (angle * Math.PI) / 180),
                    p3: rotatePoint(c.p3, center, (angle * Math.PI) / 180),
                  }
                : c
            )
          );
          break;
        case "polygon":
          setPolygons((prevPolygons) =>
            prevPolygons.map((p, i) =>
              i === shapeIndex
                ? {
                    ...p,
                    points: p.points.map((point) =>
                      rotatePoint(point, center, (angle * Math.PI) / 180)
                    ),
                  }
                : p
            )
          );
          break;
      }

      setLog((prev) => [
        ...prev,
        {
          type: "info",
          message: `${shapeType} ${shapeIndex} rotated by ${angle} degrees around center (${center.x}, ${center.y})`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (!selectedLayerId) return;

    // Find the shape and its index
    const lineIndex = lines.findIndex((l) => l.layerId === selectedLayerId);
    const circleIndex = circles.findIndex((c) => c.layerId === selectedLayerId);
    const curveIndex = curves.findIndex((c) => c.layerId === selectedLayerId);
    const ellipseIndex = ellipses.findIndex(
      (e) => e.layerId === selectedLayerId
    );
    const polygonIndex = polygons.findIndex(
      (p) => p.layerId === selectedLayerId
    );

    let shapeType: "line" | "circle" | "ellipse" | "curve" | "polygon" | null =
      null;
    let shapeIndex = -1;
    let shapeCenter: { x: number; y: number } = { x: 0, y: 0 };

    if (lineIndex !== -1) {
      shapeType = "line";
      shapeIndex = lineIndex;
      shapeCenter = getShapeCenter(lines[lineIndex], "line");
    } else if (circleIndex !== -1) {
      shapeType = "circle";
      shapeIndex = circleIndex;
      shapeCenter = circles[circleIndex].center;
    } else if (curveIndex !== -1) {
      shapeType = "curve";
      shapeIndex = curveIndex;
      shapeCenter = getShapeCenter(curves[curveIndex], "curve");
    } else if (ellipseIndex !== -1) {
      shapeType = "ellipse";
      shapeIndex = ellipseIndex;
      shapeCenter = ellipses[ellipseIndex].center;
    } else if (polygonIndex !== -1) {
      shapeType = "polygon";
      shapeIndex = polygonIndex;
      shapeCenter = getShapeCenter(polygons[polygonIndex], "polygon");
    }

    if (shapeType && shapeIndex !== -1) {
      switch (shapeType) {
        case "line":
          setLines((prevLines) =>
            prevLines.map((l, i) =>
              i === shapeIndex
                ? {
                    ...l,
                    start: flipPoint(l.start, direction, shapeCenter),
                    end: flipPoint(l.end, direction, shapeCenter),
                  }
                : l
            )
          );
          break;
        case "circle":
          setCircles((prevCircles) =>
            prevCircles.map((c, i) =>
              i === shapeIndex
                ? {
                    ...c,
                    center: flipPoint(c.center, direction, shapeCenter),
                  }
                : c
            )
          );
          break;
        case "ellipse":
          setEllipses((prevEllipses) =>
            prevEllipses.map((e, i) =>
              i === shapeIndex
                ? {
                    ...e,
                    center: flipPoint(e.center, direction, shapeCenter),
                  }
                : e
            )
          );
          break;
        case "curve":
          setCurves((prevCurves) =>
            prevCurves.map((c, i) =>
              i === shapeIndex
                ? {
                    ...c,
                    p0: flipPoint(c.p0, direction, shapeCenter),
                    p1: flipPoint(c.p1, direction, shapeCenter),
                    p2: flipPoint(c.p2, direction, shapeCenter),
                    p3: flipPoint(c.p3, direction, shapeCenter),
                  }
                : c
            )
          );
          break;
        case "polygon":
          setPolygons((prevPolygons) =>
            prevPolygons.map((p, i) =>
              i === shapeIndex
                ? {
                    ...p,
                    points: p.points.map((point) =>
                      flipPoint(point, direction, shapeCenter)
                    ),
                  }
                : p
            )
          );
          break;
      }

      setLog((prev) => [
        ...prev,
        {
          type: "info",
          message: `${shapeType} ${shapeIndex} flipped ${direction}ly`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Update rotation center when shape changes
  useEffect(() => {
    if (!selectedLayerId) return;

    const line = lines.find((l) => l.layerId === selectedLayerId);
    const circle = circles.find((c) => c.layerId === selectedLayerId);
    const curve = curves.find((c) => c.layerId === selectedLayerId);
    const ellipse = ellipses.find((e) => e.layerId === selectedLayerId);
    const polygon = polygons.find((p) => p.layerId === selectedLayerId);

    // Reset menus and rotation center when selected shape changes
    setIsCenterManuallySet(false);
    setRotationAngle("90"); // Reset rotation angle to default

    // Only set the rotation center if it hasn't been manually set
    if (!isCenterManuallySet) {
      if (line) {
        setRotationCenter(getShapeCenter(line, "line"));
      } else if (circle) {
        setRotationCenter(circle.center);
      } else if (curve) {
        setRotationCenter(getShapeCenter(curve, "curve"));
      } else if (ellipse) {
        setRotationCenter(ellipse.center);
      } else if (polygon) {
        setRotationCenter(getShapeCenter(polygon, "polygon"));
      }
    }
  }, [selectedLayerId]); // Only depend on selectedLayerId

  // Add effect to handle transform tool selection
  useEffect(() => {
    if (tool === Tools.Rotate || tool === Tools.Flip) {
      // If no shape is selected, select the first visible shape
      if (!selectedLayerId) {
        const firstVisibleLayer = layers.find((layer) => layer.is_visible);
        if (firstVisibleLayer) {
          // Find the first shape in this layer
          const line = lines.find((l) => l.layerId === firstVisibleLayer.id);
          const circle = circles.find(
            (c) => c.layerId === firstVisibleLayer.id
          );
          const curve = curves.find((c) => c.layerId === firstVisibleLayer.id);
          const ellipse = ellipses.find(
            (e) => e.layerId === firstVisibleLayer.id
          );
          const polygon = polygons.find(
            (p) => p.layerId === firstVisibleLayer.id
          );

          if (line || circle || curve || ellipse || polygon) {
            // Set the selected layer ID to the first visible layer
            const updatedLayers = layers.map((layer: Layer) => ({
              ...layer,
              is_selected: layer.id === firstVisibleLayer.id,
            }));
            setLayers(updatedLayers);
          }
        }
      }
    }
  }, [
    tool,
    selectedLayerId,
    layers,
    lines,
    circles,
    curves,
    ellipses,
    polygons,
  ]);

  return (
    <div className="pt-2 p-4 border rounded-md">
      <h2 className="font-bold mb-2 pb-2 border-b">Properties</h2>

      {selectedLayer && <ThicknessSlider layerId={selectedLayer.id} />}

      {line && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Line</h3>
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              Start
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={line.start.x}
                onChange={(value) => handleLinePointChange("start", "x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={line.start.y}
                onChange={(value) => handleLinePointChange("start", "y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              End
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={line.end.x}
                onChange={(value) => handleLinePointChange("end", "x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={line.end.y}
                onChange={(value) => handleLinePointChange("end", "y", value)}
                className="w-full"
                precision={0}
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
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              Center:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={circle.center.x}
                onChange={(value) => handleCircleCenterChange("x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={circle.center.y}
                onChange={(value) => handleCircleCenterChange("y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <label className="block mb-2">
            Radius:
            <InputNumber
              value={circle.radius}
              onChange={(value) => handleCircleChange("radius", value)}
              className="w-full"
              precision={0}
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
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              P0
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={curve.p0.x}
                onChange={(value) => handleCurvePointChange("p0", "x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={curve.p0.y}
                onChange={(value) => handleCurvePointChange("p0", "y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              P1
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={curve.p1.x}
                onChange={(value) => handleCurvePointChange("p1", "x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={curve.p1.y}
                onChange={(value) => handleCurvePointChange("p1", "y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              P2
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={curve.p2.x}
                onChange={(value) => handleCurvePointChange("p2", "x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={curve.p2.y}
                onChange={(value) => handleCurvePointChange("p2", "y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              P3
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={curve.p3.x}
                onChange={(value) => handleCurvePointChange("p3", "x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={curve.p3.y}
                onChange={(value) => handleCurvePointChange("p3", "y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <label className="block mb-2">
            Color
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
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              Center
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={ellipse.center.x}
                onChange={(value) => handleEllipseCenterChange("x", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={ellipse.center.y}
                onChange={(value) => handleEllipseCenterChange("y", value)}
                className="w-full"
                precision={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-6 mb-2 gap-x-2">
            <label className="col-span-2 text-sm text-gray-700 my-auto font-semibold">
              Radius:
            </label>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">X:</label>
              <InputNumber
                value={ellipse.rx}
                onChange={(value) => handleEllipseChange("rx", value)}
                className="w-full"
                precision={0}
              />
            </div>
            <div className="col-span-2 flex items-center gap-x-1">
              <label className="text-sm text-gray-700">Y:</label>
              <InputNumber
                value={ellipse.ry}
                onChange={(value) => handleEllipseChange("ry", value)}
                className="w-full"
                precision={0}
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

      {polygon && (
        <>
          <h3 className="font-semibold mt-4 mb-2">Polygon</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-5 mb-2 gap-x-2">
              <label className="col-span-1 text-sm text-gray-700 my-auto font-semibold">
                Center
              </label>
              <div className="col-span-2 flex items-center gap-x-1">
                <label className="text-sm text-gray-700">X:</label>
                <InputNumber
                  value={getShapeCenter(polygon, "polygon").x}
                  onChange={(value) => {
                    if (value === null) return;
                    const center = getShapeCenter(polygon, "polygon");
                    const dx = value - center.x;
                    const updatedPoints = polygon.points.map(point => ({
                      x: point.x + dx,
                      y: point.y
                    }));
                    handlePolygonChange("points", updatedPoints);
                  }}
                  className="w-full"
                  precision={0}
                />
              </div>
              <div className="col-span-2 flex items-center gap-x-1">
                <label className="text-sm text-gray-700">Y:</label>
                <InputNumber
                  value={getShapeCenter(polygon, "polygon").y}
                  onChange={(value) => {
                    if (value === null) return;
                    const center = getShapeCenter(polygon, "polygon");
                    const dy = value - center.y;
                    const updatedPoints = polygon.points.map(point => ({
                      x: point.x,
                      y: point.y + dy
                    }));
                    handlePolygonChange("points", updatedPoints);
                  }}
                  className="w-full"
                  precision={0}
                />
              </div>
            </div>
            <div className="w-full h-[200px] overflow-y-auto pl-3 py-1.5 pr-1 border border-r-0 rounded-md">
              {polygon.points.map((point, index) => (
                <div key={index} className="grid grid-cols-5 mb-2 gap-x-2">
                  <label className="col-span-1 text-xs text-gray-700 my-auto font-semibold">
                    P{index + 1}
                  </label>
                  <div className="col-span-2 flex items-center gap-x-1">
                    <label className="text-sm text-gray-700 font-semibold">
                      X:
                    </label>
                    <InputNumber
                      value={point.x}
                      onChange={(value) => handlePolygonPointChange(index, "x", value)}
                      className="w-full"
                      precision={0}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-x-1">
                    <label className="text-sm text-gray-700">Y:</label>
                    <InputNumber
                      value={point.y}
                      onChange={(value) => handlePolygonPointChange(index, "y", value)}
                      className="w-full"
                      precision={0}
                    />
                  </div>
                </div>
              ))}
            </div>
            <label className="block mb-2">
              Border Color:
              <input
                type="color"
                value={polygon.borderColor || "#000000"}
                onChange={(e) => handlePolygonChange("borderColor", e.target.value)}
                className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </label>
            <label className="block mb-2">
              Background Color:
              <input
                type="color"
                value={polygon.backgroundColor || ""}
                onChange={(e) => handlePolygonChange("backgroundColor", e.target.value)}
                className="w-full border rounded-md shadow-sm py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </label>
          </div>
        </>
      )}

      {!line && !circle && !curve && !ellipse && !polygon && (
        <div className="mt-4 text-sm text-gray-500">No layer selected</div>
      )}

      {(line || circle || curve || ellipse || polygon) && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">Transform</h3>
          <Tabs
            defaultActiveKey="rotate"
            items={[
              {
                key: "rotate",
                label: (
                  <div className="flex items-center gap-2">
                    <MdRotate90DegreesCcw className="text-lg" />
                    <span>Rotate</span>
                  </div>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-gray-700">
                        Angle (degrees):
                        <InputNumber
                          value={rotationAngle}
                          onChange={(value) => {
                            if (value === null) return;
                            setRotationAngle(value);
                          }}
                          className="w-full"
                          precision={0}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-sm text-gray-700">
                          Center X:
                          <InputNumber
                            value={rotationCenter.x}
                            onChange={(value) => {
                              if (value === null) return;
                              setRotationCenter((prev) => ({
                                ...prev,
                                x: value,
                              }));
                              setIsCenterManuallySet(true);
                            }}
                            className="w-full"
                            precision={0}
                          />
                        </label>
                        <label className="text-sm text-gray-700">
                          Center Y:
                          <InputNumber
                            value={rotationCenter.y}
                            onChange={(value) => {
                              if (value === null) return;
                              setRotationCenter((prev) => ({
                                ...prev,
                                y: value,
                              }));
                              setIsCenterManuallySet(true);
                            }}
                            className="w-full"
                            precision={0}
                          />
                        </label>
                      </div>
                      <button
                        onClick={handleRotate}
                        className="w-full px-3 py-1.5 rounded-sm bg-blue-500 hover:bg-blue-600 text-white text-sm"
                      >
                        Apply Rotation
                      </button>
                    </div>
                  </div>
                ),
              },
              {
                key: "flip",
                label: (
                  <div className="flex items-center gap-2">
                    <PiFlipHorizontalFill className="text-lg" />
                    <span>Flip</span>
                  </div>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-center gap-2">
                      <button
                        onClick={() => handleFlip("horizontal")}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 w-fit"
                      >
                        <PiFlipHorizontalFill className="text-xl text-neutral-600" />
                        <span className="text-sm text-neutral-600">
                          Horizontal
                        </span>
                      </button>
                      <button
                        onClick={() => handleFlip("vertical")}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 w-fit"
                      >
                        <PiFlipHorizontalFill className="text-xl text-neutral-600 rotate-90" />
                        <span className="text-sm text-neutral-600">
                          Vertical
                        </span>
                      </button>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default PropertiesTab;
