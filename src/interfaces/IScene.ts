import {ICoords, IMapMouseEvent} from '..';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import ApiClient from '../core/ApiClient';
import ObjectManager from '../core/ObjectManager';
import Selection from '../core/Selection';
import Graphics from '../drawing/Graphics';
import DragManager from '../utils/DragManager';
import {IEventEmitter} from '../utils/EventEmitter';

export default interface IScene extends IEventEmitter {
  drawingContainer: SVGGElement;
  mapContainer: SVGGElement;
  root: SVGSVGElement;
  container: HTMLElement;
  labelsContainer: SVGGElement;
  readonly apiClient: ApiClient;
  readonly selection: Selection;
  readonly objectManager: ObjectManager;
  readonly dragManager: DragManager;
  setMapFromString(map: string): void;
  getMouseCoords(e: MouseEvent): ICoords;
  getViewBox(): number[];
  setViewBox(viewBox: number[]): void;
  getMouseEventInfo(event: MouseEvent): IMapMouseEvent;
  addGraphics(graphics: Graphics): void;
  getLocation(): ILocation;
  setLocation(location: ILocation): void;
  getZoom(): number;
  setZoom(f: number): void;
}
