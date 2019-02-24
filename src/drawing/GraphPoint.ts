import IGraphPoint from '../interfaces/IGraphPoint';
import {IGraph, IGraphPointOptions} from './Graph';
import {IGraphEdge} from './IGraphEdge';
import Point from './Point';

export default class GraphPoint extends Point implements IGraphPoint {
  public edges: IGraphEdge[] = [];
  public siblings: IGraphPoint[] = [];
  public mapObjectId: number;
  public graph: IGraph;

  constructor(options: IGraphPointOptions) {
    super(options);
    if (options.mapObjectId) {
      this.mapObjectId = options.mapObjectId;
    }
  }

  public onDragMove(e: MouseEvent): void {
    this.edges.forEach((edge) => edge.update());
  }

  public destroy() {
    super.destroy();
    while (this.edges.length) {
      this.edges[0].destroy();
    }

    const index = this.graph.vertices.indexOf(this);
    if (index !== -1) {
      this.graph.vertices.splice(index, 1);
    }
  }

  public setGraph(graph: IGraph) {
    this.graph = graph;
    graph.container.appendChild(this.element);
    graph.vertices.push(this);
    this.selection = graph.selection;
  }

}
