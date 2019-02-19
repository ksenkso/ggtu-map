import Graphics from '../../drawing/Graphics';
import IScene from '../../interfaces/IScene';

export default class BaseControl extends Graphics {
    public element: SVGElement;
    public scene: IScene;
    constructor() {
        super();
        this.element = Graphics.createElement('g', false);
        this.element.classList.add('map__control');
    }

    public appendTo(scene: IScene): void {
        scene.controlsContainer.appendChild(this.element);
        this.scene = scene;
    }

    public destroy(): void {
        this.element.remove();
    }

}
