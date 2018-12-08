export interface ICoords {
  x: number;
  y: number;
}
export default class Vector implements ICoords {
  constructor(public x: number, public y: number) {}

  static scale(v: ICoords, scale: number): ICoords {
    return {x: v.x * scale, y: v.y * scale};
  }

  static add(v1: ICoords, v2: ICoords): ICoords {
    return {x: v1.x + v2.x, y: v1.y + v2.y};
  }

  static sub(v1: ICoords, v2: ICoords): ICoords {
    return {x: v1.x - v2.x, y: v1.y - v2.y};
  }

  static fromTo(from: ICoords, to: ICoords): ICoords {
    return {x: to.x - from.x, y: to.y - from.y};
  }

  static magnitude(v: ICoords): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static distance(p1: ICoords, p2: ICoords): number {
    return Vector.magnitude(Vector.fromTo(p1, p2));
  }

  static dot(v1: ICoords, v2: ICoords): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static fromSVGLine(line: SVGLineElement): ICoords {
    return Vector.fromTo(
      {x: +line.getAttribute('x1'), y: +line.getAttribute('y1')},
      {x: +line.getAttribute('x2'), y: +line.getAttribute('y2')}
    );
  }
}
