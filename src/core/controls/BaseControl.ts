import Graphics from '../../drawing/Graphics';
import IScene from '../../interfaces/IScene';
import Scene from '../Scene';

export default class BaseControl extends Graphics {
    public element: SVGElement;
    public scene: Scene;
    constructor() {
        super();
        this.element = Graphics.createElement('g', false);
        this.element.classList.add('map__control');
    }

    public appendTo(scene: Scene): void {
        scene.controlsContainer.appendChild(this.element);
        this.scene = scene;
    }

    public destroy(): void {
        this.element.remove();
    }

}
