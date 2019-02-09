import Scene from "../core/Scene";

export interface IPrimitive {
  element: SVGElement;
  isSelected: boolean;
  destroy(): void;
  appendTo(scene: Scene): void;
  onClick(e: MouseEvent): void;
}
