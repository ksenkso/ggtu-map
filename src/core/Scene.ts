import interact = require('interactjs');
import {Interactable} from 'interactjs';
import {ICoords, MapObject, ObjectType} from '..';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import Graphics from '../drawing/Graphics';
import Primitive from '../drawing/Primitive';
import IScene from '../interfaces/IScene';
import DragManager from '../utils/DragManager';
import EventEmitter from '../utils/EventEmitter';
import ApiClient from './ApiClient';
import ObjectManager from './ObjectManager';
import Selection from './Selection';
import DragControl from "./DragControl";
export interface IMapMouseEvent {
  originalEvent: MouseEvent;
  mapCoords: ICoords;
  objectType?: ObjectType;
  mapObject?: MapObject;
  mapElement?: SVGGElement;
}

export default class Scene extends EventEmitter implements IScene {

  /**
   * Sets a label for an object on the map
   * @param el
   * @param name
   */
  public static setLabel(el: SVGGraphicsElement | ICoords, name: string) {
    const text = Primitive.createElement('text') as SVGTextElement;
    text.textContent = name;
    let x, y;
    if (el instanceof SVGGraphicsElement) {
      // get the box before text element is appended, otherwise it will extend the box to the top-left corner of the SVG
      const rect = el.getBBox();
      el.appendChild(text);
      const textRect = text.getBBox();
      x = rect.x + (rect.width - textRect.width) / 2;
      y = rect.y + (rect.height + textRect.height) / 2;
    } else {
      x = el.x;
      y = el.y;
    }
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));

  }

  /*public get pointsContainer() {
    return this.activePath.querySelector('.path__points');
  }
  public get linesContainer() {
    return this.activePath.querySelector('.path__lines');
  }*/

  public readonly apiClient: ApiClient;
  public readonly selection: Selection;
  public readonly objectManager: ObjectManager;
  public readonly dragManager: DragManager;
  public readonly interactable: Interactable;
  // private pathsContainer: SVGGElement;

  public drawingContainer: SVGGElement;
  public mapContainer: SVGGElement;
  public controlsContainer: SVGElement;
  public root: SVGSVGElement;
  public container: HTMLElement;

  private _location: ILocation;
  // public activePath: SVGGElement;

  private svg: SVGSVGElement;

  constructor(
    container: HTMLElement,
  ) {
    super();

    this.container = container;
    this.root = Primitive.createElement('svg', false) as SVGSVGElement;
    this.container.appendChild(this.root);
    // Create containers for map and paths
    this.mapContainer = Graphics.createElement('g', false) as SVGGElement;
    this.mapContainer.classList.add('scene__map');
    this.root.appendChild(this.mapContainer);
    this.drawingContainer = Graphics.createElement('g', false) as SVGGElement;
    this.drawingContainer.classList.add('scene__drawing');
    this.root.appendChild(this.drawingContainer);
    this.controlsContainer = Graphics.createElement('g', false) as SVGGElement;
    this.root.appendChild(this.controlsContainer);
    this.interactable = interact(this.container);
    const drag = new DragControl();
    drag.appendTo(this);
    this.apiClient = ApiClient.getInstance();
    this.selection = new Selection();
    this.objectManager = new ObjectManager(this.apiClient);
    this.dragManager = new DragManager(this);
    this.container.addEventListener('click', this.onMapClick.bind(this));
    this.container.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  public getLocation(): ILocation {
    return this._location;
  }

  public setLocation(value: ILocation, force = false) {
    if (force || (!this._location || this._location.id !== value.id)) {
      this._location = value;
      if (value.map) {
        this.apiClient.getTransport().get(ApiClient.mapsBase + '/' + value.map)
          .then((response) => {
            if (response.status === 200) {
              this.setMapFromString(response.data as string);
              this.objectManager.updateLocation(value.id)
                .then(() => {
                  const objects: any[] = (this.objectManager.places as any[]).concat(this.objectManager.buildings);
                  for (const object of objects) {
                    const selector = '#' + CSS.escape(object.container);
                    const el = this.mapContainer.querySelector(selector) as SVGGraphicsElement;
                    if (el) {
                      console.log(selector);
                      Scene.setLabel(el, object.name);
                    }
                  }
                });
            }
          })
          .catch((error) => {
            //  TODO: create an error handling system
            console.error(error);
          });
      } else {
        throw new Error('Map is not available');
      }
    }
    this._location = value;
  }

  public setMapFromString(map: string) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(map, 'image/svg+xml');
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

  public async refresh(): Promise<void> {
    const updated = await this.apiClient.locations.get(this._location.id);
    this.setLocation(updated, true);
  }

  private onMapClick(event: MouseEvent): void {
    const payload: IMapMouseEvent = {
      mapCoords: this.getMouseCoords(event),
      originalEvent: event,
    };
    // Find an object in the event path:
    const path = event.composedPath().filter((el) => el !== window && el !== document);
    console.log(path);
    const mapElement = path.find((target: Element) => target.matches('g[data-type]')) as SVGGElement;
    if (mapElement) {
      const type = mapElement.dataset.type as ObjectType;
      payload.objectType = type;
      if (mapElement) {
        payload.mapElement = mapElement;
        const id = +mapElement.dataset.id;
        if (id) {
          // Check if we have this object.
          payload.mapObject = this.objectManager.getCollectionByType(type).find((item) => item.id === id);
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

  private onKeyUp(e) {
    this.emit('keyup', e);
  }
}
