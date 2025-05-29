import React from "react";
import ModalSwitcher from "./ModalSwitcher";
import { useTab } from "@/context/AppContext";

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
  } = useTab();
  return (
    <>
      <div className="text-center w-full py-1 text-sm bg-neutral-200 text-neutral-800">
        CAD Editor by Faan & Friends
      </div>
      <ModalSwitcher
        lines={lines}
        curves={curves}
        ellipses={ellipses}
        circles={circles}
        setLines={setLines}
        setCurves={setCurves}
        setEllipses={setEllipses}
        setCircles={setCircles}
      />
    </>
  );
};

export default Navbar;
