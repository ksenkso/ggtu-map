import IScene from '../../interfaces/IScene';
import Vector from '../../utils/Vector';
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

    public setZoom(delta) {
        if (this.zoom > 0.5 && this.zoom < 2) {
            const oldScale = this.zoom;
            this.zoom *= delta;
            this.scene.root.style.setProperty('--scale', String(this.zoom));
            // Recalculate labels positions
            for (const child of this.scene.labelsContainer.children) {
                this.setLabelPosition(child as SVGTextElement, oldScale);
            }
        }
    }

    public getZoom() {
        return this.zoom;
    }

    private onWheel(e) {
        const rootBox = this.scene.root.getBoundingClientRect();
        console.log(e, rootBox);
        const px = (e.clientX - rootBox.left) / rootBox.width;
        const py = (e.clientY - rootBox.top) / rootBox.height;
        this.scene.root.style.setProperty('--origin', `${px * 100}% ${py * 100}%`);
        // const coords = this.scene.getMouseCoords(e);
        /**
         * 1. Set the scale
         * 2. Move the map
         */
        const d = 1 - (e.deltaY / 2000);
        const f = this.zoom + d;
        console.log(f);
        this.setZoom(d);
        /*const viewBox = this.scene.getViewBox();
        const delta = {
            x: (coords.x - viewBox[0]) * (d - 1),
            y: (coords.y - viewBox[1]) * (d - 1),
        };
        this.scene.setViewBox([viewBox[0] - delta.x, viewBox[1] - delta.y, viewBox[2], viewBox[3]]);*/
    }

    private setLabelPosition(child: SVGTextElement, oldScale: number) {
        const center = {
            x: +child.getAttribute('x'),
            y: +child.getAttribute('y'),
        };
        const newCenter = Vector.scale(center, this.zoom / oldScale);
        child.setAttribute('x', String(newCenter.x));
        child.setAttribute('y', String(newCenter.y));
        /*const x = +child.getAttribute('x');
        const y = +child.getAttribute('y');
        child.setAttribute('x', String(x / oldScale * this.zoom));
        child.setAttribute('y', String(y / oldScale * this.zoom));*/
    }
}
