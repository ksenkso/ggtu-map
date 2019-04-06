import {AxiosInstance} from 'axios';
import ApiClient from '../../core/ApiClient';
import IPathItem from '../../interfaces/IPathItem';
import {IBuilding} from './BuildingsEndpoint';
import {ILocation} from './LocationsEndpoint';
import {IPlace} from './PlacesEndpoint';

export interface ISearchResult {
    building?: IBuilding;
    location?: ILocation;
    place?: IPlace;
}
export interface ISearchEndpoint {
    query(input: string): Promise<ISearchResult[]>;
    findPath(from: string, to: string): Promise<IPathItem[]>;
}

export default class SearchEndpoint implements ISearchEndpoint {
    protected route: string = '/search';
    constructor(protected api: AxiosInstance) {}
    public async query(input: string): Promise<ISearchResult[]> {
        const response = await this.api.get<ISearchResult[]>(
            ApiClient.apiBase + this.route,
            {params: {q: input}},
        );
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async findPath(from: string, to: string): Promise<IPathItem[]> {
        const response = await this.api.get<IPathItem[]>(
            ApiClient.apiBase + this.route + '/path',
            {params: {from, to}},
        );
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }
}
