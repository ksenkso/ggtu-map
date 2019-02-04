import {BaseEndpoint, IEndpoint, IPlace,} from '../common';
import {AxiosInstance} from "axios";

export interface IPlacesEndpoint extends IEndpoint<IPlace> {
}
export default class PlacesEndpoint extends BaseEndpoint implements IPlacesEndpoint {
  protected route: string = 'places/';

  constructor(api: AxiosInstance) {
    super(api);
  }
}
