import {IGraph} from '..';
import IWayEdge from './IWayEdge';
import IWayPoint from './IWayPoint';

export default interface IWayPath extends IGraph {
    vertices: IWayPoint[];
    edges: IWayEdge[];

}
