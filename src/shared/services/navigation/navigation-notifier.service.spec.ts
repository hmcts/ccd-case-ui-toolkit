import { NavigationNotifierService } from './navigation-notifier.service';
import { NavigationOrigin } from './navigation-origin.model';
import createSpyObj = jasmine.createSpyObj;
import { BehaviorSubject } from 'rxjs';

describe('NavigationNotifierService', () => {
  let navigationNotifierService: NavigationNotifierService;
  let myObservable: any;
  let spyNavigationSource: BehaviorSubject<any>;

  beforeEach(() => {
    navigationNotifierService = new NavigationNotifierService();
    myObservable = createSpyObj('myObservable', ['next']);
    spyNavigationSource = createSpyObj<BehaviorSubject<any>>('navigationSource', ['asObservable', 'next']);
    navigationNotifierService.navigationSource = spyNavigationSource;
  });

  it('should map simple error to associated form control', () => {
    let origin = {action: NavigationOrigin.DRAFT_DELETED};
    navigationNotifierService.announceNavigation(origin);
    expect(spyNavigationSource.next).toHaveBeenCalledWith(origin);
  });
});
