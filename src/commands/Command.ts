/**
 * A base class for all commands.
 */
export default abstract class Command {
  public isDone: boolean;
  public commands: Command[] = [];
  /**
   * Executes all the sub-commands and marks current command as done.
   */
  do(): any {
    this.commands.forEach(command => command.do());
    this.isDone = true;
  }

  /**
   * Reverts all the sub-commands and marks current command as undone.
   */
  undo(): any {
    this.commands.forEach(command => command.undo());
    this.commands = [];
    this.isDone = false;
  }
}
