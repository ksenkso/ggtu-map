import {PointOptions} from '../drawing/Point';

export default interface IGraphPointOptions extends PointOptions {
    connectCurrent?: boolean;
    mapObjectId?: number;
}
