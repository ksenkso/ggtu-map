import {BaseEndpoint, IEndpoint} from "../common";
import {AxiosInstance} from "axios";

export interface ITransitionView {
  id?: number;
  container: string;
  TransitionId: number;
  LocationId: number;
}


export default class TransitionViewsEndpoint extends BaseEndpoint implements IEndpoint<ITransitionView> {
  protected route: string = 'transitions-views/';
  constructor(api: AxiosInstance) {
    super(api);
  }
}
