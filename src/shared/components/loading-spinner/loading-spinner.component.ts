import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ccd-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LoadingSpinnerComponent {
  @Input() public loadingText: string = 'Searching';
}
