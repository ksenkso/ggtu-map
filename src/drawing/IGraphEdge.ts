import {ILine} from '..';
import IGraphPoint from '../interfaces/IGraphPoint';
import {IGraph} from './Graph';

export interface IGraphEdge extends ILine {
  start: IGraphPoint;
  end: IGraphPoint;
  update(): void;
  setGraph(graph: IGraph): void;
}
