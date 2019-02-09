import {ICoords} from '..';
import {IPoint} from './IPoint';
import {IPrimitive} from './IPrimitive';

export interface ILine extends IPrimitive {
  from: IPoint;
  to: IPoint;
  /*bindPoints(from: IPoint, to: IPoint): void;
  unbindPoints(from: IPoint, to: IPoint): void;*/
  setCoords(from?: ICoords, to?: ICoords): void;
}
