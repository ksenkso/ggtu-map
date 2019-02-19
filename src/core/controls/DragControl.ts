import IScene from '../../interfaces/IScene';
import Vector, {ICoords} from '../../utils/Vector';
import BaseControl from './BaseControl';

export default class DragControl extends BaseControl {
    public isDragging = false;
    public position = {x: 0, y: 0};
    private prevCoords = null;
    constructor() {
        super();
    }

    public onDragStart(e) {
        console.log('dragstart');
        this.isDragging = true;
        this.prevCoords = this.scene.getMouseCoords(e);
        this.position = this.getPosition();
    }

    public onDragMove(e) {
        if (this.isDragging  && (e.movementX || e.movementY)) {
            const coords = this.scene.getMouseCoords(e);
            const delta = Vector.sub(coords, this.prevCoords);
            this.setPosition(Vector.sub(this.position, delta));
        }
    }

    public onDragEnd() {
        console.log('dragend');
        this.isDragging = false;
    }

    public getPosition() {
        const viewBox = this.scene.getViewBox();
        if (viewBox) {
            return {x: viewBox[0], y: viewBox[1]};
        } else {
            return null;
        }
    }

    public setPosition(coords: ICoords) {
        const viewBox = this.scene.getViewBox();
        viewBox[0] = coords.x;
        viewBox[1] = coords.y;
        this.scene.setViewBox(viewBox);
        this.position = coords;
    }

    public appendTo(scene: IScene): void {
        super.appendTo(scene);
        this.init();
    }

    private init() {
        // this.position = this.getPosition();
        this.scene.container.addEventListener('mousemove', this.onDragMove.bind(this));
        this.scene.container.addEventListener('mousedown', this.onDragStart.bind(this));
        this.scene.container.addEventListener('mouseup', this.onDragEnd.bind(this));
    }
}
