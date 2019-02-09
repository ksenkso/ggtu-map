import EventEmitter from "./EventEmitter";
import Vector, {ICoords} from "./Vector";
import IScene from "../interfaces/IScene";

export interface IDragData {
  delta: ICoords;
  position: ICoords;
  startPosition: ICoords;
  reset(): void;
}

export interface IDraggable {
  element: SVGElement;
  dragData: IDragData;
  onDragStart?: (e: MouseEvent) => void;
  onDragMove?: (e: MouseEvent) => void;
  onDragEnd?: (e: MouseEvent) => void;
  setPosition(coords: ICoords);
  getPosition(): ICoords;
}

export interface IDraggableConfig {
  onMove?(e: MouseEvent): void;
  onStart?(e: MouseEvent): void;
  onEnd?(e: MouseEvent): void;
}

export class DragData implements IDragData {
  public delta: ICoords;
  public position: ICoords;
  public startPosition: ICoords;

  public reset(): void {
    this.delta = null;
    this.position = null;
    this.startPosition = null;
  }
}

export interface IDraggableEntry {
  draggable: IDraggable;
  onDragStart: EventListener;
  onDragEnd: EventListener;
}

export default class DragManager extends EventEmitter {
  public isDragging = false;
  public draggable: IDraggable;
  private draggables: IDraggableEntry[];
  constructor(private _scene: IScene) {
    super();
    this._scene.mapContainer.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  public enableDragging(primitive: IDraggable, options?: IDraggableConfig) {
    const entry: IDraggableEntry = {
      draggable: primitive,
      onDragEnd: this.stopDragging.bind(this, primitive, options) as EventListener,
      onDragStart: this.startDragging.bind(this, primitive, options)
    };
    this.draggables.push(entry);
    primitive.element.addEventListener('mousedown', entry.onDragStart);
    primitive.element.addEventListener('mouseup', this.stopDragging.bind(this, primitive, options));
  }

  public disableDragging(primitive: IDraggable) {
    const entry = this.draggables.find(d => d.draggable === primitive);
    primitive.element.removeEventListener('mousedown', entry.onDragStart);
    primitive.element.removeEventListener('mouseup', entry.onDragEnd);
  }

  startDragging(primitive: IDraggable, options: IDraggableConfig, e: MouseEvent) {
    this.isDragging = true;
    this.draggable = primitive;
    this.draggable.dragData.startPosition = this.draggable.getPosition();
    this.draggable.dragData.delta = Vector.sub(this.draggable.dragData.startPosition, this._scene.getMouseCoords(e));
    if (this.draggable.onDragStart) {
      this.draggable.onDragStart(e);
    }
  }

  stopDragging(primitive: IDraggable, options: IDraggableConfig, e: MouseEvent) {
    if (this.draggable.onDragEnd) {
      this.draggable.onDragEnd(e)
    }
    this.isDragging = false;
    this.draggable.dragData.reset();
    this.draggable = null;

  }

  private onMouseMove(e: MouseEvent) {
    if (this.isDragging && this.draggable) {
      const coords = this._scene.getMouseCoords(e);
      this.draggable.setPosition(coords);
      if (this.draggable.onDragMove) {
        this.draggable.onDragMove(e);
      }
    }
  }
}
