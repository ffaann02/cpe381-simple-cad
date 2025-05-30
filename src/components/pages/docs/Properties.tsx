import React, { useRef, useState } from 'react';

const Properties = () => {
  const [activeSection, setActiveSection] = useState<
    "properties" | "position" | "radius" | "color" | "transform" | "layer"
  >("properties");

  const PropertiesRef = useRef<HTMLDivElement>(null);
  const PositionRef = useRef<HTMLDivElement>(null);
  const RadiusRef = useRef<HTMLDivElement>(null);
  const ColorRef = useRef<HTMLDivElement>(null);
  const TransformRef = useRef<HTMLDivElement>(null);
  const LayerRef = useRef<HTMLDivElement>(null);

  const scrollToHeading = (
    ref: React.RefObject<HTMLDivElement | null>,
    section: typeof activeSection
  ) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(section);
    }
  };

  return (
    <div className="grid grid-cols-7 gap-4 w-full h-full min-h-screen">
      <div className="col-span-4 col-start-2">
        <div className="flex flex-col gap-4 h-auto">
          <div>
            <p ref={PropertiesRef} className="text-3xl font-bold">Properties</p>
            <p className="text-lg">The Properties panel provides precise control over shape attributes and transformations. Each shape has its own set of properties that can be adjusted to customize its appearance and behavior.</p>
          </div>

          {/* Position Card */}
          <div ref={PositionRef} className="p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Position</h3>
            <p className="text-sm text-gray-600 mb-4">
              Control the position of shapes by editing their points and coordinates.
            </p>
            <div className="flex items-center gap-2">
              <img src="\public\doc\properties\position.png" alt="Position before" className="border" />
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Point Position</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Line: Edit start point (X1, Y1) and end point (X2, Y2)</li>
                <li>Circle: Edit center point (X, Y)</li>
                <li>Curve: Edit control points (P1, P2, P3, P4)</li>
                <li>Ellipse: Edit center point (X, Y)</li>
                <li>Polygon: Edit corner points (P1, P2, P3, ...) based on number of corners</li>
              </ul>
              <h4 className="font-medium mt-4 mb-2">Edit Points</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Click on point coordinates to edit</li>
                <li>Use number input for precise positioning</li>
                <li>Drag points to adjust position</li>
                <li>Press Enter to apply changes</li>
              </ol>
            </div>
          </div>

          {/* Radius Card */}
          <div ref={RadiusRef} className="p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Radius</h3>
            <p className="text-sm text-gray-600 mb-4">
              Control the size of circles by adjusting their radius.
            </p>
            <div className="flex items-center gap-2">
              <img src="\public\doc\properties\radius.png" alt="Position before" className="border" />
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Radius Controls</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Edit radius value in number input</li>
                <li>Default radius: 50 pixels</li>
                <li>Minimum radius: 1 pixel</li>
                <li>Maximum radius: 500 pixels</li>
              </ul>
              <h4 className="font-medium mt-4 mb-2">Usage</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Type value directly in radius input</li>
                <li>Use up/down arrows for fine adjustment</li>
                <li>Press Enter to apply changes</li>
                <li>Reset to default if needed</li>
              </ol>
            </div>
          </div>

          {/* Color Card */}
          <div ref={ColorRef} className="p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Color</h3>
            <p className="text-sm text-gray-600 mb-4">
              Customize the appearance of shapes by editing border and background colors.
            </p>
            <div className="flex items-center gap-2">
              <img src="\public\doc\properties\border-color.png" alt="Color before" className="border" />
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Border Color</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Click color picker to select border color</li>
                <li>Default: Black (#000000)</li>
              </ul>
              <div className="flex items-center gap-2 mt-4">
                <img src="\public\doc\properties\bg-color.png" alt="Color before" className="border" />
              </div>
              <h4 className="font-medium mt-4 mb-2">Background Color</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Click color picker to select fill color</li>
                <li>Default: Transparent</li>
              </ol>
            </div>
          </div>

          {/* Transform Card */}
          <div ref={TransformRef} className="p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Transform</h3>
            <p className="text-sm text-gray-600 mb-4">
              Modify shapes with rotation and flip operations.
            </p>
            <div className="flex items-center gap-2">
              <img src="\public\doc\properties\rotate.png" alt="Transform before" className="border" />
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Rotation</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Edit angle: -360° to 360°</li>
                <li>Set rotation point (X, Y)</li>
                <li>Default angle: 90°</li>
                <li>Click Apply to rotate</li>
              </ul>
              <div className="flex items-center gap-2 mt-4">
                <img src="\public\doc\properties\flip.png" alt="Transform before" className="border" />
              </div>
              <h4 className="font-medium mt-4 mb-2">Flip</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Horizontal Flip: Mirror left to right</li>
                <li>Vertical Flip: Mirror top to bottom</li>
              </ol>
            </div>
          </div>

          {/* Layer Card */}
          <div ref={LayerRef} className="p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Layer</h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage layers and their properties.
            </p>
            <div className="flex items-center gap-2">
              <img src="\public\doc\properties\select.png" alt="Layer before" className="border" />
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Layer Selection</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Select layer from list to edit</li>
                <li>View layer properties</li>
              </ul>
              <div className="flex items-center gap-2 mt-4">
                <img src="\public\doc\properties\visual.png" alt="Layer before" className="border" />
              </div>
              <h4 className="font-medium mt-4 mb-2">Layer Visibility</h4>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li>Toggle layer visibility</li>
                <li>Show/hide specific layers</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex flex-col sticky top-8 h-fit col-span-2 col-start-7">
        <button
          onClick={() => scrollToHeading(PropertiesRef, "properties")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "properties"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          Properties
        </button>
        <button
          onClick={() => scrollToHeading(PositionRef, "position")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "position"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Position
        </button>
        <button
          onClick={() => scrollToHeading(RadiusRef, "radius")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "radius"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Radius
        </button>
        <button
          onClick={() => scrollToHeading(ColorRef, "color")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "color"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Color
        </button>
        <button
          onClick={() => scrollToHeading(TransformRef, "transform")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "transform"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Transform
        </button>
        <button
          onClick={() => scrollToHeading(LayerRef, "layer")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "layer"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Layer
        </button>
      </div>
    </div>
  );
};

export default Properties;