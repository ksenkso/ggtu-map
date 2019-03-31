import Graphics from '../drawing/Graphics';
import {ICoords} from '../utils';
import Label from './Label';

export default class IconLabel extends Label {
    public element: SVGGElement;
    protected icon: SVGImageElement;
    protected text: SVGTextElement;
    constructor(imageURL: string, title?: string) {
        super(title);
        this.text = this.element.cloneNode() as SVGTextElement;
        this.element = Graphics.createElement('g') as SVGGElement;
        this.element.classList.add('label', 'label_icon');
        this.icon = Graphics.createElement('image', false) as SVGImageElement;
        this.icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageURL);
        this.element.appendChild(this.icon);
        this.element.appendChild(this.text);
    }

    public setText(text: string) {
        this.text.textContent = text;
    }

    public getText(): string {
        return this.text.textContent;
    }

    public setPosition(coords: ICoords): void {
        this.element.setAttribute('transform', `translate(${coords.x} ${coords.y})`);
    }
}
