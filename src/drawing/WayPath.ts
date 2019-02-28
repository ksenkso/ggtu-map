import IWayEdge from '../interfaces/IWayEdge';
import IWayPath from '../interfaces/IWayPath';
import IWayPoint from '../interfaces/IWayPoint';
import Graph from './Graph';

export default class WayPath extends Graph implements IWayPath {
    public vertices: IWayPoint[];
    public edges: IWayEdge[];

}
