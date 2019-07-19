import Graphics from '../drawing/Graphics';
import Primitive from '../drawing/Primitive';
import {ILabelOptions} from '../interfaces/ILabelOptions';
import IPositioned from '../interfaces/IPositioned';
import IScene from '../interfaces/IScene';
import {ICoords} from '../utils';

export default class Label extends Primitive implements IPositioned {
    protected text: SVGTextElement;
    constructor(text = '', options?: ILabelOptions) {
        super();
        this.element = Graphics.createElement('g');
        this.element.classList.add('label');
        // store a link to label in the dom element
        (this.element as any).labelInstance = this;
        this.text = Graphics.createElement('text') as SVGTextElement;
        this.text.classList.add('primitive_label');
        this.text.setAttribute('text-anchor', 'middle');
        this.text.setAttribute('dominant-baseline', 'middle');
        this.text.textContent = text;
        if (options) {
            if (options.fontSize) {
                this.text.style.fontSize = options.fontSize;
            }
        }
        this.element.appendChild(this.text);
    }

    public setText(text: string) {
        this.text.textContent = text;
    }

    public getText(): string {
        return this.text.textContent;
    }

    public getPosition(): ICoords {
        return {
            x: +this.text.getAttribute('x'),
            y: +this.text.getAttribute('y'),
        };
    }

    public setPosition(coords: ICoords): void {
        this.text.setAttribute('x', String(coords.x));
        this.text.setAttribute('y', String(coords.y));
    }

    public appendTo(scene: IScene): void {
        this.selection = scene.selection;
    }
}
