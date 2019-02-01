import {
  IEndpoint,
  GGTURequestConditions,
  IBuilding,
  ILocation,
  IPartial,
  WhereCondition, BaseEndpoint, IGetParams,
} from '../common';
import {AxiosInstance} from "axios";

export interface IBuildingsEndpoint extends IEndpoint<IBuilding> {
  getLocations(id: number, where?: WhereCondition): Promise<ILocation[] | null>;
}

export default class BuildingsEndpoint extends BaseEndpoint implements IBuildingsEndpoint {
  protected route: string = 'buildings/';

  constructor(private api: AxiosInstance) {
    super();
  }

  async create(data: IBuilding): Promise<IBuilding|null> {
    const response = await this.api.post<IBuilding>(this.route, data);
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

  async get(id: number, params?: IGetParams): Promise<IBuilding | null> {
    // const config = BuildingsEndpoint.parseParams(params);
    const response = await this.api.get<IBuilding>(this.route + id);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
//TODO: implement `where`
  async getAll(conditions?: GGTURequestConditions, params?: IGetParams): Promise<IBuilding[]| null> {
    const config = BuildingsEndpoint.parseParams(params);
    const response = await this.api.get<IBuilding[]>(this.route, config);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getLocations(id: number, where?: WhereCondition): Promise<ILocation[] | null> {
    const response = await this.api.get<ILocation[]>(this.route + id + '/locations');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async update(id: number, fields: IPartial<IBuilding>): Promise<IBuilding | null> {
    const response = await this.api.patch<IBuilding>(this.route + id, fields);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}
