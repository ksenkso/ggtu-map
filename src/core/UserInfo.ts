import {IUser} from '..';
import ApiClient, {ITokenInfo} from './ApiClient';

export class UserInfo {
  set user(value: IUser) {
    if (value) {
      this._user = value;
      this.api.getTransport().defaults.headers.Authorization = 'Bearer ' + this._user.token;
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
