import EventEmitter from "../utils/EventEmitter";
import {MapObject} from "..";
import {ITransitionView} from "../api/endpoints/TransitionViewsEndpoint";
import {IPlace} from "../api/endpoints/PlacesEndpoint";
import {IBuilding} from "../api/endpoints/BuildingsEndpoint";
import ApiClient from "./ApiClient";

export default class ObjectManager extends EventEmitter {
  public places: Array<IPlace> = [];
  public buildings: Array<IBuilding> = [];
  public transitionViews: Array<ITransitionView> = [];

  constructor(private _api: ApiClient) {
    super();
  }

  async updateLocation(locationId: number) {
    const objects = await this._api.locations.getObjects(locationId);
    this.places = objects.places;
    this.buildings = objects.buildings;
    this.transitionViews = objects.transitionViews;
    this.emit('locationUpdated');
  }

  public getCollectionByType(type: string): Array<MapObject> {
    switch (type) {
      case 'place': return this.places;
      case 'building': return this.buildings;
      case 'transition-view': return this.transitionViews;
    }
    return null;
  }

}
