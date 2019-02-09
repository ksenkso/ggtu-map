import {ICoords} from '..';
import {IPrimitive} from './IPrimitive';

export interface ILine extends IPrimitive {
  from: ICoords;
  to: ICoords;
  /*bindPoints(from: IPoint, to: IPoint): void;
  unbindPoints(from: IPoint, to: IPoint): void;*/
  setCoords(from?: ICoords, to?: ICoords): void;
}
