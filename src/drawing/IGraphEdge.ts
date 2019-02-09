import {ILine} from '..';
import {IGraph} from './Graph';

export interface IGraphEdge extends ILine {
  update(): void;
  setGraph(graph: IGraph): void;
}
