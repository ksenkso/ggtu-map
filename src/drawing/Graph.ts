import Selection from '../core/Selection';
import IGraph from '../interfaces/IGraph';
import IGraphPoint from '../interfaces/IGraphPoint';
import IGraphPointOptions from '../interfaces/IGraphPointOptions';
import IScene from '../interfaces/IScene';
import ISerializable from '../interfaces/ISerializable';
import {IAdjacencyNode} from '../utils';
import DragManager from '../utils/DragManager';
import GraphEdge from './GraphEdge';
import Graphics from './Graphics';
import GraphPoint from './GraphPoint';
import {IGraphEdge} from './IGraphEdge';

export default class Graph extends Graphics implements IGraph, ISerializable {
    public vertices: IGraphPoint[] = [];
    public edges: IGraphEdge[] = [];
    public readonly container: SVGGElement;
    public selection: Selection;
    public scene: IScene;
    private dragManager: DragManager;

    constructor() {
        super();
        this.container = Graphics.createElement('g', false) as SVGGElement;
    }
    public createEdge(p1: IGraphPoint, p2: IGraphPoint): IGraphEdge {
        return new GraphEdge(p1, p2);
    }

    public createPoint(options?: IGraphPointOptions): IGraphPoint {
        return new GraphPoint(options);
    }

    public breakPoints(p1: GraphPoint, p2: GraphPoint) {
        const index = p1.siblings.indexOf(p2);
        if (index !== -1) {
            p1.siblings.splice(index, 1);
            p2.siblings.splice(p2.siblings.indexOf(p1), 1);
            const edge = p1.edges.find((e) => (e.end === p1 && e.start === p2) || (e.end === p2 && e.start === p1));
            this.edges.splice(this.edges.indexOf(edge), 1);
            edge.destroy();
        }
    }

    public connectPoints(p1: GraphPoint, p2: GraphPoint) {
        const edge = new GraphEdge(p1, p2);
        edge.setGraph(this);
    }

    public insertBetween(p1: GraphPoint, p2: GraphPoint): GraphPoint {
        const pos1 = p1.getPosition(),
            pos2 = p2.getPosition();
        const center = {
            x: (pos1.x + pos2.x) / 2,
            y: (pos1.y + pos2.y) / 2,
        };
        const newPoint = new GraphPoint({center});
        this.adoptPoint(newPoint);
        this.breakPoints(p1, p2);
        this.connectPoints(p1, newPoint);
        this.connectPoints(newPoint, p2);
        return newPoint;
    }

    public restore(list: IAdjacencyNode[]): this {
        this.clear();
        return this._restore(list);
    }

    public appendTo(scene: IScene): void {
        scene.addGraphics(this);
        this.scene = scene;
        scene.drawingContainer.appendChild(this.container);
        this.selection = scene.selection;
        this.dragManager = scene.dragManager;
    }

    public destroy(): void {
        this.emit('destroy');
        this.container.remove();
    }

    public adoptPoint(point: GraphPoint) {
        point.setGraph(this);
        this.selection.set([point]);
        this.dragManager.enableDragging(point);
    }

    public addPoint(options?: IGraphPointOptions): IGraphPoint {
        const point = new GraphPoint(options);
        if (options.connectCurrent !== false) {
            if (this.selection) {
                if (this.selection.last && this.selection.last instanceof GraphPoint) {
                    this.connectPoints(this.selection.last, point);
                }
            }
        }
        this.adoptPoint(point);
        return point;
    }

    public serialize(): IAdjacencyNode[] {
        return this.vertices.map((vertex) => {
            const siblings: number[] = [];
            vertex.siblings.forEach((v) => {
                siblings.push(this.vertices.indexOf(v));
            });
            return {
                position: vertex.getPosition(),
                siblings,
                ObjectId: vertex.mapObjectId,
            };
        });
    }

    public clear(): void {
        if (this.vertices.length) {
            while (this.vertices.length) {
                this.vertices[0].destroy();
            }
        }
    }

    public hide(): void {
        this._cachedDisplay = this.container.style.display;
        this.container.style.display = 'none';
    }

    public show(): void {
        this.container.style.display = this._cachedDisplay || 'block';
    }

    /**
     * Recursively adds points from the list to graph
     *
     * @param list
     * @param index
     */
    private _restore(list: IAdjacencyNode[], index = 0): this {
        if (list.length) {
            for (let i = index; i < list.length; i++) {
                if (list[i].marked) {
                    continue;
                }
                list[i].marked = true;
                if (list[i].siblings.length) {
                    const current = this.addPoint({center: list[i].position});
                    list[i].siblings.forEach((sibling) => {
                        this._restore(list, sibling);
                        this.selection.set([current]);
                    });
                } else {
                    const current = this.addPoint({center: list[i].position, connectCurrent: false});
                    this.selection.set([current]);
                }
            }
        }
        return this;
    }
}
