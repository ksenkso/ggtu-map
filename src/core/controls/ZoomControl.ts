import IScene from '../../interfaces/IScene';
import BaseControl from './BaseControl';

export default class ZoomControl extends BaseControl {
    public zoom: number;

    constructor(initial = 1) {
        super();
        this.zoom = initial;
    }

    public appendTo(scene: IScene): void {
        super.appendTo(scene);
        this.init();
    }

    public init() {
        this.scene.container.addEventListener('wheel', this.onWheel.bind(this));
    }

    public setZoom(f) {
        if (f > 0 && f < 2) {
            this.zoom = f;
            this.scene.root.style.setProperty('--scale', f);
        }
    }

    public getZoom() {
        return this.zoom;
    }

    private onWheel(e) {
        const f = this.zoom + e.deltaY / 1000;
        console.log(f);
        this.setZoom(f);
    }
}
