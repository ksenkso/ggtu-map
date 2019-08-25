import * as uuid from 'uuid/v4';
import ISerializedWayPoint from '../interfaces/ISerializedWayPoint';
import IWayEdge from '../interfaces/IWayEdge';
import IWayPoint from '../interfaces/IWayPoint';
import IWayPointOptions from '../interfaces/IWayPointOptions';
import GraphPoint from './GraphPoint';

export default class WayPoint extends GraphPoint implements IWayPoint {
    public id: string;
    public siblings: IWayPoint[];
    public edges: IWayEdge[];

    constructor(options: IWayPointOptions) {
        super(options);
        if (options.id) {
            this.id = options.id;
        } else {
            this.id = uuid();
        }
    }

    public serialize(): ISerializedWayPoint {
        const data = super.serialize();
        (data as ISerializedWayPoint).id = this.id;
        return data as ISerializedWayPoint;
    }

}
