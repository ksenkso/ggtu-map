import {AxiosInstance} from 'axios';
import {IDiff} from '../../interfaces';
import IAdjacencyNode from '../../interfaces/IAdjacencyNode';
import {BaseEndpoint, IEndpoint, IGetParams, ILocationObjectsCollection} from '../common';
import {IPlace} from './PlacesEndpoint';

export interface ILocationsEndpoint extends IEndpoint<ILocation> {
    getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[]>;

    getRoot(): Promise<ILocation>;

    getObjects(locationId: number): Promise<ILocationObjectsCollection>;

    getPathGraph(locationId: number): Promise<IAdjacencyNode[]>;

    getMap(name: string): Promise<SVGSVGElement>;

    uploadMap(locationId: number, file: File): Promise<void>;

    updatePaths(locationId: number, diff: IDiff): Promise<any>;
}

export interface ILocation {
    id?: number;
    name: string;
    BuildingId: number;
    map?: string;
}

export default class LocationsEndpoint extends BaseEndpoint implements ILocationsEndpoint {
    protected route: string = 'locations/';

    constructor(api: AxiosInstance) {
        super(api);
    }

    public async getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[] | null> {
        const response = await this.api.get<IPlace[]>(this.route + locationId + '/places', {params});
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async getRoot(): Promise<ILocation> {
        const response = await this.api.get<ILocation>(this.route + 'root');
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async getObjects(locationId: number): Promise<ILocationObjectsCollection> {
        const response = await this.api.get<ILocationObjectsCollection>(this.route + locationId + '/objects');
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async getPathGraph(locationId: number): Promise<IAdjacencyNode[]> {
        const response = await this.api.get<IAdjacencyNode[]>(this.route + locationId + '/paths');
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async getMap(name: string): Promise<SVGSVGElement> {
        const response = await this.api.get<string>('/maps/' + name);
        if (response.status === 200) {
            const parser = new DOMParser();
            const dom = parser.parseFromString(response.data as string, 'image/svg+xml');
            return dom.firstElementChild as SVGSVGElement;
        } else {
            return null;
        }
    }

    public async uploadMap(locationId: number, file: File): Promise<void> {
        const fd = new FormData();
        fd.append('map', file);

        const response = await this.api.patch<void>(this.route + locationId + '/upload', fd);
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async updatePaths(locationId: number, diff: IDiff): Promise<any> {
        const response = await this.api.put(this.route + locationId + '/paths');
        if (response.status === 200) {
            return response.data;
        }

        return null;
    }
}
