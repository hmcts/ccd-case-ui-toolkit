import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'cut-footer-bar',
    templateUrl: './footer.html',
    styleUrls: ['./footer.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FooterComponent {

  @Input()
  public email: string;

  @Input()
  public isSolicitor: boolean;

  @Input()
  public phone: string;

  @Input()
  public workhours: string;

}
