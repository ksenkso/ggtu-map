export interface ICoords {
  x: number;
  y: number;
}
export default class Vector implements ICoords {

  public static equals(c1: ICoords, c2: ICoords): boolean {
    return c1.x === c2.x && c1.y === c2.y;
  }

  public static scale(v: ICoords, scale: number): ICoords {
    return {x: v.x * scale, y: v.y * scale};
  }

  public static add(v1: ICoords, v2: ICoords): ICoords {
    return {x: v1.x + v2.x, y: v1.y + v2.y};
  }

  public static sub(v1: ICoords, v2: ICoords): ICoords {
    return {x: v1.x - v2.x, y: v1.y - v2.y};
  }

  public static fromTo(from: ICoords, to: ICoords): ICoords {
    return {x: to.x - from.x, y: to.y - from.y};
  }

  public static magnitude(v: ICoords): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  public static distance(p1: ICoords, p2: ICoords): number {
    return Vector.magnitude(Vector.fromTo(p1, p2));
  }

  public static dot(v1: ICoords, v2: ICoords): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  public static fromSVGLine(line: SVGLineElement): ICoords {
    return Vector.fromTo(
      {x: +line.getAttribute('x1'), y: +line.getAttribute('y1')},
      {x: +line.getAttribute('x2'), y: +line.getAttribute('y2')},
    );
  }
  constructor(public x: number, public y: number) {}
}
