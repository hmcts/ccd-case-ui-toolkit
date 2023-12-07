import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavigationNotifierService {
  public navigationSource: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public navigation = this.navigationSource.asObservable();

  public announceNavigation(origin: any) {
    this.navigationSource.next(origin);
  }
}
