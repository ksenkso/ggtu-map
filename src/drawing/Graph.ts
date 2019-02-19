import Selection from '../core/Selection';
import IGraphPoint from '../interfaces/IGraphPoint';
import IScene from '../interfaces/IScene';
import ISerializable from '../interfaces/ISerializable';
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

  addPoint(options?: IGraphPointOptions): IGraphPoint;
}

export interface IGraphPointOptions extends PointOptions {
  connectCurrent?: boolean;
  mapObjectId?: number;
}

export default class Graph extends Graphics implements IGraph, ISerializable {
  public vertices: IGraphPoint[] = [];
  public edges: IGraphEdge[] = [];
  public readonly container: SVGGElement;
  public selection: Selection;
  private dragManager: DragManager;

  constructor() {
    super();
    this.container = Graphics.createElement('g', false) as SVGGElement;
  }

  public restore(list: IAdjacencyNode[], index = 0): this {
    const point = list[index];
    if (!point.marked) {
      point.marked = true;
      const current = this.addPoint({center: point.position});
      point.siblings.forEach((i) => {
        this.restore(list, i);
        this.selection.set([current]);
      });
    }
    return this;
  }

  public appendTo(scene: IScene): void {
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

  public serialize(): IAdjacencyNode[] {
    return this.vertices.map((vertex) => {
      const siblings: number[] = [];
      vertex.siblings.forEach((v) => {
        siblings.push(this.vertices.indexOf(v));
      });
      return {
        position: vertex.getPosition(),
        siblings,
        ObjectId: vertex.mapObjectId,
      };
    });
  }
}
