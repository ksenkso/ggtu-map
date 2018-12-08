import {ICoords} from "../utils/Vector";
import Selection from './Selection';
import {create, Define} from "./di";
import UndoRedoStack from "./UndoRedoStack";
import {IPoint} from "../interfaces/IPoint";
import CreatePointCommand from "../commands/CreatePointCommand";
import Primitive from "../drawing/Primitive";
import DragAndDrop from "./DragAndDrop";
import {AdjacencyNode, calculateNormals, getDoorCoords, getIntersectionPoint, NormalData} from "../utils/index";
import {IPrimitive} from "../interfaces/IPrimitive";
import DeleteCommand from "../commands/DeleteCommand";
import Vector from "../utils/Vector";
import ConnectPointsCommand from "../commands/ConnectPointsCommand";

@Define
export default class Scene {
  private static svg: SVGSVGElement;
  public static mapContainer: SVGGElement;
  public static container: HTMLElement;
  private static pathsContainer: SVGGElement;
  public activePath: SVGGElement;
  private points: IPoint[] = [];

  public get pointsContainer() {
    return this.activePath.querySelector('.path__points');
  }

  public get linesContainer() {
    return this.activePath.querySelector('.path__lines');
  }

  constructor(
    private selection: Selection,
    private commandManager: UndoRedoStack,
    container: HTMLElement
  ) {
    Scene.container = container;
    Scene.mapContainer = Scene.container.querySelector('.scene__map');
    Scene.pathsContainer = Scene.container.querySelector('.scene__paths');
    this.activePath = Scene.createPath();
    Scene.pathsContainer.appendChild(this.activePath);
    Scene.container.addEventListener('click', this.onSvgClick.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('keypress', this.onKeyPress.bind(this));
    // Create a Drag'n'Drop manager to bind event listeners
    new DragAndDrop(this.commandManager);
  }

  public addPrimitive(primitive: IPrimitive) {
    primitive.appendTo(this);
    // this.activePath.appendChild(primitive.element);
  }

  public updateMap(map: SVGSVGElement): void {
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
  }

  private onSvgClick(e: MouseEvent): void {
    if (!Scene.svg) return;
    const {x, y} = Scene.getMouseCoords(e);
    // Always create a new point when SVG id clicked
    if (!this.activePath) {
      this.activePath = Scene.createPath();
      Scene.pathsContainer.appendChild(this.activePath);
    }
    const command = create(CreatePointCommand, {coords: {x, y}, path: this.activePath}) as CreatePointCommand;
    const point = this.commandManager.do(command) as IPoint;
    point.onDestroy = () => this.points.splice(this.points.indexOf(point), 1);
    console.log(x, y, point);
    this.points.push(point);
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
    if (e.key === 'Delete') {
      if (this.selection.elements.length) {
        this.commandManager.do(new DeleteCommand(this, this.selection.elements));
      }
    }

  }

  private onKeyPress(e) {
    if (e.ctrlKey) {
      switch (e.code) {
        case 'KeyZ': {
          this.commandManager.undo();
          break;
        }
        case 'KeyY': {
          this.commandManager.redo();
          break;
        }
      }
    }
  }

  private static createPath(): SVGGElement {
    const path = <SVGGElement>Primitive.createElement('g');
    path.classList.add('primitive_path');
    const lines = Primitive.createElement('g');
    lines.classList.add('path__lines');
    path.appendChild(lines);
    const points = Primitive.createElement('g');
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

  public drawGraph(adjacencyList: AdjacencyNode[], index = 0) {
    const point = adjacencyList[index];
    // If coords was already marked, leave it
    if (!point.marked) {
      // Put the coords on the SVG and mark as seen
      point.marked = true;
      // This is the source coords, which adjacent points will be traversed
      const command = create(CreatePointCommand, {coords: point.location, path: this.activePath}) as CreatePointCommand;
      const currentPoint = this.commandManager.do(command);
      /*const currentPoint = GLOBALS.commandManager.do(new CreatePointCommand({
        coords: point.location,
        path: GLOBALS.activePath
      }));*/
      // Go through all adjacent points and draw them
      point.points.forEach(i => {
        this.drawGraph(adjacencyList, i);
        // Set selection to the source coords to draw edges properly. In other case they
        // will form a single broken line
        this.selection.set(currentPoint);
      });
    }
  }

  public showPoints(normals: NormalData[]): AdjacencyNode[] {
    //TODO: Try to keep track of the previous point instead of keeping in memory whole list of points
    const newPoints = [];
    let prevIntersectionPoint;
    // Go through all door normals on the map
    const linesContainer = Array.from(this.linesContainer.children);
    const handDrawnPath = this.activePath;
    this.activePath = Scene.createPath();
    Scene.pathsContainer.appendChild(this.activePath);
    normals.forEach(({linePoints, x, y, id}) => {
      let intersection;
      // Set a point at the center of the door
      const center = this.commandManager.do(new CreatePointCommand(this.selection, {
        coords: {x, y},
        connectCurrent: false,
        path: this.activePath
      }));
      center.id = id;
      newPoints.push(center);
      let currentDistance;
      // For each normal go through all path segments
      linesContainer.forEach(line => {
        // Get the intersection point of the normal and current path segment
        const point = getIntersectionPoint(
          linePoints[0],
          linePoints[1],
          {x: +line.getAttribute('x1'), y: +line.getAttribute('y1')},
          {x: +line.getAttribute('x2'), y: +line.getAttribute('y2')}
        );
        // If intersection point exists
        if (point) {
          // Check the distance from it to the center of the door.
          // We should only remember the closest point
          const distance = Vector.distance({x, y}, point);
          // If there is no closest point yet
          // or distance for new point is less the that for previous point
          if (!currentDistance || currentDistance > distance) {
            currentDistance = distance;
            // Set this point as the closest intersection point
            intersection = point;
          }
        }
      });
      // If the intersection point found
      if (intersection) {
        // Try to connect it with the center of the door
        const point = this.commandManager.do(new CreatePointCommand(this.selection, {
          coords: intersection,
          connectCurrent: true,
          path: this.activePath
        }));
        if (prevIntersectionPoint) {
          this.commandManager.do(new ConnectPointsCommand({
            from: prevIntersectionPoint,
            to: point,
            path: this.activePath
          }));
        }
        newPoints.push(point);
        prevIntersectionPoint = point;
      }
    });
    handDrawnPath.style.visibility = 'hidden';
    // TODO: Try drawing this list
    return this.getAdjacencyList(newPoints);
  }

  public showCalculatedPath() {
    const polylines = Array.from(Scene.mapContainer.querySelectorAll('polyline'));
    let points = polylines.map(getDoorCoords);
    const firstPointPosition = points[0];
    // Sort points by distance to the start of the path (ascending)
    const sortable = points.slice(1).sort((a, b) => {
      const distanceA = Vector.distance(firstPointPosition, a);
      const distanceB = Vector.distance(firstPointPosition, b);
      return distanceA - distanceB;
    });
    points = [points[0], ...sortable];
    let normals = calculateNormals(points);
    const list = this.showPoints(normals);
    console.log(list);
  }

}
