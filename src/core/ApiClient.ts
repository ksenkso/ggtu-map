import qs = require('qs');
import {AuthState, IEndpoint, IUser} from "../api/common";
import BuildingsEndpoint, {IBuildingsEndpoint} from "../api/endpoints/BuildingsEndpoint";
import axios, {AxiosInstance, AxiosResponse} from "axios";
import PlacesEndpoint, {IPlacesEndpoint} from "../api/endpoints/PlacesEndpoint";
import LocationsEndpoint, {ILocationsEndpoint} from "../api/endpoints/LocationsEndpoint";
import TransitionsEndpoint, {ITransitionsEndpoint} from "../api/endpoints/TransitionsEndpoint";

export interface ITokenInfo {
  text: string;
  iat: number;
  exp: number;
  user_id: number;
}

export class UserInfo {
  set user(value: IUser) {
    if (value) {
      this._user = value;
      this.api.getTransport().defaults['Authorization'] = 'Bearer ' + this._user.token;
    }
  }

  get user(): IUser {
    return this._user;
  }

  private _user: IUser;

  constructor(private api: ApiClient) {
  }

  public async getTokenInfo(): Promise<ITokenInfo> {

    const api = this.api.getTransport();
    const response = await api.get<ITokenInfo>('/users/tokenInfo');
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  }
}

export default class ApiClient {

  private static instance: ApiClient;
  public static base = 'http://localhost:3000';
  public static apiBase = ApiClient.base + '/v1';
  public static  mapsBase = ApiClient.base + '/maps';

  public static getInstance(user?: IUser) {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(user);
    }
    return ApiClient.instance;
  }

  private set token(token: string) {
    this.api.defaults.headers['Authorization'] = token ? `Bearer ${token}` : '';
  }

  private get token(): string {
    return this.userInfo.user.token;
    //return this.api.defaults.headers['Authorization'].substring(7);
  }
  public locations: ILocationsEndpoint;
  public buildings: IBuildingsEndpoint;
  public places: IPlacesEndpoint;
  public transitions: ITransitionsEndpoint;
  public readonly userInfo: UserInfo;
  private readonly api: AxiosInstance;

  private constructor(user?: IUser) {
    this.api = axios.create({
      baseURL: ApiClient.apiBase
    });
    this.api.defaults.paramsSerializer = params => qs.stringify(params, {encodeValuesOnly: true});
    this.userInfo = new UserInfo(this);
    if (user) {
      this.userInfo.user = user;
    }
    this.buildings = new BuildingsEndpoint(this.api);
    this.locations = new LocationsEndpoint(this.api);
    this.places = new PlacesEndpoint(this.api);
    this.transitions = new TransitionsEndpoint(this.api);
  }

  public getTransport(): AxiosInstance {
    return this.api;
  }

  /**
   *
   * @throws Error
   */
  async authenticate(login: string, password: string): Promise<IUser | null> {
    const response: AxiosResponse<IUser> = await this.api.post<IUser>('login', {login, password});
    if (response) {
      this.api.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;
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
  async checkToken(token: string): Promise<boolean> {
    try {
      const response: AxiosResponse<AuthState> = await this.api.get<AuthState>('auth', {params: {token}});
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
