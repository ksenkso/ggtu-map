import {Interactable} from 'interactjs';
import {ICoords} from '..';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import ApiClient from '../core/ApiClient';
import ObjectManager from '../core/ObjectManager';
import Selection from '../core/Selection';
import DragManager from '../utils/DragManager';
import {IEventEmitter} from '../utils/EventEmitter';

export default interface IScene extends IEventEmitter {
  drawingContainer: SVGGElement;
  mapContainer: SVGGElement;
  root: SVGSVGElement;
  container: HTMLElement;
  controlsContainer: SVGElement;
  readonly apiClient: ApiClient;
  readonly selection: Selection;
  readonly objectManager: ObjectManager;
  readonly dragManager: DragManager;
  readonly interactable: Interactable;
  setMapFromString(map: string): void;
  getMouseCoords(e: MouseEvent): ICoords;
  getViewBox(): number[];
  setViewBox(viewBox: number[]): void;
  getZoomLevel(bounds: ClientRect): number;
  getLocation(): ILocation;
  setLocation(location: ILocation): void;
}
