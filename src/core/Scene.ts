import {ICoords} from "..";
import Selection from './Selection';
import {IPoint} from "..";
import {AdjacencyNode} from "../utils";
import {IPrimitive} from "..";
import EventEmitter from "../utils/EventEmitter";
import ApiClient from "./ApiClient";
import Graphics from "../drawing/Graphics";

export default class Scene extends EventEmitter {
  private apiClient: ApiClient;
  public readonly selection: Selection;
  public location: any;
  public activePath: SVGGElement;

  private static svg: SVGSVGElement;
  private static pathsContainer: SVGGElement;

  public static mapContainer: SVGGElement;
  public static container: SVGSVGElement;

  public get pointsContainer() {
    return this.activePath.querySelector('.path__points');
  }

  public get linesContainer() {
    return this.activePath.querySelector('.path__lines');
  }

  constructor(
    container: SVGSVGElement
  ) {
    super();
    this.apiClient = ApiClient.getInstance();
    this.selection = new Selection();
    Scene.container = container;
    // Create containers for map and paths
    const mapContainer = <SVGGElement>Graphics.createElement('g', false);
    mapContainer.classList.add('scene__map');
    Scene.container.appendChild(mapContainer);
    Scene.mapContainer = mapContainer;
    // TODO: create it only if needed.
    const pathsContainer = <SVGGElement>Graphics.createElement('g', false);
    pathsContainer.classList.add('scene__paths');
    Scene.container.appendChild(pathsContainer);
    Scene.pathsContainer = pathsContainer;
    this.activePath = Scene.createPath();
    Scene.pathsContainer.appendChild(this.activePath);
    Scene.container.addEventListener('click', this.onMapClick.bind(this));
    Scene.container.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  private onMapClick(event: MouseEvent): void {
    this.emit('click', {
      originalEvent: event,
      mapCoords: Scene.getMouseCoords(event)
    });
  }

  public addPrimitive(primitive: IPrimitive) {
    primitive.appendTo(this);
  }

  private updateMap(map: SVGSVGElement): void {
    if (Scene.svg) {
      Scene.svg.remove();
    }
    const viewBox = map.getAttribute('viewBox');
    if (viewBox) {
      Scene.container.setAttribute('viewBox', viewBox);
    }
    Scene.svg = map;
    Scene.mapContainer.innerHTML = map.innerHTML;
    Scene.pathsContainer.innerHTML = '';
    this.activePath = Scene.createPath();
    Scene.pathsContainer.appendChild(this.activePath);
    this.emit('mapChanged');
  }

  public setMapFromString(map: string) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(map, "image/svg+xml");
    const root = dom.firstElementChild;
    this.updateMap(root as SVGSVGElement);
  }

  public setMapFromFile(file: File): Promise<void> {
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
  }

  public static getMouseCoords(e: MouseEvent): ICoords {
    const bounds = Scene.mapContainer.getBoundingClientRect();
    const zoomLevel = Scene.getZoomLevel(bounds);
    const x = (e.clientX - bounds.left) / zoomLevel;
    const y = (e.clientY - bounds.top) / zoomLevel;
    return {x, y};
  }

  public static getZoomLevel(bounds: ClientRect): number {
    const viewBox = Scene.container.getAttribute('viewBox').split(' ');
    return bounds.width / +viewBox[2];
  }

  private onKeyUp(e) {
    this.emit('keyup', e);
  }

  private static createPath(): SVGGElement {
    const path = <SVGGElement>Graphics.createElement('g');
    path.classList.add('primitive_path');
    const lines = Graphics.createElement('g');
    lines.classList.add('path__lines');
    path.appendChild(lines);
    const points = Graphics.createElement('g');
    points.classList.add('path__points');
    path.appendChild(points);
    return path;
  }

  public getAdjacencyList(list): AdjacencyNode[] {
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
  }
}
