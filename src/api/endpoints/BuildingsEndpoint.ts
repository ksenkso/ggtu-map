import {BaseEndpoint, BuildingType, IEndpoint, IGetParams, WhereCondition,} from '../common';
import {AxiosInstance} from "axios";
import {ITransition} from "./TransitionsEndpoint";
import {ILocation} from "./LocationsEndpoint";

export interface IBuildingsEndpoint extends IEndpoint<IBuilding> {
  getLocations(id: number, where?: WhereCondition): Promise<ILocation[] | null>;
  getTransitions(locationId: number, params?: IGetParams): Promise<ITransition[]>
}

export interface IBuilding {
  id?: number;
  name: string;
  type: BuildingType;
  container: string
}

export default class BuildingsEndpoint extends BaseEndpoint implements IBuildingsEndpoint {
  protected route: string = 'buildings/';

  constructor(api: AxiosInstance) {
    super(api);
  }

  async getLocations(id: number, where?: WhereCondition): Promise<ILocation[] | null> {
    const response = await this.api.get<ILocation[]>(this.route + id + '/locations');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getTransitions(locationId: number, params?: IGetParams): Promise<ITransition[]> {
    const response = await this.api.get(this.route + locationId + '/transitions');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}
