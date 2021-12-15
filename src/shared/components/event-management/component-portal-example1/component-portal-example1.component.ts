import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'component-portal-example1',
  templateUrl: './component-portal-example1.component.html'
})
export class ComponentPortalExample1Component {
  public isNextClick$ = new BehaviorSubject<boolean>(false);

  public onNextClick() {
    console.log('onNextClick');
    this.isNextClick$.next(true);
  }
}
