import {MapObject} from '..';
import {IBuilding} from '../api/endpoints/BuildingsEndpoint';
import {IPlace} from '../api/endpoints/PlacesEndpoint';
import {ITransitionView} from '../api/endpoints/TransitionViewsEndpoint';
import EventEmitter from '../utils/EventEmitter';
import ApiClient from './ApiClient';

export default class ObjectManager extends EventEmitter {
  public places: IPlace[] = [];
  public buildings: IBuilding[] = [];
  public transitionViews: ITransitionView[] = [];

  constructor(private _api: ApiClient) {
    super();
  }

  public async updateLocation(locationId: number) {
    const objects = await this._api.locations.getObjects(locationId);
    this.places = objects.places;
    this.buildings = objects.buildings;
    this.transitionViews = objects.transitionViews;
    this.emit('locationUpdated');
  }

  public getCollectionByType(type: string): MapObject[] {
    switch (type) {
      case 'place': return this.places;
      case 'building': return this.buildings;
      case 'transition-view': return this.transitionViews;
    }
    return null;
  }

}
