import {IGraph, IGraphEdge, IPoint} from '..';

export default interface IGraphPoint extends IPoint {
  siblings: IGraphPoint[];
  edges: IGraphEdge[];
  setGraph(graph: IGraph): void;
}
