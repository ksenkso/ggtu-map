import Selection from '../core/Selection';
import {IPrimitive} from '../interfaces/IPrimitive';
import Scene from "../core/Scene";
import EventEmitter from "../utils/EventEmitter";

export type PrimitiveOptions = {
  selection?: Selection
};
export default class Primitive extends EventEmitter implements IPrimitive {
  static SVGNamespace = 'http://www.w3.org/2000/svg';
  private _isSelected = false;
  // private renderer: Renderer2;
  public element: SVGElement;
  protected selection?: Selection;

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

  static createElement(type: string, isPrimitive = true): SVGElement {
    const element = <SVGElement>document.createElementNS(Primitive.SVGNamespace, type);
    if (isPrimitive) {
      element.classList.add('primitive');
    }
    return element;
  }

  static resolveContainer(container, selector) {
    return container.querySelector(selector);
  }

  constructor(
    protected container: SVGElement,
    options?: PrimitiveOptions
  ) {
    super();
    if (options && options.selection) {
      this.selection = options.selection;
    }
  }

  public destroy() {
    this.element.remove();
    this.onDestroy();
  }

  public onClick(e) {
    if (e.shiftKey) {
      if (this.isSelected) {
        this.selection.remove(this);
      } else {
        this.selection.add(this);
      }
    } else {
      this.selection.set([this]);
    }
    this.emit('click', {
      originalEvent: e,
      target: this
    });
  }

  onDestroy(): any {
    this.selection = null;
  }

  /**
   * Performs necessary actions to wire a primitive and a scene.
   * Call `super.appendTo(scene)` when implementing custom primitives.
   */
  appendTo(scene: Scene): void {
    this.selection = scene.selection;
  }
}
