import {ILine} from '..';
import IGraph from './IGraph';
import IGraphPoint from './IGraphPoint';
import ISerializable from './ISerializable';

export default interface IGraphEdge extends ILine, ISerializable {
  start: IGraphPoint;
  end: IGraphPoint;
  update(): void;
  setGraph(graph: IGraph): void;
}
