import Scene from '../core/Scene';
import Selection from '../core/Selection';
import IGraphPoint from '../interfaces/IGraphPoint';
import {IAdjacencyNode} from '../utils';
import DragManager from '../utils/DragManager';
import GraphEdge from './GraphEdge';
import Graphics from './Graphics';
import GraphPoint from './GraphPoint';
import {IGraphEdge} from './IGraphEdge';
import {PointOptions} from './Point';

export interface IGraph {
  selection: Selection;
  readonly container: SVGGElement;
  readonly vertices: IGraphPoint[];
  readonly edges: IGraphEdge[];
  getAdjacencyList(): IAdjacencyNode[];
  addPoint(options?: IGraphPointOptions): IGraphPoint;
}

export interface IGraphPointOptions extends PointOptions {
  connectCurrent: boolean;
}

export default class Graph extends Graphics implements IGraph {

  public static fromAdjacencyList(list: IAdjacencyNode[]): IGraph {
    // TODO: implement list parsing
    return null;
  }
  public vertices: IGraphPoint[] = [];
  public edges: IGraphEdge[] = [];
  public readonly container: SVGGElement;
  public selection: Selection;
  private dragManager: DragManager;
  constructor() {
    super();
    this.container = Graphics.createElement('g', false) as SVGGElement;
  }
  public appendTo(scene: Scene): void {
    scene.drawingContainer.appendChild(this.container);
    this.selection = scene.selection;
    this.dragManager = scene.dragManager;
  }

  public destroy(): void {
    this.container.remove();
  }

  public addPoint(options?: IGraphPointOptions): IGraphPoint {
    const point = new GraphPoint(options);
    if (options.connectCurrent !== false) {
      if (this.selection) {
        if (this.selection.current && this.selection.current instanceof GraphPoint) {
          const edge = new GraphEdge(this.selection.current, point);
          edge.setGraph(this);
        }
      }
    }
    point.setGraph(this);
    this.selection.set([point]);
    this.dragManager.enableDragging(point);
    return point;
  }

  public getAdjacencyList(): IAdjacencyNode[] {
    return [];
  }

}
