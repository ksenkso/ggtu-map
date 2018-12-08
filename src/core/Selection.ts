import {IPrimitive} from '../interfaces/IPrimitive';
import {Singleton} from "./di";

@Singleton
export default class Selection {
  public elements: IPrimitive[] = [];

  get current(): IPrimitive | undefined {
    return this.elements[this.elements.length - 1];
  }

  get previous(): IPrimitive | undefined {
    return this.elements[this.elements.length - 2];
  }

  add(element: IPrimitive) {
    element.isSelected = true;
    this.elements.push(element);
  }

  remove(element: IPrimitive) {
    element.isSelected = false;
    this.elements.splice(this.elements.indexOf(element), 1);
  }

  set(items: IPrimitive[]) {
    this.elements.forEach(element => element.isSelected = false);
    this.elements = items.map(item => {
      item.isSelected = true;
      return item;
    });
  }
}
