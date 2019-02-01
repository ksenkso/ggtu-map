import {
  IEndpoint,
  GGTURequestConditions,
  IGetParams,
  ILocation,
  IPartial,
  IPlace, BaseEndpoint
} from "../common";
import {AxiosInstance} from "axios";

export interface ILocationsEndpoint extends IEndpoint<ILocation> {
  uploadMap(map: File): Promise<ILocation>;
  getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[]>;
  getRoot(): Promise<ILocation>;
}
export default class LocationsEndpoint extends BaseEndpoint implements ILocationsEndpoint {
  protected route: string = 'locations/';
  constructor(private api: AxiosInstance) {
    super();
  }

  async create(data: ILocation): Promise<ILocation|null> {
    const response = await this.api.post<ILocation>(this.route, data);
    if (response.status === 201) {
      return response.data;
    } else {
      return null;
    }
  }

  async delete(id: number): Promise<Boolean | null> {
    const response = await this.api.delete(this.route + id);
    return response.status === 200;
  }

  async get(id: number, params?: IGetParams): Promise<ILocation | null> {
    const config = LocationsEndpoint.parseParams(params);
    const response = await this.api.get<ILocation>(this.route + id, config);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
  //TODO: implement `where`
  async getAll(conditions?: GGTURequestConditions, params?: IGetParams): Promise<ILocation[]| null> {
    const config = LocationsEndpoint.parseParams(params);
    const response = await this.api.get<ILocation[]>(this.route, config);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[] | null> {
    // const config = LocationsEndpoint.parseParams(params);
    // console.log(config);
    const response = await this.api.get<IPlace[]>(this.route + locationId + '/places', {params});
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async update(id: number, fields: IPartial<ILocation>): Promise<ILocation | null> {
    const response = await this.api.patch<ILocation>(this.route + id, fields);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  uploadMap(map: File): Promise<ILocation | null> {
  //  TODO: implement map upload
    return undefined;
  }

  async getRoot(): Promise<ILocation> {
    const response = await this.api.get<ILocation>(this.route + 'root');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

}
