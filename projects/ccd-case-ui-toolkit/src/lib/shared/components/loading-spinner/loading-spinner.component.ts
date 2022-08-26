import { AfterContentChecked, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ccd-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LoadingSpinnerComponent implements AfterContentChecked {
  @Input() public loadingText = 'Loading';
  constructor(private readonly ref: ChangeDetectorRef) { }
  public ngAfterContentChecked(): void {
    this.ref.detectChanges();
  }
}
