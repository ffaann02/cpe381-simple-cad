import { useRef, useState } from "react";
import { PiMouseScrollFill } from "react-icons/pi";

const Shortcut = () => {
  const [activeSection, setActiveSection] = useState<
    "shortcut" | "editing" | "drawing"
  >("shortcut");

  const ShortcutRef = useRef<HTMLDivElement>(null);
  const editingShortcutRef = useRef<HTMLDivElement>(null);
  const drawingToolShortcutRef = useRef<HTMLDivElement>(null);

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
    <div className="grid grid-cols-7 gap-8 w-full min-h-screen">
      <div className="flex flex-col gap-5 px-4 col-span-4 col-start-2">
        <h2 ref={ShortcutRef} className="text-5xl font-bold text-blue-500 mb-4">
          Shortcut
        </h2>
        <p className="text-base text-neutral-700">
          Here you can document all the keyboard shortcuts and quick actions
          available in the CAD editor.
        </p>
        <div>
          <h2
            ref={editingShortcutRef}
            className="text-3xl font-bold text-neutral-800 my-2"
          >
            Editing Shortcut
          </h2>
          <div className="grid grid-cols-4 gap-4 my-6">
            <div className="col-span-2 my-4 flex items-center text-neutral-700">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl">
                Ctrl
              </div>
              <b className="text-4xl mx-4"> + </b>
              <PiMouseScrollFill className="inline text-5xl" />
            </div>
            <div className="col-span-2 col-start-3 my-4 flex items-center">
              <p>
                <b>Zoom in and Zoom out:</b> Hold <b>Shift</b> and scroll your
                mouse wheel to zoom the canvas in or out, allowing you to focus
                on details or see the whole drawing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 my-6">
            <div className="col-span-2 my-4 flex items-center text-neutral-700">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl">
                Ctrl
              </div>
              <b className="text-4xl mx-4"> + </b>
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl">
                Z
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Undo:</b> Instantly revert your last action, whether it was
                drawing, moving, or editing a shape. Essential for quickly
                correcting mistakes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 my-6">
            <div className="col-span-2 my-4 flex items-center text-neutral-700">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl">
                Ctrl
              </div>
              <b className="text-4xl mx-4"> + </b>
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl">
                Y
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Redo:</b> Restore the last action you undid, allowing you to
                move forward again after an undo.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2
            ref={drawingToolShortcutRef}
            className="text-3xl font-bold text-neutral-800 my-2"
          >
            Drawing Tools Shortcut
          </h2>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                E
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Eraser Tool:</b> Switch to the eraser tool to remove unwanted
                shapes or lines from your drawing. Click on objects to erase
                them.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                R
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Move Tool:</b> Activate the move tool to reposition selected
                shapes or objects on the canvas by dragging them to a new
                location.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                S
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Select Tool:</b> Activate the select tool to choose shapes on
                the canvas. Once selected, you can view and edit their
                properties, such as color, size, or position.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                D
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Pen Tool:</b> Switch to draw shape mode. Use this tool to
                start drawing one of the five supported shapes. (Line, Curve,
                Circle, Ellipse, Polygon)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                C
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Color Tool:</b> Open the color picker or switch to the color
                tool to change the color of selected shapes or lines.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-5 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                1
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Line Tool:</b> Quickly switch to the line tool to draw
                straight lines between two points.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                2
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Curve Tool:</b> Activate the curve tool to draw smooth Bézier
                curves by setting control points.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                3
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Circle Tool:</b> Switch to the circle tool to draw perfect
                circles by specifying a center and radius.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                4
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Ellipse Tool:</b> Use the ellipse tool to draw ellipses by
                specifying the center, horizontal radius, and vertical radius.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="flex col-span-1 my-4">
              <div className="py-2 px-4 border-2 border-neutral-600 rounded font-semibold text-4xl text-neutral-700">
                5
              </div>
            </div>
            <div className="col-span-2 my-4 flex items-center">
              <p>
                {" "}
                <b>Polygon Tool:</b> Switch to the polygon tool to draw polygons
                by clicking to set each vertex, then closing the shape.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sticky top-8 h-fit col-span-2 col-start-7">
        <button
          onClick={() => scrollToHeading(ShortcutRef, "shortcut")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "shortcut"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          Shortcut
        </button>
        <button
          onClick={() => scrollToHeading(editingShortcutRef, "editing")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "editing"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Editing Shortcut
        </button>
        <button
          onClick={() => scrollToHeading(drawingToolShortcutRef, "drawing")}
          className={`flex items-center min-h-[44px] p-2 text-lg font-semibold transition-all
              ${
                activeSection === "drawing"
                  ? "border-l-4 border-blue-400 text-blue-500 bg-blue-50"
                  : "border-l-1 border-neutral-400 text-neutral-600 bg-transparent"
              }`}
        >
          - Drawing Tool Shortcut
        </button>
      </div>
    </div>
  );
};

export default Shortcut;
