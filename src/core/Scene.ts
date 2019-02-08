import {ICoords} from "../utils/Vector";
import Selection from './Selection';
import Primitive from "../drawing/Primitive";
import EventEmitter from "../utils/EventEmitter";
import ApiClient from "./ApiClient";
import ObjectManager from "./ObjectManager";
import {ILocation} from "../api/endpoints/LocationsEndpoint";

export default class Scene extends EventEmitter {
  private _location: ILocation;
  public get location(): ILocation {
    return this._location;
  }
  public set location(value: ILocation) {
    if (this._location && this._location.id !== value.id) {
      this.apiClient.getTransport().get(ApiClient.mapsBase + '/' + value.map)
        .then(response => {
          if (response.status === 200) {
            this.setMapFromString(response.data as string);
            this.objectManager.updateLocation(value.id)
              .then(() => {
                const places = this.objectManager.places;
                for (let i = 0; i < places.length; i++) {
                  const place = places[i];
                  const el = <SVGElement>this.mapContainer.querySelector('#' + place.container);
                  if (el) {
                    Scene.setLabel(el, place.name);
                  }
                }
              });
          }
        })
        .catch(error => {
        //  TODO: create an error handling system
          console.error(error);
        })
    }
    this._location = value;
  }

  /*public get pointsContainer() {
    return this.activePath.querySelector('.path__points');
  }
  public get linesContainer() {
    return this.activePath.querySelector('.path__lines');
  }*/

  private readonly apiClient: ApiClient;
  public readonly selection: Selection;
  public readonly objectManager: ObjectManager;
  // public activePath: SVGGElement;

  private svg: SVGSVGElement;
  // private pathsContainer: SVGGElement;

  public drawingContainer: SVGGElement;
  public mapContainer: SVGGElement;
  public root: SVGSVGElement;
  public container: HTMLElement;

  constructor(
    container: HTMLElement
  ) {
    super();
    this.apiClient = ApiClient.getInstance();
    this.selection = new Selection();
    this.objectManager = new ObjectManager(this.apiClient);
    this.container = container;
    this.root = <SVGSVGElement>Primitive.createElement('svg', false);
    this.container.appendChild(this.root);
    // Create containers for map and paths
    const mapContainer = <SVGGElement>Primitive.createElement('g', false);
    mapContainer.classList.add('scene__map');
    this.container.appendChild(mapContainer);
    this.mapContainer = mapContainer;
    // TODO: create it only if needed.
    /*const pathsContainer = <SVGGElement>Primitive.createElement('g', false);
    pathsContainer.classList.add('scene__paths');
    this.container.appendChild(pathsContainer);
    this.pathsContainer = pathsContainer;
    this.activePath = Scene.createPath();
    this.pathsContainer.appendChild(this.activePath);*/
    this.container.addEventListener('click', this.onMapClick.bind(this));
    this.container.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  private onMapClick(event: MouseEvent): void {
    const payload: any = {
      originalEvent: event,
      mapCoords: this.getMouseCoords(event),
    };
    // Find an object in the event path:
    const path = event.composedPath();
    const mapElement = <SVGElement>path.find((target: Element) => target.matches('g[data-type]'));
    const type = mapElement.dataset.type;
    if (mapElement) {
      payload.mapElement = mapElement;
      const id = +mapElement.dataset.id;
      if (id) {
        // Check if we have this object.
        const mapObject = this.objectManager.getCollectionByType(type).find(item => item.id === id);
        if (mapObject) {
          payload.mapObject = mapObject;
        } else {
          payload.mapObjectId = id;
        }
      }
    }
    this.emit('click', payload);
  }

  private updateMap(map: SVGSVGElement): void {
    if (this.svg) {
      this.svg.remove();
    }
    const viewBox = map.getAttribute('viewBox');
    if (viewBox) {
      this.container.setAttribute('viewBox', viewBox);
    }
    this.svg = map;
    this.mapContainer.innerHTML = map.innerHTML;
    // TODO: change map structure to render UI and primitives
    /*this.pathsContainer.innerHTML = '';
    this.activePath = Scene.createPath();
    this.pathsContainer.appendChild(this.activePath);*/
    this.emit('mapChanged');
  }

  public setMapFromString(map: string) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(map, "image/svg+xml");
    const root = dom.firstElementChild;
    this.updateMap(root as SVGSVGElement);
  }

  /*public setMapFromFile(file: File): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (file.type !== 'image/svg+xml') {
        reject(new Error('Map file should be an SVG with MIME-type "image/svg+xml, got ' + file.type));
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState === FileReader.DONE) {
          this.setMapFromString(reader.result as string);
          resolve();
        }
      };
      reader.readAsText(file);
    })
  }*/

  public getMouseCoords(e: MouseEvent): ICoords {
    const bounds = this.mapContainer.getBoundingClientRect();
    const zoomLevel = this.getZoomLevel(bounds);
    const x = (e.clientX - bounds.left) / zoomLevel;
    const y = (e.clientY - bounds.top) / zoomLevel;
    return {x, y};
  }

  public getZoomLevel(bounds: ClientRect): number {
    const viewBox = this.container.getAttribute('viewBox').split(' ');
    return bounds.width / +viewBox[2];
  }

  private onKeyUp(e) {
    this.emit('keyup', e);
  }

  /*private static createPath(): SVGGElement {
    const path = <SVGGElement>Primitive.createElement('g');
    path.classList.add('primitive_path');
    const lines = Primitive.createElement('g');
    lines.classList.add('path__lines');
    path.appendChild(lines);
    const points = Primitive.createElement('g');
    points.classList.add('path__points');
    path.appendChild(points);
    return path;
  }*/

  /*public getAdjacencyList(list): AdjacencyNode[] {
    return list.map((point: IPoint) => {
      const points: number[] = [];
      point.points.forEach((v: IPoint) => {
        points.push(list.indexOf(v));
      });
      return {
        location: point.getPosition(),
        points
      };
    });
  }*/

  /**
   * Sets a label for an object on the map
   * @param el
   * @param name
   */
  private static setLabel(el: SVGElement, name: string) {
    const text = <SVGTextElement>Primitive.createElement('text');
    text.textContent = name;
    el.appendChild(text);
    const rect = el.getBoundingClientRect();
    const textRect = text.getBoundingClientRect();
    const x = rect.left + (rect.width - textRect.width)/2;
    const y = rect.top + (rect.height - textRect.height)/2;
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
  }
}
