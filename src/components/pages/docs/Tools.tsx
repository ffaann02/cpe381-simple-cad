const Tools = () => {

  return (
    <div className="grid grid-cols-7 gap-4 p-4 w-full h-full min-h-screen">
      <div className="col-span-4 col-start-2">
        <div className="flex flex-col gap-4 h-auto">
          <div >
            <p className="text-3xl font-bold">Tools</p>
            <p className="text-lg">Tools are used to perform specific actions on shapes. Each tool has its own set of properties that can be adjusted to customize its behavior.</p>
          </div>

          <div className="p-4 rounded-lg shadow-md ">
            <h3 className="text-xl font-semibold">Draw Tool</h3>
            <p className="text-sm text-gray-600 mb-4">
              The Draw Tool allows you to create shapes by clicking and dragging on the canvas. You can adjust the shapes such as Line, Curve, Circle, Ellipse, and Polygon.
            </p>
            <div className="grid grid-rows-5 gap-4 ">
              {/* Line */}
              <div className=" items-center gap-4">
                <div>
                  <p className="font-semibold">Line</p>
                  <p className="text-sm text-gray-600">
                    Draw a straight line between two points.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="\public\doc\tool\Line_1.png" alt="Line before" className="w-60 h-60 border" />
                  <img src="\public\doc\tool\Line_2.png" alt="Line after" className="w-60 h-60 border" />
                </div>
                <div>
                  <ol className="list-decimal list-inside text-sm text-gray-700 mt-2">
                    <li>Click on the canvas to set the starting point of the line.</li>
                    <li>Move your mouse to the desired end point.</li>
                    <li>Click again to finish drawing the line.</li>
                  </ol>
                </div>
              </div>
              {/* Curve */}
              <div className="items-center gap-4">
                <div>
                  <p className="font-semibold">Curve</p>
                  <p className="text-sm text-gray-600">Draw a curved line by adjusting control points.</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="\public\doc\tool\Curve_1.png" alt="Curve before" className="w-60 h-60 border" />
                  <img src="\public\doc\tool\Curve_2.png" alt="Curve after" className="w-60 h-60 border" />
                </div>
                <div>
                  <ol className="list-decimal list-inside text-sm text-gray-700 mt-2">
                    <li>Click on the canvas to set the starting point of the curve (P<sub>0</sub>).</li>
                    <li>Drag the control points (P<sub>1</sub> and P<sub>2</sub>) to adjust the curvature as desired.</li>
                    <li>Click again to set the ending point of the curve (P<sub>3</sub>).</li>
                    <li>The curve will be drawn following the these four points.</li>
                  </ol>
                </div>
              </div>
              {/* Circle */}
              <div className="items-center gap-4">
                <div>
                  <p className="font-semibold">Circle</p>
                  <p className="text-sm text-gray-600">Draw a perfect circle by dragging from the center.</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="\public\doc\tool\Circle_1.png" alt="Circle before" className="w-60 h-60 border" />
                  <img src="\public\doc\tool\Circle_2.png" alt="Circle after" className="w-60 h-60 border" />
                </div>
                <div>
                  <ol className="list-decimal list-inside text-sm text-gray-700 mt-2">
                    <li>Click on the canvas to set the center point of the circle.</li>
                    <li>Drag outward to define the radius and size of the circle.</li>
                    <li>Release the mouse button to finish drawing the circle.</li>
                  </ol>
                </div>
              </div>
              {/* Ellipse */}
              <div className="items-center gap-4">
                <div>
                  <p className="font-semibold">Ellipse</p>
                  <p className="text-sm text-gray-600">Draw an ellipse by dragging to set width and height.</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="\public\doc\tool\Ellipse_1.png" alt="Ellipse before" className="w-60 h-60 border" />
                  <img src="\public\doc\tool\Ellipse_2.png" alt="Ellipse after" className="w-60 h-60 border" />
                </div>
                <div>
                  <ol className="list-decimal list-inside text-sm text-gray-700 mt-2">
                    <li>Click on the canvas to set the center point of the ellipse.</li>
                    <li>Drag outward to define the width (horizontal radius) and height (vertical radius) of the ellipse.</li>
                    <li>Release the mouse button to finish drawing the ellipse.</li>
                  </ol>
                </div>
              </div>
              {/* Polygon */}
              <div className="items-center gap-4">
                <div>
                  <p className="font-semibold">Polygon</p>
                  <p className="text-sm text-gray-600">Draw a polygon by specifying the number of sides.</p>
                </div>
                <div className="flex items-center gap-2">
                  <img src="\public\doc\tool\Polygon_1.png" alt="Polygon before" className="w-80 h-60 border" />
                  <img src="\public\doc\tool\Polygon_2.png" alt="Polygon after" className="w-60 h-60 border" />
                </div>
                <div>
                  <ol className="list-decimal list-inside text-sm text-gray-700 mt-2">
                    <li>Click on the canvas to set the center point of the polygon.</li>
                    <li>A slide bar will appear. Choose the number of sides (3-16) for your polygon.</li>
                    <li>Drag outward to set the size (radius) of the polygon.</li>
                    <li>Release the mouse button to finish drawing the polygon.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Select Tool</h3>
            <p className="text-sm text-gray-600">The Select Tool allows you to select and manipulate shapes on the canvas. You can move, resize, and rotate shapes using this tool.</p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Move Tool</h3>
            <p className="text-sm text-gray-600">The Move Tool allows you to move shapes around the canvas. You can click and drag shapes to reposition them.</p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Eraser Tool</h3>
            <p className="text-sm text-gray-600">The Eraser Tool allows you to remove shapes from the canvas. You can click on shapes to erase them.</p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">Undo/Redo Tool</h3>
            <p className="text-sm text-gray-600">The Undo/Redo Tool allows you to revert or reapply changes made to the canvas. You can use this tool to correct mistakes or restore previous states.</p>
          </div>


        </div>
      </div>
      <div className="col-span-1 col-start-7">
        2
      </div>
    </div>
  );
};

export default Tools;