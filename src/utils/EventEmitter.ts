export interface ICallbacksCollection {[key: string]: Array<(...args: any[]) => any>; }
export interface IEventEmitter {
  on(event: string, callback: (...args: any[]) => any): void;
  off(event: string, callback: () => any): void;
  emit(event: string, payload?: any): void;
}
export default class EventEmitter implements IEventEmitter {
  private events: ICallbacksCollection = {};

  public on(event: string, callback: (...args: any[]) => any): void {
    this.events[event] = this.events[event] ? this.events[event].concat([callback]) : [callback];
  }

  public off(event: string, callback: () => any): void {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback);
      if (index !== -1) {
        this.events[event].splice(index, 1);
      }
    }
  }

  public emit(event: string, payload?: any): void {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(payload));
    }
  }
}
