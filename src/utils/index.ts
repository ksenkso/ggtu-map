import Vector, {ICoords} from './Vector';

export interface IAdjacencyNode {
  marked?: boolean;
  location: ICoords;
  points: number[];
}

export interface IDoorCoords extends ICoords {
  p: ICoords[];
  id: string;
}

export function getIntersectionPoint(a: ICoords, b: ICoords, c: ICoords, d: ICoords): ICoords | null {
  const point = {x: null, y: null};
  point.x = -((a.x * b.y - b.x * a.y) * (d.x - c.x) - (c.x * d.y - d.x * c.y) * (b.x - a.x))
    / ((a.y - b.y) * (d.x - c.x) - (c.y - d.y) * (b.x - a.x));
  point.y = ((c.y - d.y) * (-point.x) - (c.x * d.y - d.x * c.y))
    / (d.x - c.x);
  if (isNaN(point.x) || isNaN(point.y)) {
    return null;
  }
  // If coords is out of the bounding box of the first line
  if (point.x <= Math.min(c.x, d.x)
    || point.x >= Math.max(c.x, d.x)
    || point.y <= Math.min(c.y, d.y)
    || point.y >= Math.max(c.y, d.y)
  ) {
    return null;
  }
  return point;
}

export function getDoorCoords(polyline: SVGPolylineElement): IDoorCoords {
  const points = polyline.getAttribute('points').split(' ');
  const p = [
    {x: +points[0], y: +points[1]},
    {
      x: +points[points.length - 2], y: +points[points.length - 1],
    }];
  const x = p[0].x + (p[1].x - p[0].x) / 2;
  const y = +p[0].y + (p[1].y - p[0].y) / 2;
  return {x, y, p, id: polyline.parentElement.getAttribute('id')};
}

export interface INormalData extends ICoords {
  linePoints: ICoords[];
  id?: string;
}

export function calculateNormals(centers: IDoorCoords[]): INormalData[] {
  return centers.map(({x, y, p, id}) => {
    // Rotate segment by 90 degrees
    const linePoints = [
      new Vector(-p[0].y, p[0].x),
      new Vector(-p[1].y, p[1].x),
    ];
    // Get coordinates of the center of created segment
    const cx = linePoints[0].x + (linePoints[1].x - linePoints[0].x) / 2;
    const cy = linePoints[0].y + (linePoints[1].y - linePoints[0].y) / 2;
    // Create vector from the center of original segment to the center of new segment
    const v = new Vector(x - cx, y - cy);
    linePoints[0] = Vector.add(linePoints[0], v);
    linePoints[1] = Vector.add(linePoints[1], v);
    // Create two vectors: one for the first coordinate, one for the second
    const v1 = Vector.fromTo({x, y}, linePoints[0]);
    const v2 = Vector.fromTo({x, y}, linePoints[1]);
    // Add these vectors respectively to points of the new segment and scale them
    // by some big number to draw the line, that will cross whole map
    const k = 100;
    linePoints[0] = Vector.add(linePoints[0], Vector.scale(v1, k));
    linePoints[1] = Vector.add(linePoints[1], Vector.scale(v2, k));
    return {x, y, linePoints, id};
  });
}
