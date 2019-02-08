import EventEmitter from "./EventEmitter";
import Scene from "../core/Scene";
export interface IDraggable {
  element: SVGElement;
  onMouseDown(e: MouseEvent): void;
  onMouseUp(e: MouseEvent): void;
}
export class DragManager extends EventEmitter {
  constructor(private _scene: Scene) {
    super();
  }
  public makeDraggable(primitive: IDraggable) {
    primitive.element.addEventListener('mousedown', primitive.onMouseDown.bind(primitive));
    primitive.element.addEventListener('mouseup', primitive.onMouseUp.bind(primitive));
  }

  private onMouseMove(e: MouseEvent) {
  }
}
