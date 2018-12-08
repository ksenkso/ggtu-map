import Command from './Command';
import Point from '../drawing/Point';
import {ICoords} from '../utils/Vector';
import Selection from '../core/Selection';
import ConnectPointsCommand from './ConnectPointsCommand';
import {create, Define} from "../core/di";
import SelectionCommand from "./SelectionCommand";
import {IPoint} from "../interfaces/IPoint";

export interface CreatePointCommandParams {
  path: SVGGElement;
  coords: ICoords;
  connectCurrent?: boolean;
  radius?: number;
}
@Define
export default class CreatePointCommand extends Command {
  public path: SVGGElement;
  private readonly coords: ICoords;
  private readonly connectCurrent: boolean;
  private readonly radius: number;
  private readonly container: SVGGElement;
  private prevPoint?: IPoint;
  private point?: IPoint;
  private connectedPoint: IPoint;

  constructor(
    private selection: Selection,
    parameters: CreatePointCommandParams
  ) {
    super();
    const {path, coords, connectCurrent = true, radius = 1.5} = parameters;
    this.coords = coords;
    this.connectCurrent = connectCurrent;
    this.path = path;
    this.container = <SVGGElement>this.path.querySelector('.path__points');
    this.radius = radius;
    //    TODO: Switch all commands constructors to single-object-argument form
  }

  do(): any {
    /**
     * 1. Remember previous coords.
     * 2. Set previous object to current object
     * 3. Make newly created coords current object
     */
    this.point = create(Point, this.container, this.path, this.coords) as Point;
    if (this.connectCurrent) {
      let currentObject = this.connectedPoint;
      if (!currentObject) {
        currentObject = <IPoint>this.selection.current;
      }
      if (currentObject instanceof Point) {
        this.connectedPoint = currentObject;
        const connectCommand = create(ConnectPointsCommand, {
          from: <Point>currentObject,
          to: <Point>this.point,
          path: this.path
        }) as ConnectPointsCommand;
        this.commands.push(connectCommand);
        this.prevPoint = currentObject;
      }
    }
    this.commands.push(new SelectionCommand(this.selection, [this.point]));
    super.do();
    return this.point;

  }

  undo() {
    super.undo();
    this.point.destroy();
  }
}
