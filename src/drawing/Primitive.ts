import Selection from '../core/Selection';
import {IPrimitive} from '../interfaces/IPrimitive';
import Scene from "../core/Scene";

export default abstract class Primitive implements IPrimitive {
  static SVGNamespace = 'http://www.w3.org/2000/svg';
  private _isSelected = false;
  // private renderer: Renderer2;
  public element: SVGElement;

  set isSelected(value) {
    this._isSelected = value;
    if (value) {
      this.element.classList.add('primitive_active');
      // GLOBALS.selection.add(this);
    } else {
      // GLOBALS.selection.splice(GLOBALS.selection.indexOf(this));
      this.element.classList.remove('primitive_active');
    }
  }

  get isSelected() {
    return this._isSelected;
  }

  static createElement(type: string): SVGElement {
    const element = <SVGElement>document.createElementNS(Primitive.SVGNamespace, type);
    element.classList.add('primitive');
    return element;
  }

  static resolveContainer(container, selector) {
    return container.querySelector(selector);
  }

  constructor(
    protected selection: Selection,
    protected container: SVGElement
  ) {}

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
  }

  onDestroy(): any {}

  appendTo(scene: Scene): void {

  }
}
