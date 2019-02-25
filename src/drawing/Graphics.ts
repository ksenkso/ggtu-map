import IScene from '../interfaces/IScene';
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
  protected _cachedDisplay: string;

  public abstract hide(): void;
  public abstract show(): void;
  public abstract destroy(): void;
  public appendTo(scene: IScene): void {
    scene.addGraphics(this);
  }
}
