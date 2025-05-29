import { Tabs } from "antd";
import { useNavigate } from "react-router-dom";

interface TopMenuTabsProps {
  value: string;
  handleTabChange: (value: string) => void;
  setOpenCodeEditor: (open: boolean) => void;
}

const TopMenuTabs = ({
  value,
  handleTabChange,
  setOpenCodeEditor,
}: TopMenuTabsProps) => {

  const router = useNavigate();
  return (
    <div className="-mb-5">
      <Tabs
        type="card"
        size="small"
        activeKey={value}
        onChange={(key) => {
          if (key === "home") {
            setOpenCodeEditor(false);
            handleTabChange("home");
            router("/");
            return;
          }
          if (key === "docs") {
            window.open("/docs", "_blank");
            return;
          }
          handleTabChange(key);
        }}
        items={[
          {
            label: "Home",
            key: "home",
          },
          {
            label: "File",
            key: "file",
          },
          {
            label: "Shape",
            key: "shape",
          },
          {
            label: "Docs (manual)",
            key: "docs",
          }
        ]}
        className="bg-neutral-100"
      />
    </div>
  );
};

export default TopMenuTabs;
