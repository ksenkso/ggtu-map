import {IGraph, IGraphEdge, IPoint} from '..';
import ISerializable from './ISerializable';

export default interface IGraphPoint extends IPoint, ISerializable {
  siblings: IGraphPoint[];
  edges: IGraphEdge[];
  mapObjectId?: number;
  graph: IGraph;
  setGraph(graph: IGraph): void;
}
