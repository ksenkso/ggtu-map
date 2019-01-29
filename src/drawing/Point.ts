import Vector, {ICoords} from '../utils/Vector';
import Primitive, {PrimitiveOptions} from './Primitive';
import {IPoint} from '../interfaces/IPoint';
import {ILine} from '../interfaces/ILine';
import Scene from "../core/Scene";

export type PointOptions = PrimitiveOptions & {
  radius?: number
}
export default class Point extends Primitive implements IPoint {
  private readonly radius: number;
  public points: Set<IPoint> = new Set<IPoint>();
  public from: ILine[] = [];
  public to: ILine[] = [];

  static distance(p1: ICoords, p2: ICoords): number {
    return Vector.magnitude(Vector.fromTo(p1, p2));
  }

  constructor(
    container: SVGGElement,
    public path: SVGGElement,
    public center: ICoords = {x: 0, y: 0},
    options: PointOptions
  ) {
    super(container);
    this.radius = options.radius ? options.radius : 2;
    this.center = center;
    this.path = path;
    this.points = new Set();
    this.from = [];
    this.to = [];
    this.init();
    this.container.appendChild(this.element);
  }

  init() {
    this.element = Primitive.createElement('circle');
    this.element.classList.add('primitive_point');
    this.element.setAttribute('r', String(this.radius));
    this.setPosition(this.center);
    this.element.addEventListener('mousedown', this.onPointMouseDown.bind(this));
    this.element.addEventListener('click', this.onClick.bind(this));
    // super.init();
    // Register global event listeners
    // Listen to keyboard event
  }

  onClick(e: MouseEvent) {
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
          /!*const connectCommandFactory = <ConnectPointsCommandFactory><unknown>this.injector.get(ConnectPointsCommand);
          const command = connectCommandFactory({from: previousObject, to: this, path: this.path});
          this.commandManager.do(command);*!/
        }
      }
    }*/
    super.onClick(e);
  }

  moveToPath(sourceObject: IPoint): void {
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
  }

  onPointMouseDown(e) {
    /*DragAndDrop.IS_DRAGGING = true;
    DragAndDrop.draggable = this;
    const position = this.getPosition();
    this.commandManager.bufferCommand = MoveCommand;
    DragAndDrop.delta = Vector.sub(position, Scene.getMouseCoords(e));
    this.commandManager.bufferArgs = [this, position];*/
  }

  setPosition(newPosition: ICoords) {
    this.element.setAttribute('cx', String(newPosition.x));
    this.element.setAttribute('cy', String(newPosition.y));
  }

  getPosition(): ICoords {
    return {x: +this.element.getAttribute('cx'), y: +this.element.getAttribute('cy')};
  }

  destroy() {
    super.destroy();
    this.from.forEach((line: ILine) => line.destroy());
    this.to.forEach((line: ILine) => line.destroy());
  }

  appendTo(scene: Scene) {
    scene.pointsContainer.appendChild(this.element);
    const linesContainer = scene.linesContainer;
    this.from.concat(this.to).forEach(line => {
      linesContainer.appendChild(line.element)
    });
  }
}
