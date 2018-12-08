import Primitive from './Primitive';
import Selection from '../core/Selection';
import {ICoords} from '../utils/Vector';
import {IPoint} from '../interfaces/IPoint';
import {ILine} from '../interfaces/ILine';
import {Define} from "../core/di";

export type LineFactory = (container: SVGGElement, from: IPoint, to: IPoint) => Line;
@Define
export default class Line extends Primitive implements ILine {
    constructor(
      selection: Selection,
      container: SVGElement,
      public from: IPoint,
      public to: IPoint
    ) {
        super(selection, container);
        this.init();
        this.container.appendChild(this.element);
    }
    init() {
        this.element = Primitive.createElement('line');
        this.element.classList.add('primitive_line');
        this.setCoords(this.from.getPosition(), this.to.getPosition());
        this.element.addEventListener('click', this.onClick.bind(this));
    }

    bindPoints(from: IPoint, to: IPoint): void {
        from.from.push(this);
        to.to.push(this);
        from.points.add(to);
        to.points.add(from);
    }
    unbindPoints(from: IPoint, to: IPoint): void {
        from.from.splice(from.from.indexOf(this), 1);
        to.to.splice(to.to.indexOf(this), 1);
        from.points.delete(to);
        to.points.delete(from);
    }
    setCoords(from?: ICoords, to?: ICoords): void {
        if (from) {
            this.element.setAttribute('x1', String(from.x));
            this.element.setAttribute('y1', String(from.y));
        }
        if (to) {
            this.element.setAttribute('x2', String(to.x));
            this.element.setAttribute('y2', String(to.y));
        }
    }
    destroy() {
        super.destroy();
    }
    onClick(e: MouseEvent) {
        e.stopPropagation();
        super.onClick(e);
    }
}
