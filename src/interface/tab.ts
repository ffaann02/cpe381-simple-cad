
export enum Tabs {
  File = "file",
  Shape = "shape",
  Tools = "tools",
}

export enum ShapeMode {
  Line = "line",
  Circle = "circle",
  Ellipse = "ellipse",
  Curve = "curve",
  Polygon = "polygon"
}

export interface Layer {
  id: string;
  icon?: string;
  name: string;
  type?: ShapeMode;
  is_selected: boolean;
  is_visible: boolean;
  borderColor?: string;
  backgroundColor?: string;
  thickness: number; // Thickness level from 1 to 10
}