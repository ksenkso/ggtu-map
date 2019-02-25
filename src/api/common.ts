import {AxiosInstance, AxiosRequestConfig} from 'axios';
import {IBuilding} from './endpoints/BuildingsEndpoint';
import {IPlace} from './endpoints/PlacesEndpoint';
import {ITransition} from './endpoints/TransitionsEndpoint';
import {ITransitionView} from './endpoints/TransitionViewsEndpoint';

export interface IWhereCondition {
    [key: string]: number | string;
}

export type IPartial<T> = {
    [P in keyof T]?: T[P];
};

export interface IAuthState {
    ok: boolean;
    error?: Error;
}

export interface IGetParams {
    where?: IWhereCondition;
    with?: string;
    from?: number;
    limit?: number;
    expanded?: boolean;
}

export interface IEndpoint<T> {
    get(id: number, params?: IGetParams): Promise<T | null>;

    getAll(options?: IGetParams): Promise<T[] | null>;

    create(data: T): Promise<T>;

    update(id: number, fields: IPartial<T>): Promise<T>;

    delete(id: number): Promise<boolean>;
}

export interface ILocationObjectsCollection {
    places?: IPlace[];
    buildings?: IBuilding[];
    transitionViews?: ITransitionView[];
}

export type PlaceType = 'cabinet' | 'wc' | 'gym' | 'other';

export interface IDictionary<T = any> {
    [key: string]: T;
}

export interface IUser {
    id: number;
    login: string;
    createdAt: string;
    updatedAt: string;
    token?: string;
}

export type BuildingType = 'study' | 'other';
export type ObjectType = 'place' | 'building' | 'transition' | 'transition-view';
export type MapObject =
    (IPlace | IBuilding | ITransition | ITransitionView)
    & { MapObject: { id: number, PlaceId: number | null, TransitionViewId: number | null } };

export class BaseEndpoint {
    public static parseParams(getParams: IGetParams): AxiosRequestConfig {

        const params: any = {};
        if (getParams) {
            if (getParams.with) {
                params.with = getParams.with;
            }
            if (getParams.where) {

                Object.keys(getParams.where)
                    .forEach((key) => {
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

    protected route: string;

    constructor(protected api: AxiosInstance) {
    }

    public async create<T = any>(model: T): Promise<T> {
        const response = await this.api.post<T>(this.route, model);
        if (response.status === 201) {
            return response.data;
        } else {
            return null;
        }
    }

    public async delete(id: number): Promise<boolean> {
        const response = await this.api.delete(this.route + id);
        return response.status === 200;
    }

    public async get<T = any>(id: number, params?: IGetParams): Promise<T | null> {
        const response = await this.api.get<T>(this.route + id, {params});
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async getAll<T = any>(params?: IGetParams): Promise<T[] | null> {
        const response = await this.api.get<T[]>(this.route, {params});
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }

    public async update<T = any>(id: number, fields: IPartial<T>): Promise<T | null> {
        const response = await this.api.patch<T>(this.route + id, fields);
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    }
}
