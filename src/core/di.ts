import 'reflect-metadata';

export interface Type<T> extends Function {
  new(...args: any[]): T;
}

export type ContainerKey<T> = T | string;
export type NonCallable = string | number | symbol | object;


export interface ContainerEntry<T> {
  definition: Type<T>;
  dependencies: any[];
  args?: any[];
  singleton?: boolean;
}


export default class Container {
  private services: Map<ContainerKey<any>, ContainerEntry<any>> = new Map<ContainerKey<any>, ContainerEntry<any>>();
  private singletons: Map<ContainerKey<any>, any> = new Map<ContainerKey<any>, any>();
  private values: Map<any, any> = new Map<any, any>();
  public define<T>(name: Type<T> | any, key?: string) {
    if (!Container.isClass(name)) {
      this.values.set(key, name);
    } else {
      const deps = Reflect.getMetadata('design:paramtypes', name) || [];
      this.services.set(name, {
        definition: name,
        dependencies: deps.filter(dep => !Container.isNativeType(dep))
      });
    }
  }

  public singleton<T>(name: Type<T>, args = []) {
    const deps = Reflect.getMetadata('design:paramtypes', name) || [];
    this.services.set(name, {
      definition: name,
      dependencies: deps.filter(dep => !Container.isNativeType(dep)),
      args,
      singleton: true
    });
  }

  public create<T>(name: Type<T> | string, ...args: any[]): T | NonCallable {
    if (!Container.isClass(name)) {
      return this.values.get(name);
    } else {
      const c = this.services.get(name);
      if (c) {
        if (Container.isClass(c.definition)) {
          if (c.singleton) {
            const singletonInstance = this.singletons.get(name);
            if (singletonInstance) {
              return singletonInstance;
            } else {
              const newSingletonInstance = this.createInstance<T>(c, ...args);
              this.singletons.set(name, newSingletonInstance);
              return newSingletonInstance;
            }
          }
          return this.createInstance(c, ...args);
        } else {
          return c.definition;
        }
      }
    }

  }

  private getResolvedDependencies(service) {
    let classDependencies = [];
    if (service.dependencies) {
      classDependencies = service.dependencies.map((dep) => {
        return this.create(dep);
      });
    }
    return classDependencies;
  }

  private createInstance<T>(service: ContainerEntry<T>, ...args: any[]): T {
    const deps = this.getResolvedDependencies(service);
    return new service.definition(...deps, ...args);
  }

  private static isClass(definition) {
    return typeof definition === 'function';
  }

  private static isNativeType(type) {
    return type.toString().includes('[native code]');
  }
}

const container = new Container();
const Define = container.define.bind(container);
const Singleton = container.singleton.bind(container);
const create: <T>(name: Type<T> | string, ...args: any[]) => T | NonCallable = container.create.bind(container);
export {Define, Singleton, create}
