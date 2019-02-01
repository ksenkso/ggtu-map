import ApiClient from "../../src/core/ApiClient";
import {expect} from 'chai';
import {IBuilding, ILocation, IPlace} from "../../src";
import {ITransition} from "../../src/api/endpoints/TransitionsEndpoint";
import cheerio = require('cheerio');
import request = require('request');

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
    })
  })
}

describe('ApiClient', () => {
    describe('Authentication', () => {
      it('should authenticate a user', () => {
        return api
          .authenticate('root', 'root')
          .then(user => {
            expect(user).to.have.property('token');
            expect(user.token).to.be.a('string')
          })
      });
      it('should check allow valid token', () => {
        return api
          .checkToken(api.userInfo.user.token)
          .then(isValid => {
            expect(isValid).to.be.true;
          })
      });
      it('should reject invalid token', () => {
        return api
          .checkToken('invalid token')
          .then(isValid => {
            expect(isValid).to.be.false;
          });
      })
    });

    describe('Endpoints', () => {
      before(() => {
        return api.authenticate('root', 'root');
      });
      describe('Locations', () => {
        const location: ILocation = {
          name: 'test place',
          BuildingId: 5
        };
        it('should create a location', () => {
          return api.locations.create(location)
            .then(newLocation => {
              expect(newLocation).to.have.property('id');
              expect(newLocation.id).to.be.a('number');
              expect(newLocation.name).to.be.equal(location.name);
              expect(newLocation.BuildingId).to.be.equal(location.BuildingId);
              location.id = newLocation.id;
            })
            .catch(err => {
              console.error(err);
            })
        });
        it('should fetch created location', () => {
          return api.locations.get(location.id)
            .then(data => {
              expect(data).to.have.property('id');
              expect(data.id).to.be.equal(location.id);
              expect(data).to.have.property('createdAt');
              expect(data).to.have.property('updatedAt');
            })
            .catch(err => {
              console.error(err);
            })
        });
        it('should update created location', () => {
          const newName = 'new location name';
          const newBuildingId = 6;
          return api.locations.update(location.id, {name: newName, BuildingId: newBuildingId})
            .then(updated => {
              expect(updated).to.have.property('id');
              expect(updated.id).to.be.equal(location.id);
              expect(updated.name).to.be.equal(newName);
              expect(updated.BuildingId).to.be.equal(newBuildingId);
            })
            .catch(err => {
              console.error(err);
            })
        });
        it('should delete created location', () => {
          return api.locations.delete(location.id)
            .then(deleted => {
              expect(deleted).to.be.true;
            })
            .catch(err => {
              console.error(err);
            })
        })
      });
      describe('Transitions', () => {
        const transition: ITransition = {
          LocationId: 1,
          container: '8bc8526b-3f4d-4d60-ac68-55e9579d77ce'
        };
        it('should create a transition', () => {
          return api.transitions.create(transition)
            .then(created => {
              expect(created).to.have.property('id');
              transition.id = created.id;
              expect(created.LocationId).to.be.equal(created.LocationId);
              expect(created.container).to.be.equal(created.container);
              api.locations.get(transition.LocationId)
                .then(location => {
                  loadMap(location)
                    .then($ => {
                      const element = $(`g[data-type="transition"][data-id="${transition.id}"]`);
                      expect(element).to.not.be.null;
                    })
                });
            })
        })
      });
      describe('Buildings', () => {
        const building: IBuilding = {
          name: 'test building',
          type: 'study',
          container: '7795b1ce-159a-43a2-88e2-e00f7852d5d5'
        };
        it('should create a building', () => {
          return api.buildings
            .create(building)
            .then(created => {
              expect(created).to.have.property('id');
              expect(created.name).to.be.equal(building.name);
              expect(created.container).to.be.equal(building.container);
              expect(created.type).to.be.equal(building.type);
              building.id = created.id;
              return api.locations.getRoot()
                .then(root => loadMap(root))
                .then($ => {
                  const element = $(`g[data-type="transition"][data-id="${building.id}"]`);
                  expect(element).to.not.be.null;
                })
            })
        });
        it('should fetch a building', () => {
          return api.buildings
            .get(building.id)
            .then(fetched => {
              expect(fetched.id).to.be.equal(building.id);
              expect(fetched.name).to.be.equal(building.name);
              expect(fetched.type).to.be.equal(building.type);
            });
        });
        it('should update a building', () => {
          const newName = 'new test name';
          const newType = 'other';
          return api.buildings
            .update(building.id, {name: newName, type: newType})
            .then(updated => {
              expect(updated.name).to.be.equal(newName);
              expect(updated.type).to.be.equal(newType);
            })
        });
        it('should delete a building', () => {
          return api.buildings
            .delete(building.id)
            .then(deleted => expect(deleted).to.be.true)

        });
      });
      describe('Places', () => {
        const place: IPlace = {
          name: 'test place',
          LocationId: 1,
          container: '6b8143d9-934c-4418-9e04-755a53101f50',
          type: "cabinet",
          props: {
            hasProjector: true
          }
        };
        it('should create a place', () => {
          return api.places
            .create(place)
            .then(created => {
              expect(created).to.have.property('id');
              expect(created).to.have.property('props');
              expect(created.props).to.be.an('object');
              expect(created.props).to.have.property('hasProjector');
              expect(created.name).to.be.equal(place.name);
              place.id = created.id;
              return api.locations
                .get(place.LocationId)
                .then(loadMap)
                .then($ => {
                  const element = $(`g[data-type="place"][data-id="${created.id}"]`);
                  expect(element).to.be.not.null;
                });
            })
        });
        it('should fetch a place', () => {
          return api.places
            .get(place.id)
            .then(fetched => {
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
            .update(place.id, {name: newName, type: newType, props: newProps})
            .then(updated => {
              expect(updated).to.have.property('props');
              expect(updated.props).to.be.an('object');
              expect(updated.props).to.have.property('hasTrainers');
              expect(updated.props.hasTrainers).to.be.false;
              expect(updated.name).to.be.equal(newName);
              expect(updated.type).to.be.equal(newType);
            })

        });

        it('should delete a place', () => {
          return api.places
            .delete(place.id)
            .then(deleted => expect(deleted).to.be.true);
        });
      });

    })
});
