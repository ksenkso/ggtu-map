import {IPrimitive} from './IPrimitive';
import {ICoords} from '../utils/Vector';
import {IPoint} from './IPoint';

export interface ILine extends IPrimitive {
  from: IPoint;
  to: IPoint;
  bindPoints(from: IPoint, to: IPoint): void;
  unbindPoints(from: IPoint, to: IPoint): void;
  setCoords(from?: ICoords, to?: ICoords): void;
}
