import { useEffect } from 'react';
import { useTab } from '@/context/AppContext';
import { ShapeMode } from '@/interface/shape';
import { Tools } from '@/interface/tool';

export const useKeyboardShortcuts = () => {
  const {
    setTool,
    setShape,
    setZoomLevel,
    zoomLevel,
    handleUndo,
    handleRedo
  } = useTab();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for specific key combinations
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault();
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            setTool(Tools.Eraser);
            break;
          case 'r':
            setTool(Tools.Move);
            break;
          case 's':
            setTool(Tools.Select);
            break;
          case 'd':
            setTool(Tools.Draw);
            break;
          case 'c':
            setTool(Tools.Color)
            break;
          case '1':
            setTool(Tools.Draw);
            setShape(ShapeMode.Line);
            break;
          case '2':
            setTool(Tools.Draw);
            setShape(ShapeMode.Curve);
            break;
          case '3':
            setTool(Tools.Draw);
            setShape(ShapeMode.Circle);
            break;
          case '4':
            setTool(Tools.Draw);
            setShape(ShapeMode.Ellipse);
            break;
          case '5':
            setTool(Tools.Draw);
            setShape(ShapeMode.Polygon);
            break;
        }
      }

      // Undo/Redo shortcuts
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === 'z') {
          // Ctrl + Z: Undo
          handleUndo();
        } else if (e.key.toLowerCase() === 'y') {
          // Ctrl + Y: Redo
          handleRedo();
        }
      }
    };


    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setTool, setShape, setZoomLevel, zoomLevel, handleUndo, handleRedo]);
}; 