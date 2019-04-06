import {ICoords} from '..';
import Selection from '../core/Selection';
import IAdjacencyNode from '../interfaces/IAdjacencyNode';
import IGraph from '../interfaces/IGraph';
import IGraphEdge from '../interfaces/IGraphEdge';
import IGraphPoint from '../interfaces/IGraphPoint';
import IGraphPointOptions from '../interfaces/IGraphPointOptions';
import IPathItem from '../interfaces/IPathItem';
import IScene from '../interfaces/IScene';
import ISerializable from '../interfaces/ISerializable';
import DragManager from '../utils/DragManager';
import GraphEdge from './GraphEdge';
import Graphics from './Graphics';
import GraphPoint from './GraphPoint';

export default class Graph extends Graphics implements IGraph, ISerializable {
    public vertices: IGraphPoint[] = [];
    public edges: IGraphEdge[] = [];
    public readonly container: SVGGElement;
    public selection: Selection;
    public scene: IScene;
    private dragManager: DragManager;

    constructor(selection?: Selection) {
        super();
        if (selection) {
            this.selection = selection;
        }
        this.container = Graphics.createElement('g', false) as SVGGElement;
    }

    /**
     * Draws a path from start to end
     *
     * @param path
     */
    public showPath(path: IPathItem[]) {
        path.forEach((item) => {
            this.addPoint(item);
        });
    }

    public createEdge(p1: IGraphPoint, p2: IGraphPoint): GraphEdge {
        return new GraphEdge(p1, p2);
    }

    public createPoint(options?: IGraphPointOptions): GraphPoint {
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
        const edge = this.createEdge(p1, p2);
        edge.setGraph(this);
    }

    public insertBetween(p1: GraphPoint, p2: GraphPoint): GraphPoint {
        const pos1 = p1.getPosition(),
            pos2 = p2.getPosition();
        const position: ICoords = {
            x: (pos1.x + pos2.x) / 2,
            y: (pos1.y + pos2.y) / 2,
        };
        const newPoint = this.createPoint({position});
        this.adoptPoint(newPoint);
        this.breakPoints(p1, p2);
        this.connectPoints(p1, newPoint);
        this.connectPoints(newPoint, p2);
        return newPoint;
    }

    public restore(list: IAdjacencyNode[]) {
        this.clear();
        for (let i = 0; i < list.length; i++) {
            this._restore(list, i);
        }
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
        if (this.selection) {
            this.selection.set([point]);
        }
        if (this.dragManager) {
            this.dragManager.enableDragging(point);
        }
    }

    public addPoint(options?: IGraphPointOptions): IGraphPoint {
        const point = this.createPoint(options);
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
            const siblings = [];
            vertex.siblings.forEach((v) => {
                siblings.push({
                    index: this.vertices.indexOf(v),
                    id: null,
                });
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
     */
    private _restore(list: IAdjacencyNode[], i = 0, edgeId = null) {
        if (list.length && !list[i].marked) {
            list[i].marked = true;
            const current = this.addPoint(Object.assign(
                {},
                {
                    connectCurrent: (list[i].siblings && list[i].siblings.length) || !list[i].siblings,
                    edgeId,
                },
                list[i]),
            );
            if (list[i].siblings.length) {
                list[i].siblings.forEach((sibling) => {
                    this._restore(list, sibling.index, sibling.id);
                    this.selection.set([current]);
                });
            } else {
                this.selection.set([current]);
            }
        }
    }
}
