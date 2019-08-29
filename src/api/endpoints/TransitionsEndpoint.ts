import {AxiosInstance} from 'axios';
import {BaseEndpoint, IEndpoint} from '../common';
import {ILocation} from './LocationsEndpoint';
import TransitionViewsEndpoint, {ITransitionView} from './TransitionViewsEndpoint';

export interface ITransition {
  id?: number;
  name: string;
  type: string;
  BuildingId: number;
  Views?: ITransitionView[];
}

export interface ITransitionsEndpoint extends IEndpoint<ITransition> {
  views: IEndpoint<ITransitionView>;
}

export default class TransitionsEndpoint extends BaseEndpoint implements ITransitionsEndpoint {
  public readonly views: TransitionViewsEndpoint;
  protected route: string = 'transitions/';
  constructor(api: AxiosInstance) {
    super(api);
    this.views = new TransitionViewsEndpoint(api);
  }

  public async getLocations(transitionId: number): Promise<ILocation[]> {
    const response = await this.api.get(this.route + transitionId + '/' + 'locations');
    if (response.status === 200) {
      return response.data as ILocation[];
    } else {
      return null;
    }
  }
}
