import Vector, {ICoords} from "../utils/Vector";
import Scene from "./Scene";
import Point from "../drawing/Point";

export default class DragAndDrop {
  public static IS_DRAGGING = false;
  public static draggable: Point = null;
  public static delta: Vector = null;
  public static movement: ICoords = {x: 0, y: 0};

  public static get hasMovement(): number {
    return Vector.magnitude(DragAndDrop.movement);
  }

  constructor() {
    Scene.container.addEventListener('mousemove', DragAndDrop.onMouseMove);
    Scene.container.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  public static onMouseMove(e: MouseEvent) {
    /**
     * Check if there was a movement to prevent false positives.
     * There may be a bug with some touch-pads, when `mousemove` event is triggered by click.
     */
    if (DragAndDrop.IS_DRAGGING && (e.movementX || e.movementY)) {
      DragAndDrop.movement.x += e.movementX;
      DragAndDrop.movement.y += e.movementY;
      // GLOBALS.IS_DRAGGING = true;
      const coords = Vector.add(Scene.getMouseCoords(e), DragAndDrop.delta);
      DragAndDrop.draggable.setPosition(coords);
      if (DragAndDrop.draggable.from.length) {
        DragAndDrop.draggable.from.forEach(line => line.setCoords(coords));
      }
      if (DragAndDrop.draggable.to.length) {
        DragAndDrop.draggable.to.forEach(line => line.setCoords(null, coords));
      }
    }
  }

  public onMouseUp(e: MouseEvent) {
    /*if (DragAndDrop.hasMovement && DragAndDrop.IS_DRAGGING && this.commandManager.bufferCommand) {
      this.commandManager.bufferArgs.push(Vector.add(Scene.getMouseCoords(e), DragAndDrop.delta));
      this.commandManager.doBuffer();
    }*/
    DragAndDrop.IS_DRAGGING = false;
    DragAndDrop.draggable = null;
  }
}

