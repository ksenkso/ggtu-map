import IScene from './IScene';

export default interface IDrawable {
    appendTo(scene: IScene): void;
}
