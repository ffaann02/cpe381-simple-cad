export enum ShapeMode {
    Line = "line",
    Curve = "curve",
    Circle = "circle",
    Ellipse = "ellipse",
    Polygon = "polygon",
}

export type Point = { 
    x: number; 
    y: number; 
    color?: string;
};

export type Line = { 
    start: Point; 
    end: Point; 
    borderRadius?: string;
    color?: string; 
    layerId: string; 
    lineWidth?: number;
};

export type Circle = { 
    center: Point; 
    radius: number; 
    backgroundColor?: string; 
    borderRadius?: string; 
    borderColor?: string;
    layerId: string; 
    lineWidth?: number;
};

export type Curve = { 
    p0: Point; 
    p1: Point; 
    p2: Point; 
    p3: Point; 
    borderRadius?: string; 
    color?: string;
    layerId: string; 
    lineWidth?: number;
};

export type Ellipse = { 
    center: Point; 
    rx: number; 
    ry: number; 
    borderRadius?: string; 
    backgroundColor?: string;
    borderColor?: string;
    layerId: string; 
    lineWidth?: number;
};

export type Polygon = {
    points: Point[];
    borderRadius?: string;
    borderColor?: string;
    backgroundColor?: string;
    layerId: string;
    lineWidth?: number;
  };
  