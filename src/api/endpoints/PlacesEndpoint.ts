import {
  DeleteState,
  IEndpoint,
  GGTURequestConditions,
  IPartial,
  IPlace, IGetParams, BaseEndpoint,
} from '../common';
import {AxiosInstance} from "axios";

export interface IPlacesEndpoint extends IEndpoint<IPlace> {
}
export default class PlacesEndpoint extends BaseEndpoint implements IPlacesEndpoint {
  protected route: string = 'places/';

  constructor(private api: AxiosInstance) {
    super();
  }

  async create(data: IPlace): Promise<IPlace|null> {
    const response = await this.api.post<IPlace>(this.route, data);
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

  async get(id: number, params?: IGetParams): Promise<IPlace | null> {
    let path = this.route + id;
    if (params.expanded) {
      path += '/expanded';
    }
    const response = await this.api.get<IPlace>(path);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
//TODO: implement `where`
  async getAll(conditions?: GGTURequestConditions, params?: IGetParams): Promise<IPlace[]| null> {
    // const config = PlacesEndpoint.parseParams(params);
    let path = this.route;
    if (params.expanded) {
      path += '/expanded';
    }
    const response = await this.api.get<IPlace[]>(path, {params});
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async update(id: number, fields: IPartial<IPlace>): Promise<IPlace | null> {
    const response = await this.api.patch<IPlace>(this.route + id, fields);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}
