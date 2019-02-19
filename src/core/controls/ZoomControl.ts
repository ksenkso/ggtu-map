import IScene from '../../interfaces/IScene';
import BaseControl from './BaseControl';

export default class ZoomControl extends BaseControl {
    public zoom: number;
    private _initialViewBox: number[];
    constructor(initial = 1) {
        super();
        this.zoom = initial;
    }

    public appendTo(scene: IScene): void {
        super.appendTo(scene);
        this.init();
    }

    public init() {
        this.scene.on('mapChanged', () => {
            this._initialViewBox = this.scene.getViewBox();
        });
        this.scene.container.addEventListener('wheel', this.onWheel.bind(this));
    }

    public setZoom(f) {
        if (f > 0 && f < 2) {
            const scale = Math.sqrt(f);
            this.zoom = f;
            const viewBox = this._initialViewBox;
            const width = viewBox[2] - viewBox[0];
            const height = viewBox[3] - viewBox[1];
            const newWidth = width * scale;
            const newHeight = height * scale;
            const newX = viewBox[0] + (width - newWidth) / 2;
            const newY = viewBox[1] + (height - newHeight) / 2;
            const newViewBox = [newX, newY, newWidth, newHeight];
            this.scene.setViewBox(newViewBox);
        }
    }

    public getZoom() {
        return this.zoom;
    }

    private onWheel(e) {
        if (this._initialViewBox) {
            const f = this.zoom + e.deltaY / 1000;
            console.log(f);
            this.setZoom(f);
        }
    }
}
