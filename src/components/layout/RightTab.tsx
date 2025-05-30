import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTab } from "@/context/AppContext";
import { Layer } from "@/interface/tab";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
// import { useState } from "react";
import { Check, Trash2 } from "lucide-react"; // Import Trash2 icon
import { Popconfirm } from "antd"; // Import Popconfirm

const RightTab = () => {
  const { layers, setLayers, selectedLayerId, setSelectedLayerId } = useTab();
  // const [, setEditingIndex] = useState<number | null>(null);

  const toggleVisibility = (index: number) => {
    const newLayers = [...layers];
    newLayers[index].is_visible = !newLayers[index].is_visible;
    setLayers(newLayers);
  };

  const handleLayerClick = (layerId: string) => {
    // Toggle selection if clicking the same layer
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
      // Remove highlight from all layers
      const updatedLayers = layers.map((layer) => ({
        ...layer,
        is_selected: false
      }));
      setLayers(updatedLayers);
    } else {
      setSelectedLayerId(layerId);
      // Update layers to highlight the selected layer's shapes
      const updatedLayers = layers.map((layer) => ({
        ...layer,
        is_selected: layer.id === layerId
      }));
      setLayers(updatedLayers);
    }
  };

  const handleDeleteLayer = (layerId: string) => {
    const newLayers = layers.filter(layer => layer.id !== layerId);
    setLayers(newLayers);
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
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
                      e.stopPropagation();
                      toggleVisibility(index);
                    }}
                    className="text-xl px-2 py-1 border-r cursor-pointer hover:bg-neutral-200"
                  >
                    {layer.is_visible ? <IoMdEye /> : <IoMdEyeOff />}
                  </button>
                  <span className="w-full ml-2 flex-grow">{layer.name}</span>
                  {selectedLayerId === layer.id && (
                    <div className="flex items-center px-2 gap-x-2">
                      <Check className="h-4 w-4 text-primary" />
                      <Popconfirm
                        title="Delete Layer"
                        description="Are you sure you want to delete this layer?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          handleDeleteLayer(layer.id);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Popconfirm>
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