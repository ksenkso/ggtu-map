import {ICoords} from '..';
import {IPoint} from '..';
import {ILine} from '..';
import Graphics from './Graphics';
import Primitive, {IPrimitiveOptions} from './Primitive';

export default class Line extends Primitive implements ILine {
    constructor(
      public from: IPoint,
      public to: IPoint,
      options?: IPrimitiveOptions,
    ) {
        super(options);
        this.init();
    }
    public init() {
        this.element = Graphics.createElement('line');
        this.element.classList.add('primitive_line');
        this.setCoords(this.from.getPosition(), this.to.getPosition());
        this.element.addEventListener('click', this.onClick.bind(this));
    }

    /*bindPoints(from: IPoint, to: IPoint): void {
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
    }*/
    public setCoords(from?: ICoords, to?: ICoords): void {
        if (from) {
            this.element.setAttribute('x1', String(from.x));
            this.element.setAttribute('y1', String(from.y));
        }
        if (to) {
            this.element.setAttribute('x2', String(to.x));
            this.element.setAttribute('y2', String(to.y));
        }
    }
    public destroy() {
        super.destroy();
    }
    public onClick(e: MouseEvent) {
        e.stopPropagation();
        super.onClick(e);
    }
}
