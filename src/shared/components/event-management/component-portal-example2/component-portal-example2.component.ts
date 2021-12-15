import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'component-portal-example2',
  templateUrl: './component-portal-example2.component.html'
})
export class ComponentPortalExample2Component {
  public isNextClick1$ = new BehaviorSubject<boolean>(false);

  public onNextClick() {
    console.log('onNextClick');
    this.isNextClick1$.next(true);
  }
}
