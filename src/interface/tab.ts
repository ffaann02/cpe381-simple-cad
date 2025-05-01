export enum Tabs {
  Home = "home",
  Shape = "shape",
  Tools = "tools",
}

export interface Layer{
  id: string;
  icon?: string;
  name: string;
  is_selected: boolean;
  is_visible: boolean;
}