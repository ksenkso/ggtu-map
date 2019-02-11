import {expect} from 'chai';
import cheerio = require('cheerio');
import request = require('request');
import {IBuilding} from '../../src/api/endpoints/BuildingsEndpoint';
import {ILocation} from '../../src/api/endpoints/LocationsEndpoint';
import {IPlace} from '../../src/api/endpoints/PlacesEndpoint';
import ApiClient from '../../src/core/ApiClient';
import Scene from '../../src/core/Scene';

const api = ApiClient.getInstance();
const MAPS_ADDRESS = process.env.MAPS_ADDRESS;

function loadMap(location: ILocation): Promise<any> {
  return new Promise((resolve, reject) => {
    request(MAPS_ADDRESS + location.map, (err, response, svg) => {
      if (!err && response.statusCode === 200) {
        resolve(cheerio.load(svg));
      } else {
        reject(err);
      }
    });
  });
}

describe.skip('ApiClient', () => {
    describe('Authentication', () => {
      it('should authenticate a user', () => {
        return api
          .authenticate('root', 'root')
          .then((user) => {
            expect(user).to.have.property('token');
            expect(user.token).to.be.a('string');
          });
      });
      it('should check allow valid token', () => {
        return api
          .checkToken(api.userInfo.user.token)
          .then((isValid) => {
            expect(isValid).to.be.true;
          });
      });
      it('should reject invalid token', () => {
        return api
          .checkToken('invalid token')
          .then((isValid) => {
            expect(isValid).to.be.false;
          });
      });
    });

    describe('Endpoints', () => {
      before(() => {
        return api.authenticate('root', 'root');
      });
      describe('Locations', () => {
        const location: ILocation = {
          BuildingId: 5,
          name: 'test place',
        };
        it('should create a location', () => {
          return api.locations.create(location)
            .then((newLocation) => {
              expect(newLocation).to.have.property('id');
              expect(newLocation.id).to.be.a('number');
              expect(newLocation.name).to.be.equal(location.name);
              expect(newLocation.BuildingId).to.be.equal(location.BuildingId);
              location.id = newLocation.id;
            })
            .catch((err) => {
              console.error(err);
            });
        });
        it('should fetch created location', () => {
          return api.locations.get(location.id)
            .then((data) => {
              expect(data).to.have.property('id');
              expect(data.id).to.be.equal(location.id);
              expect(data).to.have.property('createdAt');
              expect(data).to.have.property('updatedAt');
            })
            .catch((err) => {
              console.error(err);
            });
        });
        it('should update created location', () => {
          const newName = 'new location name';
          const newBuildingId = 6;
          return api.locations.update(location.id, {name: newName, BuildingId: newBuildingId})
            .then((updated) => {
              expect(updated).to.have.property('id');
              expect(updated.id).to.be.equal(location.id);
              expect(updated.name).to.be.equal(newName);
              expect(updated.BuildingId).to.be.equal(newBuildingId);
            })
            .catch((err) => {
              console.error(err);
            });
        });
        it('should delete created location', () => {
          return api.locations.delete(location.id)
            .then((deleted) => {
              expect(deleted).to.be.true;
            })
            .catch((err) => {
              console.error(err);
            });
        });
      });
      describe('Buildings', () => {
        const building: IBuilding = {
          container: 'ad27b3ca-d1d9-47e5-bdc8-5c5471c5527a',
          name: 'test building',
          type: 'study',
        };
        it('should create a building', (done) => {
          api.buildings
            .create(building)
            .then((created) => {
              expect(created).to.have.property('id');
              expect(created.name).to.be.equal(building.name);
              expect(created.container).to.be.equal(building.container);
              expect(created.type).to.be.equal(building.type);
              building.id = created.id;
              console.log(created.id);
              api.locations.getRoot()
                .then((root) => loadMap(root))
                .then(($) => {
                  const element = $(`g[data-type="building"][data-id="${building.id}"]`);
                  expect(element).to.not.be.null;
                  done();
                });
            });
        });
        it('should fetch a building', (done) => {
          api.buildings
            .get(building.id)
            .then((fetched) => {
              expect(fetched.id).to.be.equal(building.id);
              expect(fetched.name).to.be.equal(building.name);
              expect(fetched.type).to.be.equal(building.type);
              done();
            });
        });
        it('should update a building', (done) => {
          const newName = 'new test name';
          const newType = 'other';
          api.buildings
            .update(building.id, {name: newName, type: newType})
            .then((updated) => {
              expect(updated.name).to.be.equal(newName);
              expect(updated.type).to.be.equal(newType);
              done();
            });
        });
        it('should delete a building', (done) => {
          api.buildings
            .delete(building.id)
            .then((deleted) => expect(deleted).to.be.true)
            .then(() => done());
        });
      });
      describe('Places', () => {
        const place: IPlace = {
          container: '6b8143d9-934c-4418-9e04-755a53101f50',
          name: 'test place',
          Props: {
            hasProjector: true,
          },
          LocationId: 2,
          type: 'cabinet',
        };
        it('should create a place', () => {
          return api.places
            .create(place)
            .then((created) => {
              expect(created).to.have.property('id');
              expect(created).to.have.property('props');
              expect(created.Props).to.be.an('object');
              expect(created.Props).to.have.property('hasProjector');
              expect(created.name).to.be.equal(place.name);
              place.id = created.id;
              return api.locations
                .get(place.LocationId)
                .then(loadMap)
                .then(($) => {
                  const element = $(`g[data-type="place"][data-id="${created.id}"]`);
                  expect(element).to.be.not.null;
                });
            });
        });
        it('should fetch a place', () => {
          return api.places
            .get(place.id)
            .then((fetched) => {
              expect(fetched).to.have.property('createdAt');
              expect(fetched).to.have.property('updatedAt');
              expect(fetched.id).to.be.equal(place.id);
              expect(fetched.name).to.be.equal(place.name);
              expect(fetched.LocationId).to.be.equal(place.LocationId);
            });
        });
        it('should should update a place', () => {
          const newName = 'new place name';
          const newType = 'gym';
          const newProps = {hasTrainers: false};
          return api.places
            .update(place.id, {name: newName, type: newType, Props: newProps})
            .then((updated) => {
              expect(updated).to.have.property('props');
              expect(updated.Props).to.be.an('object');
              expect(updated.Props).to.have.property('hasTrainers');
              expect(updated.Props.hasTrainers).to.be.false;
              expect(updated.name).to.be.equal(newName);
              expect(updated.type).to.be.equal(newType);
            });

        });

        it('should delete a place', () => {
          return api.places
            .delete(place.id)
            .then((deleted) => expect(deleted).to.be.true);
        });
      });

    });
});
describe('Scene', () => {

  describe('Map', () => {
    it('should load a map with given location');
  });
});
