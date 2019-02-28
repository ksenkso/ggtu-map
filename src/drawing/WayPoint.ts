import uuid = require('uuid/v4');
import IGraphPoint from '../interfaces/IGraphPoint';
import {IGraphPointOptions} from './Graph';
import GraphPoint from './GraphPoint';

interface IWayPoint extends IGraphPoint {
    id: string;
}

interface IWayPointOptions extends IGraphPointOptions {
    id?: string;
}

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
