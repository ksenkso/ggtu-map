import {
  DeleteState,
  IEndpoint,
  GGTURequestConditions,
  GGTURequestOptions, IBuilding, IGetParams,
  ILocation,
  IPartial,
  IPlace, BaseEndpoint
} from "../common";
import {AxiosInstance} from "axios";

export interface ILocationsEndpoint extends IEndpoint<ILocation> {
  uploadMap(map: File): Promise<ILocation>;
  getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[]>
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

  async delete(id: number): Promise<DeleteState | null> {
    const response = await this.api.delete(this.route + id);
    if (response.status === 200) {
      return response.data as DeleteState;
    } else {
      return null;
    }
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

}
