import {ICoords} from '..';

export default interface IAdjacencyNode {
    marked?: boolean;
    ObjectId?: number;
    position: ICoords;
    siblings: number[];
}
