import {
  BaseEndpoint,
  GGTURequestConditions,
  IEndpoint,
  IGetParams,
  IPartial,
} from "../common";
import {AxiosInstance} from "axios";
export interface ITransition {
  id?: number | null;
  LocationId: number | null;
  container: string | null;
}
export default class TransitionsEndpoint extends BaseEndpoint implements IEndpoint<ITransition> {
  protected route: string = 'transitions/';
  constructor(private api: AxiosInstance) {
    super();
  }

  async create(data: ITransition): Promise<ITransition|null> {
    const response = await this.api.post<ITransition>(this.route, data);
    if (response.status === 201) {
      return response.data;
    } else {
      return null;
    }
  }

  async delete(id: number): Promise<Boolean | null> {
    const response = await this.api.delete(this.route + id);
    if (response.status === 200) {
      return response.data as Boolean;
    } else {
      return null;
    }
  }

  async get(id: number, params?: IGetParams): Promise<ITransition | null> {
    const config = TransitionsEndpoint.parseParams(params);
    const response = await this.api.get<ITransition>(this.route + id, config);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
  //TODO: implement `where`
  async getAll(conditions?: GGTURequestConditions, params?: IGetParams): Promise<ITransition[]| null> {
    const config = TransitionsEndpoint.parseParams(params);
    const response = await this.api.get<ITransition[]>(this.route, config);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async update(id: number, fields: IPartial<ITransition>): Promise<ITransition | null> {
    const response = await this.api.patch<ITransition>(this.route + id, fields);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}
