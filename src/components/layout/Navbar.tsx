import React from "react";
import ModalSwitcher from "./ModalSwitcher";
import { useTab } from "@/context/AppContext";
import { Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const {
    lines,
    setLines,
    curves,
    setCurves,
    ellipses,
    setEllipses,
    circles,
    setCircles,
    polygons,
    setPolygons,
  } = useTab();
  const history = useNavigate();
  return (
    <>
      <div className="fixed z-[9999] text-center w-full py-1 text-sm bg-neutral-200 text-neutral-800 border-b border-b-neutral-300 drop-shadow-sm">
        <img src="/logo_typo_2.svg" className="w-32 mx-auto mt-1 cursor-pointer" 
          onClick={()=>{
            history("/");
          }}
        />
      </div>
      <ModalSwitcher
        lines={lines}
        curves={curves}
        ellipses={ellipses}
        circles={circles}
        polygons={polygons}
        setPolygons={setPolygons}
        setLines={setLines}
        setCurves={setCurves}
        setEllipses={setEllipses}
        setCircles={setCircles}
      />
    </>
  );
};

export default Navbar;
