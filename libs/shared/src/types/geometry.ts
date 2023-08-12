export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Circle = Point & { r: number };
export type Rectangle = Point & Size;
export type Line = { start: Point; end: Point };
