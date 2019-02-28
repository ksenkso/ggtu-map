import uuid = require('uuid/v4');
import ISerializedWayEdge from '../interfaces/ISerializedWayEdge';
import IWayEdge from '../interfaces/IWayEdge';
import IWayPoint from '../interfaces/IWayPoint';
import GraphEdge from './GraphEdge';

export default class WayEdge extends GraphEdge implements IWayEdge {
    public id: string;
    public start: IWayPoint;
    public end: IWayPoint;
    constructor(p1: IWayPoint, p2: IWayPoint, id?: string) {
        super(p1, p2);
        if (id) {
            this.id = id;
        } else {
            this.id = uuid();
        }
    }

    public serialize(): ISerializedWayEdge {
        return {
            StartId: this.start.id,
            EndId: this.end.id,
        };
    }

}
