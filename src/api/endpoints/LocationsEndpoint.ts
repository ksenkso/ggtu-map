import {AxiosInstance} from 'axios';
import {BaseEndpoint, IEndpoint, IGetParams, ILocationObjectsCollection} from '../common';
import {IPlace} from './PlacesEndpoint';

export interface ILocationsEndpoint extends IEndpoint<ILocation> {
  getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[]>;
  getRoot(): Promise<ILocation>;
  getObjects(locationId: number): Promise<ILocationObjectsCollection>;
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

}
