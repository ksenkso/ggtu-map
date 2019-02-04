import {BaseEndpoint, IEndpoint} from "../common";
import {AxiosInstance} from "axios";
import TransitionViewsEndpoint from "./TransitionViewsEndpoint";

export interface ITransition {
  id?: number;
  name: string;
  type: string;
  BuildingId: number;
}

export interface ITransitionView {
  id?: number;
  container: string;
  TransitionId: number;
  LocationId: number;
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
