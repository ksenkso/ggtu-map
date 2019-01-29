export type CallbacksCollection = {[key: string]: Function[]};
export default class EventEmitter {
  private events: CallbacksCollection = {};

  public on(event: string, callback: Function): void {
    this.events[event] = this.events[event] ? this.events[event].concat([callback]) : [callback];
  }

  public off(event: string, callback: Function): void {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback);
      if (~index) {
        this.events[event].splice(index, 1);
      }
    }
  }

  public emit(event: string, payload?: any): void {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(payload))
    }
  }
}
