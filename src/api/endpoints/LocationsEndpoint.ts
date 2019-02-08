import {BaseEndpoint, IEndpoint, IGetParams, LocationObjectsCollection, MapObject,} from "../common";
import {AxiosInstance} from "axios";
import {IPlace} from "./PlacesEndpoint";

export interface ILocationsEndpoint extends IEndpoint<ILocation> {
  getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[]>
  getRoot(): Promise<ILocation>;
  getObjects(locationId: number): Promise<LocationObjectsCollection>
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

  async getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[] | null> {
    const response = await this.api.get<IPlace[]>(this.route + locationId + '/places', {params});
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getRoot(): Promise<ILocation> {
    const response = await this.api.get<ILocation>(this.route + 'root');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getObjects(locationId: number): Promise<LocationObjectsCollection> {
    const response = await this.api.get<LocationObjectsCollection>(this.route + locationId + '/objects');
    if (response.status === 200) {
      return response.data
    } else {
      return null;
    }
  }

}
