import {IPrimitive} from '..';
import Scene from '../core/Scene';
import Selection from '../core/Selection';
import {DragData} from '../utils/DragData';
import {IDragData} from '../utils/DragManager';
import Graphics from './Graphics';

export interface IPrimitiveOptions {
  draggable?: boolean;
}
export default abstract class Primitive extends Graphics implements IPrimitive {

  set selected(value) {
    this.isSelected = value;
    if (value) {
      this.element.classList.add('primitive_active');
    } else {
      this.element.classList.remove('primitive_active');
    }
  }

  get selected() {
    return this.isSelected;
  }
  public static defaultOptions: IPrimitiveOptions = {
    draggable: false,
  };
  public isDraggable = false;
  public dragData: IDragData = new DragData();
  public element: SVGElement;
  protected selection?: Selection;

  private isSelected = false;

  protected constructor(
    options?: IPrimitiveOptions,
  ) {
    super();
    const mergedOptions: IPrimitiveOptions = Object.assign({}, Primitive.defaultOptions, options);
    this.isDraggable = mergedOptions.draggable;
  }

  public destroy() {
    this.element.remove();
    this.selection = null;
  }

  public onClick(e) {
    if (e.shiftKey) {
      if (this.selected) {
        this.selection.remove(this);
      } else {
        this.selection.add(this);
      }
    } else {
      this.selection.set([this]);
    }
    this.emit('click', {
      originalEvent: e,
      target: this,
    });
  }

  public appendTo(scene: Scene): void {
    scene.drawingContainer.appendChild(this.element);
    this.selection = scene.selection;
  }

}
