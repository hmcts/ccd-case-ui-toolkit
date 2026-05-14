import { Injectable } from "@angular/core";

@Injectable()
export class FocusService {

    /** unique ID of DOM element this service will focus on */
    public readonly elementIdToFocus = 'focusService-elementIdToFocus';

    /**
     * Focus on a specific element with the elementIdToFocus.
     * If there is no element in the DOM, no action is taken.
     * TODO Ideally, this service should not be in this library.
     */
    public focus(): void {
        const elementToFocus = document.getElementById(this.elementIdToFocus);
        if (elementToFocus) {
            elementToFocus.focus();
        }
    }
}