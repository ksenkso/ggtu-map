import IScene from '../../interfaces/IScene';
import Vector from '../../utils/Vector';
import BaseControl from './BaseControl';

export default class ZoomControl extends BaseControl {
    public static FONTSIZE_DELTA_BIG_SCALE: number = .8;
    public static LABEL_VISIBILITY_SCALE: number = 0.75;
    public static DELTA_FACTOR: number = 2000;
    public static LABEL_LARGE_SCALE: number = 2;

    public static getMatrix(scene: SVGGElement): number[] {
        const trf = scene.style.transform;
        if (trf) {
            return trf.match(/matrix\((.*)\)/)[1].split(/,\s?/).map((v) => +v);
        } else {
            return [1, 0, 0, 1, 0, 0];
        }
    }

    public static setMatrix(scene, matrix) {
        scene.style.transform = `matrix(${matrix.join(',')})`;
    }

    public zoom: number;
    private fontSize: number;

    constructor() {
        super();
        this.zoom = 1;
    }

    public appendTo(scene: IScene): void {
        super.appendTo(scene);
        this.init();
    }

    public init() {
        this.scene.container.addEventListener('wheel', this.onWheel.bind(this));
        const style = getComputedStyle(this.scene.root);
        this.fontSize = parseFloat(style.getPropertyValue('--label-font-size'));
    }
    /**
     * Scales map container
     *
     * In order to scale an image and keep one point fixed we need to perform
     * scaling and translation as follows:
     * (x', y') - new coordinates
     * (x', y') = s * (x, y) + (u, v)
     * if (x0, y0) is fixed, then
     * (x0, y0) = s * (x0, y0) + (u, v);
     * (x0, y0) - s * (x0, y0) = (u, v);
     * (u, v) = (1 - s) * (x0, y0)
     */
    private onWheel(e) {
        // get scale as a distance that was scrolled
        const scale = 1 - e.deltaY / ZoomControl.DELTA_FACTOR;
        // Scale coords with current zoom factor
        const coords = Vector.scale(this.scene.getMouseCoords(e), this.zoom);
        this.zoom *= scale;
        // Transform mapContainer's matrix
        const matrix = ZoomControl.getMatrix(this.scene.mapContainer);
        // Scale a, b, c, d
        for (let i = 0; i < 4; i++) {
            matrix[i] *= scale;
        }
        matrix[4] += (1 - scale) * coords.x; // move x by (1 - s) * x
        matrix[5] += (1 - scale) * coords.y; // move y by (1 - s) * y
        ZoomControl.setMatrix(this.scene.mapContainer, matrix);
        // If zoom level is too low to keep labels visible, hide them
        if (this.zoom < ZoomControl.LABEL_VISIBILITY_SCALE) {
            this.scene.mapContainer.classList.add('scene__map_no-labels');
        } else {
            this.scene.mapContainer.classList.remove('scene__map_no-labels');
            let fz = this.fontSize;
            if (this.zoom > ZoomControl.LABEL_LARGE_SCALE) {
                // Increase font size on big scales
                fz += ZoomControl.FONTSIZE_DELTA_BIG_SCALE;
            }
            this.scene.root.style.setProperty('--label-font-size', fz / this.zoom + 'px');
        }
    }
}
