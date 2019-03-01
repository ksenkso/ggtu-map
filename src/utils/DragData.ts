import {IDragData} from './DragManager';
import {ICoords} from './Vector';

export default class DragData implements IDragData {
  public delta: ICoords;
  public position: ICoords;
  public startPosition: ICoords;

  public reset(): void {
    this.delta = null;
    this.position = null;
    this.startPosition = null;
  }
}
