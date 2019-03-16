import IAdjacencyNode from '../interfaces/IAdjacencyNode';
import IDiff from '../interfaces/IDiff';
import IGraphPoint from '../interfaces/IGraphPoint';
import IWayEdge from '../interfaces/IWayEdge';
import IWayPath from '../interfaces/IWayPath';
import IWayPoint from '../interfaces/IWayPoint';
import IWayPointOptions from '../interfaces/IWayPointOptions';
import Vector from '../utils/Vector';
import Graph from './Graph';
import WayEdge from './WayEdge';
import WayPoint from './WayPoint';

export default class WayPath extends Graph implements IWayPath {
    public static diff(g1: WayPath, g2: WayPath): IDiff {
        const diff: IDiff = {
            vertices: {
                created: [],
                updated: [],
                deleted: [],
            },
            edges: {
                created: [],
                deleted: [],
            },
        };
        const newVertices = g2.vertices.slice(0);
        g1.vertices.forEach((v1) => {
            const index = newVertices.findIndex((v) => v.id === v1.id);
            if (index !== -1) {
                const v2 = newVertices[index];
                // Check if points have differences
                if (
                    !Vector.equals(v1.getPosition(), v2.getPosition())
                    || v1.mapObjectId !== v2.mapObjectId
                ) {
                    diff.vertices.updated.push(v2.serialize());
                }
                newVertices.splice(index, 1);
            } else {
                diff.vertices.deleted.push(v1.id);
            }
        });
        if (newVertices.length) {
            diff.vertices.created = newVertices.map((v) => v.serialize());
        }
        const newEdges = g2.edges.slice(0);
        g1.edges.forEach((edge) => {
             const index = newEdges.findIndex((e) => e.id === edge.id);
             if (index !== -1) {
                 newEdges.splice(index, 1);
             } else {
                 diff.edges.deleted.push(edge.id);
             }
        });
        if (newEdges.length) {
            diff.edges.created = newEdges.map((edge) => edge.serialize());
        }
        return diff;
    }
    public vertices: IWayPoint[];
    public edges: IWayEdge[];

    public serialize(): IAdjacencyNode[] {
        return this.vertices.map((vertex) => {
            const siblings = [];
            vertex.siblings.forEach((v) => {
                siblings.push({
                    index: this.vertices.indexOf(v),
                    id: this.edges.find((edge) => (edge.start.id === vertex.id && edge.end.id === v.id)
                    || (edge.end.id === vertex.id && edge.start.id === v.id)).id,
                });
            });

            return {
                position: vertex.getPosition(),
                siblings,
                ObjectId: vertex.mapObjectId,
            };
        });
    }

    public createPoint(options?: IWayPointOptions): WayPoint {
        return new WayPoint(options);
    }

    public createEdge(p1: IWayPoint, p2: IWayPoint, id?: string): WayEdge {
        return new WayEdge(p1, p2, id);
    }

    public connectPoints(p1: WayPoint, p2: WayPoint, id?: string) {
        const edge = this.createEdge(p1, p2, id);
        edge.setGraph(this);
    }

    public addPoint(options?: IWayPointOptions & IAdjacencyNode): IGraphPoint {
        const point = this.createPoint(options);
        if (options.connectCurrent !== false) {
            if (this.selection) {
                if (this.selection.last && this.selection.last instanceof WayPoint) {
                    this.connectPoints(
                        this.selection.last, point,
                        options.edgeId,
                    );
                }
            }
        }
        this.adoptPoint(point);
        return point;
    }
}
