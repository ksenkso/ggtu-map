import {IGraphEdge} from '..';
import IWayPoint from './IWayPoint';

export default interface IWayEdge extends IGraphEdge {
    id: string;
    start: IWayPoint;
    end: IWayPoint;
}
