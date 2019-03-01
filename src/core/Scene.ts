import svgPanZoom = require('svg-pan-zoom');
import {MapObject, ObjectType} from '../api/common';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import Graph from '../drawing/Graph';
import Graphics from '../drawing/Graphics';
import GraphPoint from '../drawing/GraphPoint';
import Point from '../drawing/Point';
import Primitive from '../drawing/Primitive';
import IGraph from '../interfaces/IGraph';
import IScene from '../interfaces/IScene';
import {ICoords} from '../utils';
import {getMapElementAtCoords} from '../utils/dom';
import DragManager from '../utils/DragManager';
import EventEmitter from '../utils/EventEmitter';
import ApiClient from './ApiClient';
import ObjectManager from './ObjectManager';
import Selection from './Selection';

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
        text.classList.add('primitive_label');

        text.textContent = name;
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');

        let x, y;
        if (el instanceof SVGGraphicsElement) {
            // get the box before text element is appended,
            // otherwise it will extend the box to the top-left corner of the SVG
            const rect = el.getBBox();
            el.appendChild(text);
            x = rect.x + rect.width / 2;
            y = rect.y + rect.height / 2;
        } else {
            x = el.x;
            y = el.y;
        }
        text.setAttribute('x', String(x));
        text.setAttribute('y', String(y));
    }

    public readonly apiClient: ApiClient;
    public readonly selection: Selection;
    public readonly objectManager: ObjectManager;
    public readonly dragManager: DragManager;

    public drawingContainer: SVGGElement;
    public mapContainer: SVGGElement;
    public labelsContainer: SVGGElement;
    public root: SVGSVGElement;
    public container: HTMLElement;
    public panZoom: SvgPanZoom.Instance;

    private _location: ILocation;
    private _shouldHandleMapClick: boolean;
    private svg: SVGSVGElement;
    private _graphicsCollection: Graphics[] = [];

    constructor(
        container: HTMLElement,
    ) {
        super();

        this.container = container;
        this.root = Primitive.createElement('svg', false) as SVGSVGElement;
        this.root.classList.add('map__root');
        this.container.appendChild(this.root);
        // Add tabindex to make container focusable
        let tabIndex = 0;
        document.querySelectorAll('[tabindex]')
            .forEach((el) => {
                const newTabIndex = +el.getAttribute('tabindex');
                if (tabIndex < newTabIndex) {
                    tabIndex = newTabIndex;
                }
            });
        this.root.setAttribute('tabindex', String(tabIndex));
        // Create containers
        this.mapContainer = Graphics.createElement('g', false) as SVGGElement;
        this.mapContainer.classList.add('scene__map');
        this.root.appendChild(this.mapContainer);
        this.drawingContainer = Graphics.createElement('g', false) as SVGGElement;
        this.drawingContainer.classList.add('scene__drawing');
        this.root.appendChild(this.drawingContainer);
        this.labelsContainer = Graphics.createElement('g', false) as SVGGElement;
        this.labelsContainer.classList.add('map__labels');
        this.root.appendChild(this.labelsContainer);
        // Set up singletons
        this.apiClient = ApiClient.getInstance();
        this.selection = new Selection();
        this.objectManager = new ObjectManager(this.apiClient);
        this.dragManager = new DragManager(this);
        // Set up event listeners
        // focus on mouseenter and blur on mouseleave to handle keyboard events
        this.container.addEventListener('mouseenter', () => {
            this.root.focus();
        });
        this.container.addEventListener('mouseleave', () => {
            this.root.blur();
        });
        this.container.addEventListener('click', this.onMapClick.bind(this));
        this.container.addEventListener('keyup', this.onKeyUp.bind(this));
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    public getLocation(): ILocation {
        return this._location;
    }

    public setLocation(value: ILocation, force = false): Promise<void> {
        if (force || (!this._location || this._location.id !== value.id)) {
            this._location = value;
            if (value.map) {
                return this.apiClient
                    .getTransport()
                    .get(ApiClient.mapsBase + '/' + value.map)
                    .then((response) => {
                        if (response.status === 200) {
                            this.setMapFromString(response.data as string);
                            return this.objectManager.updateLocation(value.id);
                        }
                    })
                    .then(() => {
                        const objects: any[] = (this.objectManager.places as any[])
                            .concat(this.objectManager.buildings);
                        for (const object of objects) {
                            const selector = '#' + CSS.escape(object.container);
                            const el = this.mapContainer.querySelector(selector) as SVGGraphicsElement;
                            if (el) {
                                Scene.setLabel(el, object.name);
                            }
                        }
                        if (this.panZoom) {
                            this.panZoom.reset();
                            this.panZoom.destroy();
                        }
                        this.panZoom = svgPanZoom(this.root, {
                            onPan: () => this._shouldHandleMapClick = false,
                            beforeZoom: (oldZoom: number, newZoom: number) => {
                                this._resizeDrawings(oldZoom, newZoom);
                                return true;
                            },
                        });
                        this.emit('mapChanged');
                    })
                    .catch((error) => {
                        //  TODO: create an error handling system
                        console.error(error);
                    });
            } else {
                throw new Error('Map is not available');
            }
        }
    }

    public setMapFromString(map: string) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(map, 'image/svg+xml');
        const root = dom.firstElementChild;
        this.updateMap(root as SVGSVGElement);
    }

    public getMouseEventInfo(event: MouseEvent): IMapMouseEvent {
        const payload: IMapMouseEvent = {
            mapCoords: this.getMouseCoords(event),
            originalEvent: event,
        };
        // Find an object in the event path:
        const mapElement = getMapElementAtCoords(this.mapContainer, payload.mapCoords.x, payload.mapCoords.y);
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
        return payload;
    }

    public getMouseCoords(e: MouseEvent): ICoords {
        let p = this.root.createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        p = p.matrixTransform((this.mapContainer.parentNode as SVGGElement).getScreenCTM().inverse());
        return {x: p.x, y: p.y};
    }

    public getViewBox(): number[] {
        return this.root.getAttribute('viewBox').split(' ').map((v) => +v);
    }

    public setViewBox(viewBox: number[]): void {
        this.root.setAttribute('viewBox', viewBox.join(' '));
    }

    public async refresh(): Promise<void> {
        const updated = await this.apiClient.locations.get(this._location.id);
        this.setLocation(updated, true);
    }

    public addGraphics(graphics: Graphics): void {
        this._graphicsCollection.push(graphics);
        const callback = () => {
            this._graphicsCollection.splice(this._graphicsCollection.indexOf(graphics));
            graphics.off('destroy', callback);
        };
        graphics.on('destroy', callback);
    }

    public getZoom(): number {
        return this.panZoom.getZoom();
    }

    public setZoom(f: number): void {
        this.panZoom.zoom(f);
    }

    /**
     * This flag will be set to false when map is panned to prevent firing click event
     */
    private onMouseDown() {
        this._shouldHandleMapClick = true;
    }

    private onMapClick(event: MouseEvent): void {
        /**
         * To prevent map clicks after the map is panned, check for this flag
         */
        if (this._shouldHandleMapClick) {
            const payload = this.getMouseEventInfo(event);
            this.emit('click', payload);
        }
    }

    private updateMap(map: SVGSVGElement): void {
        if (this.svg) {
            this.svg.remove();
        }
        const viewBox = map.getAttribute('viewBox');
        if (viewBox) {
            this.root.setAttribute('viewBox', viewBox);
        }
        this.svg = map;
        this.mapContainer.innerHTML = map.innerHTML;
    }

    private onKeyUp(e) {
        switch (e.code) {
            case 'Delete': {
                this._deleteCurrentSelection();
                break;
            }
            case 'KeyI': {
                this._tryInsertPoint();
                break;
            }
            case 'KeyU': {
                this._tryConnectPoints();
            }
        }
        this.emit('keyup', e);
    }

    private _resizeDrawings(oldZoom: number, newZoom: number) {
        const ratio = newZoom / oldZoom;
        if (newZoom > 2) {
            this.root.style.setProperty('--label-base-font-size', '3px');
        } else {
            this.root.style.setProperty('--label-base-font-size', '2.5px');
        }
        const invertedZoom = 1 / newZoom;
        this.root.style.setProperty('--scale', String(invertedZoom));
        this._graphicsCollection.forEach((graphics) => {
            if (graphics instanceof Graph) {
                graphics.vertices.forEach((vertex) => {
                    vertex.setRadius(vertex.getRadius() / ratio);
                });
            } else if (graphics instanceof Point) {
                graphics.setRadius(graphics.getRadius() / ratio);
            }
        });
    }

    private _deleteCurrentSelection() {
        if (this.selection.elements.length) {
            this.selection.elements.forEach((el) => {
                this.selection.remove(el);
                el.destroy();
            });
        }
    }

    private _getCurrentGraph(): IGraph | undefined {
        if (this.selection.elements.length === 2) {
            if (this.selection.last instanceof GraphPoint) {
                return this.selection.last.graph;
            }
        }
    }

    private _tryInsertPoint() {
        const graph = this._getCurrentGraph();
        if (graph) {
            graph.insertBetween(
                this.selection.elements[0] as GraphPoint,
                this.selection.elements[1] as GraphPoint,
            );
        }
    }

    private _tryConnectPoints() {
        const graph = this._getCurrentGraph();
        if (graph) {
            graph.connectPoints(
                this.selection.elements[0] as GraphPoint,
                this.selection.elements[1] as GraphPoint,
            );
        }
    }
}
