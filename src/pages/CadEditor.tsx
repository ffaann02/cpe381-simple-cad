import TopMenuTabs from "@/components/pages/editor/Tabs";
import HomeTab from "@/components/pages/editor/tabs/HomeTab";
import ShapeTab from "@/components/pages/editor/tabs/ShapeTab";
import ToolsTab from "@/components/pages/editor/tabs/ToolsTab";
import { useTab } from "@/context/TabsContext";

const CadEditor = () => {
  const { tab, setTab } = useTab();

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const renderTabContent = () => {
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
      <div className="bg-neutral-50 px-4 py-2">{renderTabContent()}</div>
    </div>
  );
};

export default CadEditor;
