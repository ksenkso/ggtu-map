import Command from './Command';
import {ICoords} from '../utils/Vector';
import Point from '../drawing/Point';
import {Define} from "../core/di";

@Define
export default class MoveCommand extends Command {
  private point: Point;
  public from: ICoords;
  public to: ICoords;
  constructor(point, from, to) {
        super();
        this.point = point;
        this.from = from;
        this.to = to;
    }
    do() {
        this.point.setPosition(this.to);
        if (this.point.from.length) {
            this.point.from.forEach(line => line.setCoords(this.to));
        }
        if (this.point.to.length) {
            this.point.to.forEach(line => line.setCoords(null, this.to));
        }
        super.do();
    }
    undo() {
        this.point.setPosition(this.from);
        if (this.point.from.length) {
            this.point.from.forEach(line => line.setCoords(this.from));
        }
        if (this.point.to.length) {
            this.point.to.forEach(line => line.setCoords(null, this.from));
        }
        super.undo();
    }
}
