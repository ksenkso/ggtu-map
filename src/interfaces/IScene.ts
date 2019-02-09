import {ILocation} from "../api/endpoints/LocationsEndpoint";
import Selection from "../core/Selection";
import ObjectManager from "../core/ObjectManager";
import DragManager from "../utils/DragManager";
import ApiClient from "../core/ApiClient";
import {ICoords} from "..";

export default interface IScene {
  location: ILocation;
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

}
