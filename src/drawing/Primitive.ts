import Selection from '../core/Selection';
import {IPrimitive} from '..';
import Scene from "../core/Scene";
import Graphics from "./Graphics";
import {IDragData} from "../utils/DragManager";

export type PrimitiveOptions = {
  draggable?: boolean
};
export default abstract class Primitive extends Graphics implements IPrimitive {
  public static defaultOptions: PrimitiveOptions = {
    draggable: false
  };

  private _isSelected = false;
  public isDraggable = false;
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

  protected constructor(
    protected container: SVGElement,
    options?: PrimitiveOptions
  ) {
    super();
    const _options: PrimitiveOptions = Object.assign({}, Primitive.defaultOptions, options);
    this.isDraggable = _options.draggable;
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
    scene.mapContainer.appendChild(this.element);
  }

}
