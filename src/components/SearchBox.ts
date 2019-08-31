import {IBuilding} from '../api/endpoints/BuildingsEndpoint';
import {ILocation} from '../api/endpoints/LocationsEndpoint';
import {IPlace} from '../api/endpoints/PlacesEndpoint';
import {ISearchResult} from '../api/endpoints/SearchEndpoint';
import IScene from '../interfaces/IScene';

export default class SearchBox {

    public static deepestSearchResult(result: ISearchResult): IPlace | ILocation | IBuilding {
        if (result.place) {
            return result.place;
        } else {
            if (result.location) {
                return result.location;
            } else {
                return result.building;
            }
        }
    }
    public container: HTMLElement;
    private results: ISearchResult[] = [];
    private readonly resultsContainer: HTMLElement;
    private readonly noResults: HTMLElement;

    constructor(public scene: IScene) {
        this.container = document.createElement('div');
        this.container.classList.add('map__panel', 'map__search');
        this.container.innerHTML = `<form action="#" class="js-find-places">
<div class="input-group">
    <input class="form-control" type="search" name="search" id="ggtu-map-search" title="Поиск" placeholder="Поиск мест">
    <div class="input-group-append">
        <button class="btn" type="submit">Искать</button>
        <button class="btn js-open-paths" type="button">Маршруты</button>
    </div>
</div>
</form>
<div class="search__results">
    <div class="search__no-results d-none">Ничего не найдено</div>
</div>`;
        this.resultsContainer = this.container.querySelector('.search__results');
        this.noResults = this.container.querySelector('.search__no-results');
        this.container.querySelector('.js-open-paths')
            .addEventListener('click', this.openPathfinder.bind(this));
        this.container.querySelector('.js-find-places')
            .addEventListener('submit', this.findPlaces.bind(this));
        this.scene.container.appendChild(this.container);
    }
    public openPathfinder(): void {
        this.scene.showPanel('pathfinder');
    }

    public findPlaces(event: Event): void {
        event.preventDefault();
        const q = (this.container.querySelector('#ggtu-map-search') as HTMLInputElement).value;
        this.scene.apiClient.search.query(q)
            .then(async (results) => {
                this.resultsContainer.innerHTML = '';
                this.results = results;
                if (results.length) {
                    this.noResults.classList.add('d-none');
                    this.results.forEach((result, i) => {
                        const el = this.createResultElement(result, i);
                        this.resultsContainer.appendChild(el);
                    });
                    this.centerOnResult(results[0]);
                } else {
                    this.noResults.classList.remove('d-none');
                }
            });
    }

    public async centerOnResult(result) {
        if (result.location && result.location.id !== this.scene.getLocation().id) {
            await this.scene.setLocation(result.location);
        }
        if (result.place || result.building) {
            return this.scene.centerOnObject(result.place || result.building);
        }
    }

    public onResultClick(event: MouseEvent): void {
        let target = event.target as HTMLElement;
        while (target.className !== 'search__result') {
            target = target.parentElement;
        }
        this.centerOnResult(this.results[+target.dataset.result]);
    }

    public createResultElement(result: ISearchResult, index: number): HTMLElement {
        const deepest = SearchBox.deepestSearchResult(result);
        const el = document.createElement('div');
        el.classList.add('search__result');
        el.id = `search-result-${index}`;
        const place = document.createElement('h4');
        place.textContent = deepest.name;
        el.appendChild(place);
        if (result.location && result.place) {
            const location = document.createElement('h6');
            location.innerText = result.location.name;
            el.appendChild(location);
        }
        if (result.building && (result.place || result.location)) {
            const building = document.createElement('h6');
            building.innerText = result.building.name;
            el.appendChild(building);
        }
        el.dataset.result = '' + index;
        el.addEventListener('click', this.onResultClick.bind(this));
        return el;
    }
}
