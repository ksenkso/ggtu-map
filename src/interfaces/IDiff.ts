import ISerializedWayEdge from './ISerializedWayEdge';
import ISerializedWayPoint from './ISerializedWayPoint';

export default interface IDiff {
    vertices: {
        created: ISerializedWayPoint[],
        updated: ISerializedWayPoint[],
        deleted: string[],
    };
    edges: {
        created: ISerializedWayEdge[],
        deleted: string[],
    };
}
