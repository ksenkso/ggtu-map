import Graphics from '../drawing/Graphics';
import Primitive from '../drawing/Primitive';
import {ILabelOptions} from '../interfaces/ILabelOptions';
import IPositioned from '../interfaces/IPositioned';
import IScene from '../interfaces/IScene';
import {ICoords} from '../utils';

export default class Label extends Primitive implements IPositioned {
    constructor(text = '', options?: ILabelOptions) {
        super();
        this.element = Graphics.createElement('text');
        this.element.classList.add('primitive_label');
        this.element.setAttribute('text-anchor', 'middle');
        this.element.setAttribute('dominant-baseline', 'middle');
        this.element.textContent = text;
        if (options) {
            if (options.fontSize) {
                this.element.style.fontSize = options.fontSize;
            }
        }
    }

    public setText(text: string) {
        this.element.textContent = text;
    }

    public getText(): string {
        return this.element.textContent;
    }

    public getPosition(): ICoords {
        return {
            x: +this.element.getAttribute('x'),
            y: +this.element.getAttribute('y'),
        };
    }

    public setPosition(coords: ICoords): void {
        this.element.setAttribute('x', String(coords.x));
        this.element.setAttribute('y', String(coords.y));
    }

    public appendTo(scene: IScene): void {
        this.selection = scene.selection;
    }
}
