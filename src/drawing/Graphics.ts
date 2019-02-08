import EventEmitter from "../utils/EventEmitter";
import Scene from "../core/Scene";

export default abstract class Graphics extends EventEmitter {
  public static SVGNamespace = 'http://www.w3.org/2000/svg';

  static createElement(type: string, isPrimitive = true): SVGElement {
    const element = <SVGElement>document.createElementNS(Graphics.SVGNamespace, type);
    if (isPrimitive) {
      element.classList.add('primitive');
    }
    return element;
  }

  public abstract destroy(): void;
  public abstract onDestroy(): any;
  public abstract appendTo(scene: Scene): void;
}
