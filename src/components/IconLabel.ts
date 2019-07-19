import Graphics from '../drawing/Graphics';
import {ICoords} from '../utils';
import Label from './Label';

export default class IconLabel extends Label {
    public element: SVGGElement;
    protected icon: SVGImageElement;
    constructor(imageURL: string, title?: string) {
        super(title);
        this.element.classList.add('label_icon');
        this.icon = Graphics.createElement('image', false) as SVGImageElement;
        this.icon.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageURL);
        this.element.appendChild(this.icon);
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
