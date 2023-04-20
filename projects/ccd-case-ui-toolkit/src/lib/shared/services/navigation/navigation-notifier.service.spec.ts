import createSpyObj = jasmine.createSpyObj;
import { waitForAsync } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { NavigationNotifierService } from './navigation-notifier.service';
import { NavigationOrigin } from './navigation-origin.model';

describe('NavigationNotifierService', () => {
  let navigationNotifierService: NavigationNotifierService;
  let myObservable: any;
  let spyNavigationSource: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    navigationNotifierService = new NavigationNotifierService();
    myObservable = createSpyObj('myObservable', ['next']);
    spyNavigationSource = createSpyObj<BehaviorSubject<any>>('navigationSource', ['asObservable', 'next']);
    navigationNotifierService.navigationSource = spyNavigationSource;
  }));

  it('should map simple error to associated form control', () => {
    const origin = {action: NavigationOrigin.DRAFT_DELETED};
    navigationNotifierService.announceNavigation(origin);
    expect(spyNavigationSource.next).toHaveBeenCalledWith(origin);
  });
});
