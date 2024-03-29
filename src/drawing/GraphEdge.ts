import {IGraph, IGraphEdge} from '..';
import IGraphPoint from '../interfaces/IGraphPoint';
import ISerializedEdge from '../interfaces/ISerializedEdge';
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
    // Remove the edge from both points to let GC free the memory
    this.start.edges.splice(this.start.edges.indexOf(this), 1);
    this.end.edges.splice(this.end.edges.indexOf(this), 1);
  }

  public setGraph(graph: IGraph) {
    graph.edges.push(this);
    if (graph.container) {
      graph.container.insertBefore(this.element, graph.container.firstElementChild);
    }
  }

  public serialize(): ISerializedEdge {
    return {
      start: this.start.getPosition(),
      end: this.end.getPosition(),
    };
  }
}
