import Command from '../commands/Command';
import {create, Singleton, Type} from "./di";

@Singleton
export default class UndoRedoStack {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];
  public bufferCommand?: Type<Command>;
  public bufferArgs?: any[];

  do(command: Command): any {
    const result = command.do();
    this.undoStack.push(command);
    return result;
  }

  undo(): any {
    const command = this.undoStack.pop();
    if (command) {
      const result = command.undo();
      this.redoStack.push(command);
      return result;
    }
  }

  redo(): any {
    const command = this.redoStack.pop();
    if (command) {
      const result = command.do();
      this.undoStack.push(command);
      return result;
    }
  }

  doBuffer(): any {
    if (this.bufferCommand) {
      const command = create(this.bufferCommand, ...this.bufferArgs) as Command;
      this.do(command);
      this.bufferCommand = null;
    }
  }
}
