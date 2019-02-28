import ISerializedEdge from './ISerializedEdge';

export default interface ISerializedWayEdge extends ISerializedEdge {
    StartId: string;
    EndId: string;
}
