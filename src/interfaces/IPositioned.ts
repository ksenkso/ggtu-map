import {ICoords} from '../utils';

export default interface IPositioned {
    getPosition(): ICoords;
    setPosition(coords: ICoords): void;
}
