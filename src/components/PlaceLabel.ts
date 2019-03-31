import {PlaceType} from '..';
import {IPlace} from '../api/endpoints/PlacesEndpoint';
import IconLabel from './IconLabel';

export default class PlaceLabel extends IconLabel {
    public static MAX_NAME_LENGTH: number = 20;

    public static getIcon(type: PlaceType) {
        switch (type) {
            case PlaceType.OTHER:
            case PlaceType.CABINET:
                return '';
            case PlaceType.WC:
                return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNzUuNjEgMjc1LjYxIj48cGF0aCBkPSJNMTM4LjM3LDBhMTM3LjgxLDEzNy44MSwwLDEsMCwxMzcuOCwxMzcuOEExMzcuODEsMTM3LjgxLDAsMCwwLDEzOC4zNywwWk0xMzMsMTc0LjkzSDExNy42bC0xNS4zNy02MC41LTE2LjA4LDYwLjVINzAuNzlsLTIwLTg2LjU4aDE2LjhsMTEuMTMsNTcuNzZMOTUuMzMsODguMzVoMTMuMDlMMTI1LDE0Ni4xMWwxMS4xMy01Ny43NmgxNi44Wm00NS43LTIyLjc0YTEyLjE2LDEyLjE2LDAsMCwwLDQuOTEsNS40NCwxNS4yMiwxNS4yMiwwLDAsMCw3LjgsMS44OCwxMy4wOSwxMy4wOSwwLDAsMCw2LjQzLTEuNTgsMTMuNTIsMTMuNTIsMCwwLDAsNC44My00LjYxLDIxLjM2LDIxLjM2LDAsMCwwLDIuODUtNy4zOWgxNi45MWE0NC43NCw0NC43NCwwLDAsMS01Ljg2LDE2LjE3LDI4Ljc0LDI4Ljc0LDAsMCwxLTEwLjYsMTAuMjEsMjkuNzksMjkuNzksMCwwLDEtMTQuNTYsMy41MmgtOS44OGwtNy0zLjc5YTI1LjIzLDI1LjIzLDAsMCwxLTEwLjcyLTExcS0zLjY5LTcuMjUtMy42OS0xNy40OFYxMTkuNzlxMC0xMC4yMywzLjY5LTE3LjQ3YTI1LjM4LDI1LjM4LDAsMCwxLDEwLjcyLTExcTctMy44MSwxNi45MS0zLjgxQTMwLDMwLDAsMCwxLDIwNiw5MWEyOC44MiwyOC44MiwwLDAsMSwxMC42MywxMC4yMSw0NCw0NCwwLDAsMSw1LjgsMTYuMTdIMjA1LjQ4YTIxLjY4LDIxLjY4LDAsMCwwLTIuOTQtNy4zMiwxNC4wNywxNC4wNywwLDAsMC00LjgzLTQuNjUsMTIuNjEsMTIuNjEsMCwwLDAtNi4zNC0xLjYxLDE1LjIyLDE1LjIyLDAsMCwwLTcuOCwxLjg4LDEyLjE2LDEyLjE2LDAsMCwwLTQuOTEsNS40OCwyMC4yLDIwLjIsMCwwLDAtMS43LDguNjZ2MjMuNzZBMjAsMjAsMCwwLDAsMTc4LjY2LDE1Mi4xOVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0wLjU2IDApIiBzdHlsZT0iZmlsbDojMmUzZDk4Ii8+PC9zdmc+';
            case PlaceType.GYM:
                return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNzUuNjEgMjc1LjYxIj48cGF0aCBkPSJNMTM4LjM3LS41NmExMzcuODEsMTM3LjgxLDAsMSwwLDEzNy44LDEzNy44QTEzNy44LDEzNy44LDAsMCwwLDEzOC4zNy0uNTZaTTI0NCwxNDguMjVWMTcxaC0yMnYxNS41MWgtMjJ2MTUuNjZoLTIyVjE0OC4yNWgtNzl2NTMuODdoLTIyVjE4Ni40NmgtMjJWMTcxaC0yMlYxMDMuNTNoMjJWODkuMTVoMjJWNzMuNDloMjJ2NTIuNzRoNzlWNzMuNDloMjJWODkuMTVoMjJ2MTQuMzhoMjJ2NDQuNzJaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMC41NiAwLjU2KSIgc3R5bGU9ImZpbGw6IzJlM2Q5OCIvPjwvc3ZnPg==';
        }
    }
    public static getPlaceName(place: IPlace) {
        return place.props && place.props.number ? place.props.number : PlaceLabel.preparePlaceName(place.name);
    }
    public static preparePlaceName(name: string, maxLength: number = PlaceLabel.MAX_NAME_LENGTH): string {
        if (name.length > maxLength) {
            return name.slice(0, maxLength - 3) + '...';
        }
        return name;
    }
    constructor(public place: IPlace) {
        super(PlaceLabel.getIcon(place.type));
        this.init();
    }

    private init() {
        switch (this.place.type) {
            case PlaceType.CABINET: {
                this.setText(PlaceLabel.getPlaceName(this.place));
                break;
            }
            case PlaceType.GYM: {
                this.setText(this.place.name);
                break;
            }
            case PlaceType.WC: {
                this.element.classList.add('label_center');
            }
        }
    }
}
