import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTab } from "@/context/AppContext";
import { Layer } from "@/interface/tab";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useState } from "react";
import Divider from "../ui/divider";
import PropertiesTab from "./PropertiesTab";
import { Check } from "lucide-react"; // Import a check icon

const RightTab = () => {
  const { layers, setLayers, selectedLayerId, setSelectedLayerId } = useTab();
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

  const handleLayerClick = (layerId: string) => {
    setSelectedLayerId(layerId);
  };

  return (
    <Accordion
      defaultValue={["layers"]}
      type="multiple"
      className="w-full border rounded-md"
    >
      <AccordionItem value="layers">
        <AccordionTrigger className="px-4 py-2 hover:no-underline">
          Layers
        </AccordionTrigger>
        <AccordionContent className="px-4 max-h-[150px] overflow-y-auto">
          {layers.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No layers created
            </div>
          ) : (
            <div className="flex flex-col gap-y-2">
              {layers.map((layer: Layer, index: number) => (
                <div
                  key={layer.id}
                  className={`flex items-center border rounded-sm ${
                    selectedLayerId === layer.id ? "bg-neutral-100" : ""
                  } cursor-pointer`}
                  onClick={() => handleLayerClick(layer.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent layer selection when toggling visibility
                      toggleVisibility(index);
                    }}
                    className="text-xl px-2 py-1 border-r cursor-pointer hover:bg-neutral-200"
                  >
                    {layer.is_visible ? <IoMdEye /> : <IoMdEyeOff />}
                  </button>
                  <span className="w-full ml-2 flex-grow">{layer.name}</span>
                  {selectedLayerId === layer.id && (
                    <div className="px-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RightTab;