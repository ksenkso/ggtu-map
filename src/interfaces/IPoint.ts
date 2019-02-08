import {ICoords} from '..';
import {ILine} from './ILine';
import {IPrimitive} from './IPrimitive';

export interface IPoint extends IPrimitive {
  from: ILine[];
  to: ILine[];
  points: Set<IPoint>;
  path: SVGGElement;
  getPosition(): ICoords;
  moveToPath(sourceObject: IPoint): void;
}
