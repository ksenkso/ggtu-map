import {IGraph, IGraphEdge, IPoint} from '..';

export default interface IGraphPoint extends IPoint {
  siblings: IGraphPoint[];
  edges: IGraphEdge[];
  mapObjectId?: number;
  graph: IGraph;
  setGraph(graph: IGraph): void;
}
