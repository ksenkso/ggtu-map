import Scene from '../core/Scene';
import EventEmitter from '../utils/EventEmitter';

export default abstract class Graphics extends EventEmitter {
  public static SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  public static createElement(type: string, isPrimitive = true): SVGElement {
    const element = document.createElementNS(Graphics.SVG_NAMESPACE, type) as SVGElement;
    if (isPrimitive) {
      element.classList.add('primitive');
    }
    return element;
  }

  public abstract destroy(): void;
  public abstract appendTo(scene: Scene): void;
}
