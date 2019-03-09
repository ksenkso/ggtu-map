import axios, {AxiosInstance, AxiosResponse} from 'axios';
import qs = require('qs');
import {IAuthState, IEndpoint, IUser} from '..';
import BuildingsEndpoint, {IBuildingsEndpoint} from '../api/endpoints/BuildingsEndpoint';
import LocationsEndpoint, {ILocationsEndpoint} from '../api/endpoints/LocationsEndpoint';
import PlacesEndpoint, {IPlacesEndpoint} from '../api/endpoints/PlacesEndpoint';
import SearchEndpoint, {ISearchEndpoint} from '../api/endpoints/SearchEndpoint';
import TransitionsEndpoint, {ITransitionsEndpoint} from '../api/endpoints/TransitionsEndpoint';
import UserInfo from './UserInfo';

export interface ITokenInfo {
  text: string;
  iat: number;
  exp: number;
  user_id: number;
}

export default class ApiClient {

  private set token(token: string) {
    this.api.defaults.headers.Authorization = token ? `Bearer ${token}` : '';
  }

  private get token(): string {
    return this.userInfo.user.token;
    // return this.api.defaults.headers['Authorization'].substring(7);
  }
  public static base = 'http://localhost:3000';
  public static apiBase = ApiClient.base + '/v1';
  public static  mapsBase = ApiClient.base + '/maps';

  public static getInstance(user?: IUser) {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(user);
    }
    return ApiClient.instance;
  }

  private static instance: ApiClient;
  public locations: ILocationsEndpoint;
  public buildings: IBuildingsEndpoint;
  public places: IPlacesEndpoint;
  public transitions: ITransitionsEndpoint;
  public search: ISearchEndpoint;
  public readonly userInfo: UserInfo;
  private readonly api: AxiosInstance;

  private constructor(user?: IUser) {
    this.api = axios.create({
      baseURL: ApiClient.apiBase,
    });
    this.api.defaults.paramsSerializer = (params) => qs.stringify(params, {encodeValuesOnly: true});
    this.userInfo = new UserInfo(this);
    if (user) {
      this.userInfo.user = user;
    }
    this.buildings = new BuildingsEndpoint(this.api);
    this.locations = new LocationsEndpoint(this.api);
    this.places = new PlacesEndpoint(this.api);
    this.transitions = new TransitionsEndpoint(this.api);
    this.search = new SearchEndpoint(this.api);
  }

  public getTransport(): AxiosInstance {
    return this.api;
  }

  /**
   *
   * @throws Error
   */
  public async authenticate(login: string, password: string): Promise<IUser | null> {
    const response: AxiosResponse<IUser> = await this.api.post<IUser>('login', {login, password});
    if (response) {
      this.api.defaults.headers.Authorization = `Bearer ${response.data.token}`;
      this.token = response.data.token;
      this.userInfo.user = response.data;
      return response.data;
    } else {
      return null;
    }
  }

  /**
   *
   * @throws Error
   */
  public async checkToken(token: string): Promise<boolean> {
    try {
      const response: AxiosResponse<IAuthState> = await this.api.get<IAuthState>('auth', {params: {token}});
      if (response.data.ok) {
        this.token = token;
        const user = this.userInfo.user;
        user.token = token;
        this.userInfo.user = user;
      }
      return response.data.ok;
    } catch (e) {
      // this.userInfo.user = null;
      return false;
    }
  }

  public getEndpointByType(type: string): IEndpoint<any> {
    switch (type) {
      case 'place': return this.places;
      case 'building': return this.buildings;
      case 'transition': return this.transitions;
      case 'transition-view': return this.transitions.views;
    }
    return null;
  }
}
