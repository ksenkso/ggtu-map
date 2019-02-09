import {ICoords} from '..';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import ApiClient from '../core/ApiClient';
import ObjectManager from '../core/ObjectManager';
import Selection from '../core/Selection';
import DragManager from '../utils/DragManager';

export default interface IScene {
  drawingContainer: SVGGElement;
  mapContainer: SVGGElement;
  root: SVGSVGElement;
  container: HTMLElement;
  readonly apiClient: ApiClient;
  readonly selection: Selection;
  readonly objectManager: ObjectManager;
  readonly dragManager: DragManager;

  setMapFromString(map: string): void;
  getMouseCoords(e: MouseEvent): ICoords;
  getZoomLevel(bounds: ClientRect): number;
  getLocation(): ILocation;
  setLocation(location: ILocation): void;
}
