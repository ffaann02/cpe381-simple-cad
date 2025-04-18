import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TopMenuTabsProps {
  value: string;
  handleTabChange: (value: string) => void;
}

const TopMenuTabs = ({
  value,
  handleTabChange
}: TopMenuTabsProps) => {
  return (
    <Tabs
      defaultValue={value}
      onValueChange={(value) => {
        console.log("Selected tab:", value);
        handleTabChange(value);
      }}
    >
      <TabsList className="flex gap-x-2 bg-neutral-100">
        <TabsTrigger value="home" className="rounded-sm">Home</TabsTrigger>
        <TabsTrigger value="shape" className="rounded-sm">Shape</TabsTrigger>
        <TabsTrigger value="tools" className="rounded-sm">Tools</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TopMenuTabs;
