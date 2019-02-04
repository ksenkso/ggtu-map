import {BaseEndpoint, IEndpoint, IGetParams, ILocation, IPlace} from "../common";
import {AxiosInstance} from "axios";

export interface ILocationsEndpoint extends IEndpoint<ILocation> {
  getPlaces(locationId: number, params?: IGetParams): Promise<IPlace[]>
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

}
