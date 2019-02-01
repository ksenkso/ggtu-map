import {AxiosRequestConfig} from "axios";
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

  getAll(conditions?: GGTURequestConditions, options?: IGetParams): Promise<T[] | null>

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
}
