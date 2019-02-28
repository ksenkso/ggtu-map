import {ILine} from '..';
import IGraphPoint from '../interfaces/IGraphPoint';
import ISerializable from '../interfaces/ISerializable';
import {IGraph} from './Graph';

export interface IGraphEdge extends ILine, ISerializable {
  start: IGraphPoint;
  end: IGraphPoint;
  update(): void;
  setGraph(graph: IGraph): void;
}
