import { Layer, Tabs } from "@/interface/tab";
import { createContext, useContext, useState, ReactNode } from "react";

interface TabContextType {
  tab: string;
  setTab: (value: string) => void;
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [tab, setTab] = useState<string>(Tabs.Home);
  const [layers, setLayers] = useState<Layer[]>([]);

  const value = {
    tab,
    setTab,
    layers,
    setLayers,
  }

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
};
