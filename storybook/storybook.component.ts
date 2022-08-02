import { Component } from '@angular/core';
@Component({
  selector: 'storybook-wrapper',
  template: `<ng-content></ng-content>`,
  styleUrls: [
    './storybook.styles.scss'
  ]
})
export class StorybookComponent {}
