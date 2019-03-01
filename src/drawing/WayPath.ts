import IGraphPoint from '../interfaces/IGraphPoint';
import IWayEdge from '../interfaces/IWayEdge';
import IWayPath from '../interfaces/IWayPath';
import IWayPoint from '../interfaces/IWayPoint';
import IWayPointOptions from '../interfaces/IWayPointOptions';
import {IAdjacencyNode} from '../utils';
import Graph from './Graph';
import WayEdge from './WayEdge';
import WayPoint from './WayPoint';

export default class WayPath extends Graph implements IWayPath {
    // TODO: recreate diff algorithm
    public vertices: IWayPoint[];
    public edges: IWayEdge[];

    public createPoint(options?: IWayPointOptions): WayPoint {
        return new WayPoint(options);
    }

    public createEdge(p1: IWayPoint, p2: IWayPoint, id?: string): WayEdge {
        return new WayEdge(p1, p2, id);
    }

    public connectPoints(p1: WayPoint, p2: WayPoint, id?: string) {
        const edge = this.createEdge(p1, p2, id);
        edge.setGraph(this);
    }

    public addPoint(options?: IWayPointOptions & IAdjacencyNode): IGraphPoint {
        const point = this.createPoint(options);
        if (options.connectCurrent !== false) {
            if (this.selection) {
                if (this.selection.last && this.selection.last instanceof WayPoint) {
                    this.connectPoints(this.selection.last, point, options.id);
                }
            }
        }
        this.adoptPoint(point);
        return point;
    }
}
