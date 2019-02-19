import {ICoords} from '..';
import IScene from '../interfaces/IScene';
import {IDraggable} from '../utils/DragManager';
import Graphics from './Graphics';
import Primitive, {IPrimitiveOptions} from './Primitive';

export type PointOptions = IPrimitiveOptions & {
  radius?: number,
  center?: ICoords,
};
export default class Point extends Primitive implements IDraggable {

  /*public points: Set<IPoint> = new Set<IPoint>();
  public from: ILine[] = [];
  public to: ILine[] = [];*/
  private _radius: number;
  private _position: ICoords;

  constructor(
    options?: PointOptions,
  ) {
    super(options);
    this.init();
    if (options.center) {
      this.setPosition(options.center);
    }
    this.setRadius(options.radius ? options.radius : 5);
    /*this.points = new Set();
    this.from = [];
    this.to = [];*/
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
    /*const previousObject = this.selection.current;
    if (previousObject && previousObject instanceof Point) {
      if (e.ctrlKey) {
        if (this.path !== previousObject.path) {
          this.moveToPath(previousObject);
        }
        if (!previousObject.points.has(this)) {
          //FIXME: switch to `create`
          const connectCommand = create(ConnectPointsCommand, {
            from: previousObject,
            to: this,
            path: this.path
          }) as ConnectPointsCommand;
          this.commandManager.do(connectCommand);
          const connectCommandFactory = <ConnectPointsCommandFactory><unknown>this.injector.get(ConnectPointsCommand);
          const command = connectCommandFactory({from: previousObject, to: this, path: this.path});
          this.commandManager.do(command);
        }
      }
    }*/
    super.onClick(e);
  }

  /*moveToPath(sourceObject: IPoint): void {
    // `this.path` is the destination path, `sourceObject.path` is the source path
    sourceObject.points.forEach(point => point.path = this.path);
    const destinationPoints = <SVGGElement>this.path.querySelector('.path__points');
    Array.from(sourceObject.path.querySelector('.path__points').children).forEach((point: SVGCircleElement) => {
      destinationPoints.appendChild(point);
    });
    const destinationLines = <SVGGElement>this.path.querySelector('.path__lines');
    Array.from(sourceObject.path.querySelector('.path__lines').children).forEach((point: SVGCircleElement) => {
      destinationLines.appendChild(point);
    });
  }*/

  /*onPointMouseDown(e) {
    DragAndDrop.IS_DRAGGING = true;
    DragAndDrop.draggable = this;
    const position = this.getPosition();
    this.commandManager.bufferCommand = MoveCommand;
    DragAndDrop.delta = Vector.sub(position, Scene.getMouseCoords(e));
    this.commandManager.bufferArgs = [this, position];
  }*/

  public appendTo(scene: IScene): void {
    // scene.pointsContainer.appendChild(this.element);
    super.appendTo(scene);
    if (this.isDraggable) {
      scene.dragManager.enableDragging(this);
    }
    /*const linesContainer = scene.linesContainer;
    this.from.concat(this.to).forEach(line => {
      linesContainer.appendChild(line.element)
    });*/
  }
}
