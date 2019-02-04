import {AxiosInstance, AxiosRequestConfig} from "axios";
export interface WhereCondition {
  [key: string]: number | string
}

export type GGTURequestConditions = {
  where?: WhereCondition;
}
export type IPartial<T> = {
  [P in keyof T]?: T[P];
}

export interface GGTUDeleteResponse {
}

export interface GGTURequestOptions {
  expanded?: boolean;
  all?: boolean;
}

export interface AuthState {
  ok: boolean;
  error?: Error;
}

export interface IGetParams {
  where?: WhereCondition;
  with?: string;
  from?: number;
  limit?: number;
  expanded?: boolean;
}

export interface IEndpoint<T> {
  get(id: number, params?: IGetParams): Promise<T | null>

  getAll(options?: IGetParams): Promise<T[] | null>

  create(data: T): Promise<T>;

  update(id: number, fields: IPartial<T>): Promise<T>;

  delete(id: number): Promise<Boolean>;
}


export interface ILocation {
  id?: number;
  name: string;
  BuildingId: number;
  map?: string;
}

export type PlaceType = 'cabinet' | 'wc' | 'gym' | 'other';
export interface IDictionary<T = any> {
  [key: string]: T
}
export interface IPlace {
  id?: number;
  name: string;
  LocationId: number;
  type: PlaceType;
  container: string;
  props?: IDictionary
}

export interface IUser {
  id: number;
  login: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

export type BuildingType = 'study' | 'other';

export interface IBuilding {
  id?: number;
  name: string;
  type: BuildingType;
  container: string
}

export class BaseEndpoint {
  protected route: string;
  static parseParams(getParams: IGetParams): AxiosRequestConfig {

    const params: any = {};
    if (getParams) {
      if (getParams.with) {
        params.with = getParams.with;
      }
      if (getParams.where) {

        Object.keys(getParams.where)
          .forEach(key => {
            params[`where[${key}]`] = getParams.where[key];
          });
      }
      if (getParams.from) {
        params.from = getParams.from;
      }
      if (getParams.limit) {
        params.limit = getParams.limit;
      }
    }
    return {params};
  }

  constructor(protected api: AxiosInstance) {}

  async create<T = any>(model: T): Promise<T> {
    const response = await this.api.post<T>(this.route, model);
    if (response.status === 201) {
      return response.data;
    } else {
      return null;
    }
  }

  async delete(id: number): Promise<Boolean> {
    const response = await this.api.delete(this.route + id);
    return response.status === 200;
  }
  async get<T = any>(id: number, params?: IGetParams): Promise<T | null> {
    const response = await this.api.get<T>(this.route + id, {params});
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getAll<T = any>(params?: IGetParams): Promise<T[] | null> {
    const response = await this.api.get<T[]>(this.route, {params});
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async update<T = any>(id: number, fields: IPartial<T>): Promise<T | null> {
    const response = await this.api.patch<T>(this.route + id, fields);
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}
