import uuid = require('uuid/v4');
import IWayPoint from '../interfaces/IWayPoint';
import IWayPointOptions from '../interfaces/IWayPointOptions';
import GraphPoint from './GraphPoint';

export default class WayPoint extends GraphPoint implements IWayPoint {
    public id: string;

    constructor(options: IWayPointOptions) {
        super(options);
        if (options.id) {
            this.id = options.id;
        } else {
            this.id = uuid();
        }
    }

}
