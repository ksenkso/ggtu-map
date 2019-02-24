export function getMapElementAtCoords(x: number, y: number): SVGGElement {
    let parent = document.elementFromPoint(x, y).parentElement;
    if (parent) {
        while (parent && !parent.matches('g[data-type]')) {
            parent = parent.parentElement;
        }
        return (parent as any) as SVGGElement;
    }
}
