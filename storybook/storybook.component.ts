import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'storybook-wrapper',
    template: `<ng-content></ng-content>`,
    styleUrls: [
        './storybook.styles.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class StorybookComponent {}
