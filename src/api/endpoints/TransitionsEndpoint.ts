import {BaseEndpoint, IEndpoint} from "../common";
import {AxiosInstance} from "axios";
import TransitionViewsEndpoint, {ITransitionView} from "./TransitionViewsEndpoint";

export interface ITransition {
  id?: number;
  name: string;
  type: string;
  BuildingId: number;
  Views?: Array<ITransitionView>
}

export interface ITransitionsEndpoint extends IEndpoint<ITransition> {
  views: IEndpoint<ITransitionView>;
}

export default class TransitionsEndpoint extends BaseEndpoint implements ITransitionsEndpoint {
  protected route: string = 'transitions/';
  public readonly views: TransitionViewsEndpoint;
  constructor(api: AxiosInstance) {
    super(api);
    this.views = new TransitionViewsEndpoint(api);
  }
}
