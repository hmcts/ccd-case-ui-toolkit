import { Component, Input } from '@angular/core';

@Component({
    selector: 'cut-footer-bar',
    templateUrl: './footer.html',
    styleUrls: ['./footer.scss']
})
export class FooterComponent {

  @Input()
  public email: string;

  @Input()
  public phone: string;

  @Input()
  public workhours: string;

}
