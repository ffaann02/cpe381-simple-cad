import FileTab from "@/components/pages/editor/FileTab";
import LineCanvas from "@/components/pages/editor/shape-canvas/LineCanvas";
import CurveCanvas from "@/components/pages/editor/shape-canvas/CurveCanvas";
import TopMenuTabs from "@/components/pages/editor/Tabs";
import HomeTab from "@/components/pages/editor/tabs/HomeTab";
import ShapeTab from "@/components/pages/editor/tabs/ShapeTab";
import ToolsTab from "@/components/pages/editor/tabs/ToolsTab";
import { useTab } from "@/context/TabsContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const CadEditor = () => {
  const { tab, setTab } = useTab();

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const renderTab = () => {
    switch (tab) {
      case "home":
        return <HomeTab />;
      case "shape":
        return <ShapeTab />;
      case "tools":
        return <ToolsTab />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="w-full bg-neutral-100 px-2 py-1 border-b">
        <TopMenuTabs value={tab} handleTabChange={handleTabChange} />
      </div>
      <div className="bg-neutral-50 py-2 border-b">{renderTab()}</div>
      <div className="w-full my-1">
        <div className="w-full bg-neutral-200 p-1">
          <FileTab />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-x-2 px-2 pb-2 h-[calc(100vh-12rem)]">
        <div className="bg-white w-full h-full col-span-10" id="canvas">
           <CurveCanvas/>
          {/* <LineCanvas /> */}
        </div>
        <div className="col-span-2 h-full rounded-sm border border-neutral-200">
          <Accordion defaultValue={["properties", "layers"]} type="multiple" className="w-full">
            <AccordionItem value="properties">
              <AccordionTrigger className="px-2 py-2 hover:no-underline cursor-pointer">Properties</AccordionTrigger>
              <AccordionContent className="px-2">
                <div>
                  
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="layers">
            <AccordionTrigger className="px-2 py-2 hover:no-underline cursor-pointer">Layers</AccordionTrigger>
            <AccordionContent className="px-2">
            Yes. It comes with default styles that matches the other
                components&apos; aesthetic.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CadEditor;
