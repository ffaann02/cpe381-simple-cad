import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTab } from "@/context/TabsContext";
import { Layer } from "@/interface/tab";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useState } from "react";

const RightTab = () => {
  const { layers, setLayers } = useTab();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const toggleVisibility = (index: number) => {
    const newLayers = [...layers];
    newLayers[index].is_visible = !newLayers[index].is_visible;
    setLayers(newLayers);
  };

  const updateLayerName = (index: number, newName: string) => {
    const newLayers = [...layers];
    newLayers[index].name = newName;
    setLayers(newLayers);
  };

  const handleBlur = () => {
    setEditingIndex(null);
  };

  return (
    <Accordion
      defaultValue={["properties", "layers"]}
      type="multiple"
      className="w-full"
    >
      <AccordionItem value="layers">
        <AccordionTrigger className="px-2 py-2 hover:no-underline">
          Layers
        </AccordionTrigger>
        <AccordionContent className="px-2">
          <div className="flex flex-col gap-y-2">
            {layers.map((layer: Layer, index: number) => (
              <div key={index} className="flex items-center
                border rounded-sm">
                <button
                  onClick={() => toggleVisibility(index)}
                  className="text-xl px-2 py-1 border-r cursor-pointer hover:bg-neutral-200"
                >
                  {layer.is_visible ? <IoMdEye /> : <IoMdEyeOff />}
                </button>
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => updateLayerName(index, e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur(); // triggers onBlur to close edit mode
                      }
                    }}
                    className="border rounded px-2 py-1 w-full"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setEditingIndex(index)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.cursor = "text")
                    }
                    className="w-full ml-2"
                  >
                    {layer.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RightTab;
