import {IGraph, IGraphEdge} from '..';
import IGraphPoint from '../interfaces/IGraphPoint';
import Line from './Line';

export default class GraphEdge extends Line implements IGraphEdge {
  constructor(public start: IGraphPoint, public end: IGraphPoint) {
    super(start.getPosition(), end.getPosition());
    start.edges.push(this);
    end.edges.push(this);
    start.siblings.push(end);
    end.siblings.push(start);
  }

  public update() {
    const start = this.start.getPosition();
    const end = this.end.getPosition();
    this.setCoords(start, end);
  }

  public destroy() {
    super.destroy();
    this.start.edges.splice(this.start.edges.indexOf(this), 1);
    this.end.edges.splice(this.end.edges.indexOf(this), 1);
  }

  public setGraph(graph: IGraph) {
    graph.container.insertBefore(this.element, graph.container.firstElementChild);
    graph.edges.push(this);
  }
}
