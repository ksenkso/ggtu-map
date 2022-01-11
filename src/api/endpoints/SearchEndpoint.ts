import {AxiosInstance} from 'axios';
import IPathItem from '../../interfaces/IPathItem';
import {IBuilding} from './BuildingsEndpoint';
import {ILocation} from './LocationsEndpoint';
import {IPlace} from './PlacesEndpoint';
export interface IPathInfo {
    distance: number;
    time: number;
    vertices: IPathItem[];
}
export interface ISearchResult {
    building?: IBuilding;
    location?: ILocation;
    place?: IPlace;
}
export interface ISearchEndpoint {
    query(input: string): Promise<ISearchResult[]>;
    findPath(from: string, to: string): Promise<IPathInfo>;
}

export default class SearchEndpoint implements ISearchEndpoint {
    protected route: string = '/search';
    constructor(protected api: AxiosInstance) {}
    public async query(input: string): Promise<ISearchResult[]> {
        const response = await this.api.get<ISearchResult[]>(
            this.route,
            {params: {q: input}},
        );
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async findPath(from: string, to: string): Promise<IPathInfo> {
        const response = await this.api.get<IPathInfo>(
            this.route + '/path',
            {params: {from, to}},
        );
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }
}
