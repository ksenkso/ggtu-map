import {IGraphEdge, IGraphPointOptions} from '..';
import Selection from '../core/Selection';
import GraphPoint from '../drawing/GraphPoint';
import {IEventEmitter} from '../utils/EventEmitter';
import IGraphPoint from './IGraphPoint';
import IScene from './IScene';

export default interface IGraph extends IEventEmitter {
    selection: Selection;
    scene: IScene;
    readonly container: SVGGElement;
    readonly vertices: IGraphPoint[];
    readonly edges: IGraphEdge[];
    clear(): void;
    breakPoints(p1: GraphPoint, p2: GraphPoint);
    addPoint(options?: IGraphPointOptions): IGraphPoint;
    connectPoints(p1: GraphPoint, p2: GraphPoint): void;
    insertBetween(p1: GraphPoint, p2: GraphPoint): GraphPoint;
    createEdge(p1: IGraphPoint, p2: IGraphPoint): IGraphEdge;
    createPoint(options?: IGraphPointOptions): IGraphPoint;
}
