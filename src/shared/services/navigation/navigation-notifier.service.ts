import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class NavigationNotifierService {
  navigationSource: BehaviorSubject<any> = new BehaviorSubject<any>({});
  navigation = this.navigationSource.asObservable();

  announceNavigation(origin: any) {
    this.navigationSource.next(origin);
  }
}
