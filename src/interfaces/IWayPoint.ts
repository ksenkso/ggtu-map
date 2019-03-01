import IGraphPoint from './IGraphPoint';
import IWayEdge from './IWayEdge';

export default interface IWayPoint extends IGraphPoint {
    id: string;
    siblings: IWayPoint[];
    edges: IWayEdge[];
}
