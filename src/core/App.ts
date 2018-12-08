import Scene from './Scene';
import {create} from "./di";

export interface AppOptions {
  mapContainer: SVGSVGElement | string;
  actionsContainer?: HTMLElement | string;
}

export default class App {
  private scene: Scene;
  private readonly fileInput: HTMLInputElement;
  private readonly sceneContainer: SVGSVGElement;
  private readonly actionsContainer: HTMLElement;

  constructor(options: AppOptions) {
    // Set scene container
    this.sceneContainer = typeof options.mapContainer === 'string' ?
      <SVGSVGElement>document.querySelector(options.mapContainer) :
      options.mapContainer;
    // Set actions container
    if (options.actionsContainer) {
      this.actionsContainer = typeof options.actionsContainer === 'string' ?
        document.querySelector(options.actionsContainer) :
        options.actionsContainer;
    } else {
      this.actionsContainer = document.querySelector('.js-actions');
    }
    // Create a scene
    this.scene = create(Scene, this.sceneContainer) as Scene;
    // Find a file input
    this.fileInput = this.actionsContainer.querySelector('.js-map-file');
    this.fileInput.addEventListener('change', this.onFileChange.bind(this));

    document.querySelector('.js-show-points').addEventListener('click', () => {
      this.scene.showCalculatedPath();
    })
  }

  private onFileChange(e: Event) {
    console.log(e);
    const file = this.fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState === FileReader.DONE) {
          const doc = (new DOMParser()).parseFromString(reader.result as string, 'image/svg+xml');
          const svg = doc.firstElementChild as SVGSVGElement;
          this.scene.updateMap(svg);
        }
      };
      reader.readAsText(file);
    }

  }
}
