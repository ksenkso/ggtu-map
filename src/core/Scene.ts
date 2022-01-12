import * as svgPanZoom from 'svg-pan-zoom';
import {MapObject, ObjectType} from '../api/common';
import {IBuilding} from '../api/endpoints/BuildingsEndpoint';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import {IPlace} from '../api/endpoints/PlacesEndpoint';
import {ITransitionView} from '../api/endpoints/TransitionViewsEndpoint';
import Label from '../components/Label';
import Loader from '../components/Loader';
import PlaceLabel from '../components/PlaceLabel';
import Graph from '../drawing/Graph';
import Graphics from '../drawing/Graphics';
import GraphPoint from '../drawing/GraphPoint';
import Point from '../drawing/Point';
import Primitive from '../drawing/Primitive';
import IGraph from '../interfaces/IGraph';
import IScene from '../interfaces/IScene';
import {ICoords} from '../utils';
import {getMapElementAtCoords} from '../utils';
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
    public static getElementCoords(el: SVGGElement): ICoords {
        const box = el.getBBox();
        return {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
        };
    }

    public static setLabelFor(object: MapObject, el: SVGGElement) {
        let label;
        if ((object as any).type) {
            label = new PlaceLabel(object as IPlace);
        } else {
            label = new Label((object as IBuilding).name);
        }
        Scene.setLabel(label, el);
    }

    /**
     * Sets a label for an object on the map
     * @param label
     * @param el
     */
    public static setLabel(label: Label, el: SVGGElement) {
        const coords = Scene.getElementCoords(el);
        label.setPosition(coords);
        el.appendChild(label.element);
    }

    public readonly apiClient: ApiClient;
    public readonly selection: Selection;
    public readonly objectManager: ObjectManager;
    public readonly dragManager: DragManager;

    public viewport: SVGGElement;
    public drawingContainer: SVGGElement;
    public mapContainer: SVGGElement;
    public labelsContainer: SVGGElement;
    public root: SVGSVGElement;
    public loader: Loader = new Loader();
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
        // Add tabindex to make element focusable
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
        this.viewport = GraphPoint.createElement('g', false) as SVGGElement;
        this.viewport.classList.add('svg-pan-zoom_viewport');
        this.root.appendChild(this.viewport);
        this.mapContainer = Graphics.createElement('g', false) as SVGGElement;
        this.mapContainer.classList.add('scene__map');
        this.viewport.appendChild(this.mapContainer);
        this.drawingContainer = Graphics.createElement('g', false) as SVGGElement;
        this.drawingContainer.classList.add('scene__drawing');
        this.viewport.appendChild(this.drawingContainer);
        this.labelsContainer = Graphics.createElement('g', false) as SVGGElement;
        this.labelsContainer.classList.add('map__labels');
        this.viewport.appendChild(this.labelsContainer);

        this.container.appendChild(this.loader.element);
        // this.searchbox = new SearchBox(this);
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

    public setLocationById(locationId: number, force = false): Promise<void> {
        return this.apiClient.locations.get(locationId)
            .then((location) => this.setLocation(location, force));
    }

    public getLocation(): ILocation {
        return this._location;
    }

    public setLocation(value: ILocation, force = false): Promise<void> {
        if (force || (!this._location || this._location.id !== value.id)) {
            // Start transition
            this.loader.show();
            this._location = value;
            if (value.map) {
                return this.apiClient
                    .locations
                    .getMap(value.map)
                    .then((svg) => {
                        if (this.panZoom) {
                            this.panZoom.reset();
                            this.panZoom.destroy();
                        }
                        this.updateMap(svg);
                        const panZoomOptions: any = {
                            zoomEnabled: true,
                            onPan: () => {
                                this._shouldHandleMapClick = false;
                            },
                            beforeZoom: (oldZoom: number, newZoom: number) => {
                                this._resizeDrawings(oldZoom, newZoom);
                                return true;
                            },
                        };
                        if ('ontouchstart' in document.documentElement) {
                            let isScaling = false, isPanning = false, pan, currentPoint, instance, distance = 1;

                            function onPanStart(event: TouchEvent) {
                                if (event.touches.length === 1) {
                                    isPanning = true;
                                    isScaling = false;
                                    pan = instance.getPan();
                                    currentPoint = {
                                        x: event.touches[0].clientX,
                                        y: event.touches[0].clientY,
                                    };
                                } else if (event.touches.length === 2) {
                                    isPanning = false;
                                    isScaling = true;
                                    distance = Math.hypot(
                                        event.touches[0].clientX - event.touches[1].clientX,
                                        event.touches[0].clientY - event.touches[1].clientY,
                                    );
                                }
                            }

                            function onPanMove(event: TouchEvent) {
                                if (isPanning) {
                                    instance.panBy({
                                        x: event.touches[0].clientX - currentPoint.x,
                                        y: event.touches[0].clientY - currentPoint.y,
                                    });
                                    currentPoint.x = event.touches[0].clientX;
                                    currentPoint.y = event.touches[0].clientY;
                                } else if (isScaling) {
                                    // pinch-zoom
                                    const zoomPoint = {
                                        x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
                                        y: (event.touches[0].clientY + event.touches[1].clientY) / 2,
                                    };
                                    const newDistance = Math.hypot(
                                        event.touches[0].clientX - event.touches[1].clientX,
                                        event.touches[0].clientY - event.touches[1].clientY);
                                    const k = newDistance / distance;
                                    instance.zoomAtPointBy(k, zoomPoint);
                                    distance = newDistance;
                                }
                            }

                            function onTouchEnd(e) {
                                if (e.touches.length === 2) {
                                    isScaling = true;
                                    isPanning = false;
                                } else if (e.touches.length === 1) {
                                    isScaling = false;
                                    isPanning = true;
                                } else {
                                    isScaling = false;
                                    isPanning = false;
                                }
                            }

                            panZoomOptions.customEventsHandler = {
                                haltEventListeners: [
                                    'touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel',
                                ],
                                init(options) {
                                    instance = options.instance;
                                    this.element = options.svgElement;
                                    this.element.addEventListener('touchstart', onPanStart);
                                    this.element.addEventListener('touchmove', onPanMove);
                                    this.element.addEventListener('touchend', onTouchEnd);
                                },
                                destroy() {
                                    this.element.removeEventListener('touchstart', onPanStart);
                                    this.element.removeEventListener('touchmove', onPanMove);
                                    this.element.removeEventListener('touchend', onTouchEnd);
                                },
                            };
                        }
                        this.panZoom = svgPanZoom(this.root, panZoomOptions);
                        this.panZoom.resize();
                        this.panZoom.contain();
                        this.panZoom.center();
                        this.loader.hide();
                        return this.objectManager.updateLocation(value.id);
                    })
                    .then(() => {
                        this.objectManager.places
                            .forEach((place) => {
                                this.renderPlace(place);
                            });
                        this.objectManager.buildings
                            .forEach((building) => {
                                this.renderBuilding(building);
                            });
                        // End transition
                        this.emit('mapChanged');
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                throw new Error('Map is not available');
            }
        }
    }

    public findObjectOnMap(object: IPlace | IBuilding | ITransitionView): SVGGElement {
        const selector = '#' + object.container;
        return this.mapContainer.querySelector(selector) as SVGGElement;
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

    public centerOnObject(o: IPlace | IBuilding | ITransitionView, animate: boolean = false): Promise<void> {
        const el = this.findObjectOnMap(o);
        if (el) {
            return this.centerOnElement(el, animate);
        }
        return Promise.reject();
    }

    public centerOnElement(el: SVGGElement, animate: boolean = false): Promise<void> {
        const coords = Scene.getElementCoords(el);
        return this.setCenter(coords, animate);
    }

    /**
     * @return ICoords coords on the map
     */
    public getCenter(): ICoords {
        const pan = this.panZoom.getPan();
        const sizes = this.panZoom.getSizes() as any;
        return {
            x: (sizes.viewBox.width + sizes.viewBox.x - pan.x / sizes.realZoom) / 2,
            y: (sizes.viewBox.height + sizes.viewBox.y - pan.y / sizes.realZoom) / 2,
        };
    }

    public setCenter(coords: ICoords, animate: boolean = false): Promise<void> {
        return new Promise((resolve) => {
            const pan = this.panZoom.getPan();
            const sizes = this.panZoom.getSizes() as any;
            const to = {
                x: (sizes.width - (sizes.viewBox.width + 2 * sizes.viewBox.x) * sizes.realZoom) / 2
                    + (sizes.viewBox.width / 2 - coords.x) * sizes.realZoom,
                y: (sizes.height - (sizes.viewBox.height + 2 * sizes.viewBox.y) * sizes.realZoom) / 2
                    + (sizes.viewBox.height / 2 - coords.y) * sizes.realZoom,
            };
            if (animate) {
                let x = 0, current = 0;
                const fps = 60,
                    time = 1000;
                const xDiff = fps / time
                    , yDiff = {x: to.x - pan.x, y: to.y - pan.y};
                const animation = setInterval(() => {
                    current = -( Math.cos( Math.PI * x ) - 1 ) / 2;
                    this.panZoom.pan({x: pan.x + yDiff.x * current, y: pan.y + yDiff.y * current});
                    x = Math.min(x + xDiff, 1);
                    if (x === 1) {
                        this.panZoom.pan(to);
                        clearInterval(animation);
                        resolve();
                    }
                }, time / fps);
            } else {
                this.panZoom.pan(to);
            }
        });
    }

    public setViewBox(viewBox: number[]): void {
        this.root.setAttribute('viewBox', viewBox.join(' '));
    }

    public async refresh(): Promise<void> {
        const updated = await this.apiClient.locations.get(this._location.id);
        return this.setLocation(updated, true);
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
        this.panZoom.zoomAtPoint(f, this.getCenter());
    }

    public showPanel(name: string): void {
        throw new Error('Not implemented');
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
            this.root.style.setProperty('--place-label-base-fz', '2.7px');
            this.root.classList.remove('map__root_no-place-labels');
        } else {
            // Hide labels for places
            if (newZoom < .75) {
                // this.root.classList.add('map__root_no-place-labels');
                this.root.style.setProperty('--place-label-base-fz', '1.6px');
            } else {
                this.root.classList.remove('map__root_no-place-labels');
                this.root.classList.remove('map__root_no-building-labels');
                this.root.style.setProperty('--place-label-base-fz', '1.9px');
            }
            // Hide labels for buildings
            if (newZoom < .35) {
                this.root.classList.add('map__root_no-building-labels');
            } else {
                this.root.classList.remove('map__root_no-building-labels');
            }
            if (newZoom > 1.7) {
                this.root.style.setProperty('--place-label-base-fz', '2.2px');
            }
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

    private renderPlace(place: IPlace) {
        if (place.container) {
            const el = this.findObjectOnMap(place);
            const label = new PlaceLabel(place);
            label.appendTo(this);
            Scene.setLabel(label, el);
        }

    }

    private renderBuilding(building: IBuilding) {
        if (building.container) {
            const el = this.findObjectOnMap(building);
            const label = new Label(building.name);
            label.appendTo(this);
            Scene.setLabel(label, el);
        }
    }
}
