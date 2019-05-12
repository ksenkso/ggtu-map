import ApiClient from '../core/ApiClient';
import WayPath from '../drawing/WayPath';
import IDrawable from '../interfaces/IDrawable';
import IPathItem from '../interfaces/IPathItem';
import IScene from '../interfaces/IScene';

export default class PathRenderer implements IDrawable {
    private static subdividePath(path: IPathItem[]): IPathItem[][] {
        const groups = [[path[0]]];
        for (let i = 1; i < path.length; i++) {
            if (path[i].LocationId !== groups[groups.length - 1][0].LocationId) {
                groups.push([path[i]]);
            } else {
                groups[groups.length - 1].push(path[i]);
            }
        }
        return groups;
    }
    public current: IPathItem;
    private scene: IScene;
    private graph: WayPath = new WayPath({draggable: false});
    constructor(private path: IPathItem[]) {}

    public appendTo(scene: IScene) {
        this.scene = scene;
        this.graph.appendTo(scene);
        this.renderPath();
    }

    public setPath(path: IPathItem[]) {
        this.path = path;
        this.renderPath();
    }

    public async renderPath() {
        this.graph.clear();
        const location = this.scene.getLocation();
        if (location.id !== this.path[0].LocationId) {
            await this.scene.setLocationById(this.path[0].LocationId);
        }
        this.graph.showPath(this.path);
        this.scene.setCenter(this.path[0].position);
    }

    public next() {}
    public prev() {}
}
