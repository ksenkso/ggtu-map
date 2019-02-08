import Selection from '../core/Selection';
import {IPrimitive} from '..';
import Scene from "../core/Scene";
import Graphics from "./Graphics";
import {ICoords} from "..";
export interface IDragData {
  delta: number;
  position: ICoords;
}
export type PrimitiveOptions = {
  draggable?: boolean
};
export default class Primitive extends Graphics implements IPrimitive {
  public static defaultOptions: PrimitiveOptions = {
    draggable: false
  };

  private _isSelected = false;
  private _draggable = false;
  public dragData: IDragData;
  public element: SVGElement;
  protected _selection?: Selection;

  set isSelected(value) {
    this._isSelected = value;
    if (value) {
      this.element.classList.add('primitive_active');
    } else {
      this.element.classList.remove('primitive_active');
    }
  }

  get isSelected() {
    return this._isSelected;
  }

  constructor(
    protected container: SVGElement,
    options?: PrimitiveOptions
  ) {
    super();
    const _options: PrimitiveOptions = Object.assign({}, Primitive.defaultOptions, options);
    this._draggable = _options.draggable;
  }

  public destroy() {
    this.element.remove();
    this._selection = null;
  }

  public onClick(e) {
    if (e.shiftKey) {
      if (this.isSelected) {
        this._selection.remove(this);
      } else {
        this._selection.add(this);
      }
    } else {
      this._selection.set([this]);
    }
    this.emit('click', {
      originalEvent: e,
      target: this
    });
  }

  public appendTo(scene: Scene): void {
    scene.pointsContainer.appendChild(this.element);
  }

  public onDestroy(): any {

  }

  protected makeDraggable() {


  }

  onPointMouseDown(e) {
    /*DragAndDrop.IS_DRAGGING = true;
    DragAndDrop.draggable = this;
    const position = this.getPosition();
    this.commandManager.bufferCommand = MoveCommand;
    DragAndDrop.delta = Vector.sub(position, Scene.getMouseCoords(e));
    this.commandManager.bufferArgs = [this, position];*/
  }
}
