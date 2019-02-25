import {IDraggable} from '../utils/DragManager';
import {IPrimitive} from './IPrimitive';

export interface IPoint extends IPrimitive, IDraggable {
    getRadius(): number;
    setRadius(r: number): void;
}
