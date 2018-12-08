import Command from "./Command";
import Scene from "../core/Scene";
import {IPrimitive} from "../interfaces/IPrimitive";

export default class DeleteCommand extends Command {
  constructor(private scene: Scene, private primitives: IPrimitive[]) {
    super();
  }
  do(): any {
    this.primitives.forEach(p => p.destroy());
  }

  undo() {
    this.primitives.forEach(p => {
      this.scene.addPrimitive(p)
    });
  }
}