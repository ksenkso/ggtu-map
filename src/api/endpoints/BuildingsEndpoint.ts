import {AxiosInstance} from 'axios';
import {BaseEndpoint, BuildingType, IEndpoint, IGetParams, IWhereCondition} from '../common';
import {ILocation} from './LocationsEndpoint';
import {ITransition} from './TransitionsEndpoint';

export interface IBuildingsEndpoint extends IEndpoint<IBuilding> {
  getLocations(id: number, where?: IWhereCondition): Promise<ILocation[] | null>;
  getTransitions(locationId: number, params?: IGetParams): Promise<ITransition[]>;
}

export interface IBuilding {
  id?: number;
  name: string;
  type: BuildingType;
  container: string;
}

export default class BuildingsEndpoint extends BaseEndpoint implements IBuildingsEndpoint {
  protected route: string = 'buildings/';

  constructor(api: AxiosInstance) {
    super(api);
  }

  public async getLocations(id: number, where?: IWhereCondition): Promise<ILocation[] | null> {
    const response = await this.api.get<ILocation[]>(this.route + id + '/locations');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  public async getTransitions(locationId: number, params?: IGetParams): Promise<ITransition[]> {
    const response = await this.api.get(this.route + locationId + '/transitions');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}
