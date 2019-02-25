
export function getMapElementAtCoords(container: Element, x: number, y: number): SVGGElement {
    const containers = container.querySelectorAll('g[data-type]');
    for (let i = 0; i < containers.length; i++) {
        const box = (containers[i] as SVGGElement).getBBox();
        if (box.x < x && (box.x + box.width) > x && box.y < y && (box.y + box.height) > y) {
            return containers[i] as SVGGElement;
        }
    }
    /*let parent = document.elementFromPoint(x, y).parentElement;
    if (parent) {
        while (parent && !parent.matches('g[data-type]')) {
            parent = parent.parentElement;
        }
        return (parent as any) as SVGGElement;
    }*/
}
