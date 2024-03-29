import IDrawable from '../interfaces/IDrawable';
import IPathItem from '../interfaces/IPathItem';
import IScene from '../interfaces/IScene';

export default class PathRenderer implements IDrawable {
    private static subdividePath(path: IPathItem[]): IPathItem[][] {
        const groups = [[path[0]]];
        for (let i = 1; i < path.length; i++) {
            if (path[i].LocationId !== groups[groups.length - 1][0].LocationId) {
                groups.push([path[i]]);
            } else {
                groups[groups.length - 1].push(path[i]);
            }
        }
        return groups;
    }

    public path: IPathItem[][];
    private scene: IScene;
    private locationIndex = 0;
    private polyline: SVGPolylineElement =
        document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    private backButton: SVGCircleElement =
        document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGCircleElement;
    private forwardButton: SVGCircleElement =
        document.createElementNS('http://www.w3.org/2000/svg', 'circle') as SVGCircleElement;

    constructor(path?: IPathItem[]) {
        if (path) {
            this.path = PathRenderer.subdividePath(path);
        } else {
            this.path = [];
        }
        this.polyline.classList.add('waypath');
        this.backButton.classList.add('waypath__button', 'waypath__button_back');
        this.forwardButton.classList.add('waypath__button', 'waypath__button_forward');
        this.forwardButton.setAttribute('r', '1');
        this.backButton.setAttribute('r', '1');
        this.backButton.addEventListener('click', this.prev.bind(this));
        this.forwardButton.addEventListener('click', this.next.bind(this));
    }

    public appendTo(scene: IScene) {
        this.scene = scene;
        // this.scene.on('mapChanged', this.updateGraph.bind(this));
        this.scene.drawingContainer.appendChild(this.polyline);
        this.scene.drawingContainer.appendChild(this.forwardButton);
        this.scene.drawingContainer.appendChild(this.backButton);
    }

    public setPath(path: IPathItem[]) {
        this.path = PathRenderer.subdividePath(path);
        this.locationIndex = 0;
    }

    public show() {
        this.polyline.classList.add('visible');
        this.backButton.classList.add('visible');
        this.forwardButton.classList.add('visible');
    }

    public hide() {
        this.polyline.classList.remove('visible');
        this.backButton.classList.remove('visible');
        this.forwardButton.classList.remove('visible');
    }

    public async renderPath(focusOnFirst = true): Promise<void> {
        const location = this.scene.getLocation();
        const pathElement = this.path[this.locationIndex];
        if (location.id !== pathElement[0].LocationId) {
            this.hide();
            await this.scene.setLocationById(pathElement[0].LocationId);
        }
        this.show();
        this.polyline.setAttribute('points', pathElement.map((step) => {
            return `${step.position.x},${step.position.y}`;
        }).join(' '));
        this.backButton.setAttribute('cx', String(pathElement[0].position.x));
        this.backButton.setAttribute('cy', String(pathElement[0].position.y));
        this.forwardButton.setAttribute('cx', String(pathElement[pathElement.length - 1].position.x));
        this.forwardButton.setAttribute('cy', String(pathElement[pathElement.length - 1].position.y));
        if (focusOnFirst) {
            return this.scene.setCenter(pathElement[0].position);
        }
    }

    /**
     * Moves one location forward if it is possible
     */
    public next(): Promise<void> {
        if (++this.locationIndex < this.path.length) {
            return this.renderPath();
        }
    }

    /**
     * Moves one location back if it is possible
     */
    public prev(): Promise<void> {
        if (--this.locationIndex >= 0) {
            return this.renderPath();
        }
    }

    public async goTo(step: IPathItem): Promise<void> {
        this.locationIndex = this.path.findIndex((group) => group[0].LocationId === step.LocationId);
        if (this.scene.getLocation().id !== step.LocationId) {
            await this.renderPath(false);
        }
        return this.scene.setCenter(step.position);
    }
}
