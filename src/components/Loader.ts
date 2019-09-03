import Graphics from '../drawing/Graphics';

export default class Loader {
    public element: SVGSVGElement;
    public visible: boolean = true;
    private displayValue: string = null;
    constructor() {
        this.element = Graphics.createElement('svg', false) as SVGSVGElement;
        this.element.innerHTML = require('../assets/rings.svg');
        this.element.classList.add('ggtu-loader');
    }

    public show() {
        this.visible = true;
        this.element.style.display = this.displayValue || 'block';
    }

    public hide() {
        this.visible = false;
        this.displayValue = this.element.style.display;
        this.element.style.display = 'none';
    }
}
