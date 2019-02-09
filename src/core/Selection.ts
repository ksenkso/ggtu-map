import {IPrimitive} from '..';

export default class Selection {
  public elements: IPrimitive[] = [];

  get current(): IPrimitive | undefined {
    return this.elements[this.elements.length - 1];
  }

  get previous(): IPrimitive | undefined {
    return this.elements[this.elements.length - 2];
  }

  public add(element: IPrimitive) {
    element.selected = true;
    this.elements.push(element);
  }

  public remove(element: IPrimitive) {
    element.selected = false;
    this.elements.splice(this.elements.indexOf(element), 1);
  }

  public set(items: IPrimitive[]) {
    this.elements.forEach((element) => element.selected = false);
    this.elements = items.map((item) => {
      item.selected = true;
      return item;
    });
  }
}
