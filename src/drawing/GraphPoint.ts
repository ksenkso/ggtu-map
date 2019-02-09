import IGraphPoint from '../interfaces/IGraphPoint';
import {IGraph} from './Graph';
import {IGraphEdge} from './IGraphEdge';
import Point, {PointOptions} from './Point';

export default class GraphPoint extends Point implements IGraphPoint {
  public edges: IGraphEdge[] = [];
  public siblings: IGraphPoint[] = [];

  constructor(options: PointOptions) {
    super(options);
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
