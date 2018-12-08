import Command from './Command';
import Line from '../drawing/Line';
import Point from '../drawing/Point';
import {create, Define} from "../core/di";

export interface ConnectPointsCommandParams {
  from: Point;
  to: Point;
  path: SVGGElement;
}

export type ConnectPointsCommandFactory = (parameters: ConnectPointsCommandParams) => ConnectPointsCommand;

@Define
export default class ConnectPointsCommand extends Command {
  public from: Point;
  public to: Point;
  public path: SVGGElement;
  private readonly container: SVGGElement;
  private line?: Line;

  constructor(
    parameters: ConnectPointsCommandParams
  ) {
    super();
    const {from, to, path} = parameters;
    this.from = from;
    this.to = to;
    this.path = path;
    this.container = this.path.querySelector('.path__lines');
  }

  do() {
    // Create a new line.
    this.line = create(Line, this.container, this.from, this.to) as Line;
    // Bind provided points with a line
    this.line.bindPoints(this.from, this.to);
    super.do();
    return this.line;
  }

  undo() {
    // Remove an element
    this.line.destroy();
    this.line.unbindPoints(this.from, this.to);
    super.undo();
  }
}
