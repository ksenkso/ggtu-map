import {IGraph, IGraphEdge} from '..';
import IGraphPoint from '../interfaces/IGraphPoint';
import Line from './Line';

export default class GraphEdge extends Line implements IGraphEdge {
  constructor(public start: IGraphPoint, public end: IGraphPoint) {
    super(start.getPosition(), end.getPosition());
    start.edges.push(this);
    end.edges.push(this);
  }

  public update() {
    const start = this.start.getPosition();
    const end = this.end.getPosition();
    this.setCoords(start, end);
  }

  public setGraph(graph: IGraph) {
    graph.container.insertBefore(this.element, graph.container.firstElementChild);
    graph.edges.push(this);
  }
}
