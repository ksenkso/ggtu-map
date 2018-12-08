import Command from './Command';
import Selection from '../core/Selection';
import {IPrimitive} from "../interfaces/IPrimitive";
import {Define} from "../core/di";

@Define
export default class SelectionCommand extends Command {
  public primitives: IPrimitive[];
  private prevState: IPrimitive[];

  constructor(private selection: Selection, primitives: IPrimitive[]) {
    super();
    this.primitives = primitives;
  }

  do(): any {
    this.prevState = this.selection.elements.map(e => e);
    this.selection.set(this.primitives);
    super.do();
  }

  undo() {
    this.selection.set(this.prevState);
    super.undo();
  }
}
