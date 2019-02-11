import IGraphPoint from '../interfaces/IGraphPoint';
import {IGraph, IGraphPointOptions} from './Graph';
import {IGraphEdge} from './IGraphEdge';
import Point from './Point';

export default class GraphPoint extends Point implements IGraphPoint {
  public edges: IGraphEdge[] = [];
  public siblings: IGraphPoint[] = [];
  public mapObjectId: number;

  constructor(options: IGraphPointOptions) {
    super(options);
    if (options.mapObjectId) {
      this.mapObjectId = options.mapObjectId;
    }
  }

  public onDragMove(e: MouseEvent): void {
    this.edges.forEach((edge) => edge.update());
  }

  public onDestroy() {
    for (const edge of this.edges) {
      (edge as any).destroy();
    }
  }

  public setGraph(graph: IGraph) {
    graph.container.appendChild(this.element);
    graph.vertices.push(this);
    this.selection = graph.selection;
  }

}
