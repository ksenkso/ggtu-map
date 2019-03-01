import {ICoords, IPoint} from '..';
import IScene from '../interfaces/IScene';
import Graphics from './Graphics';
import Primitive, {IPrimitiveOptions} from './Primitive';

export type PointOptions = IPrimitiveOptions & {
  position?: ICoords,
};
export default class Point extends Primitive implements IPoint {

  private _radius: number;
  private _position: ICoords;

  constructor(
    options?: PointOptions,
  ) {
    super(options);
    this.init();
    if (options.position) {
      this.setPosition(options.position);
    }
    this.setRadius(1);
  }
  public getRadius(): number {
    return this._radius;
  }

  public setRadius(value: number) {
    this._radius = value;
    this.element.setAttribute('r', String(value));
  }

  public setPosition(coords: ICoords) {
    this._position = coords;
    this.element.setAttribute('cx', String(coords.x));
    this.element.setAttribute('cy', String(coords.y));
  }

  public getPosition(): ICoords {
    return this._position;
  }

  public init() {
    this.element = Graphics.createElement('circle');
    this.element.classList.add('primitive_point');
    this.element.addEventListener('click', this.onClick.bind(this));
  }

  public onClick(e: MouseEvent) {
    e.stopPropagation();
    super.onClick(e);
  }

  public appendTo(scene: IScene): void {
    super.appendTo(scene);
    this.setRadius(this.getRadius() / scene.getZoom());
    if (this.isDraggable) {
      scene.dragManager.enableDragging(this);
    }
  }
}
