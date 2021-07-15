import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject } from 'rxjs';

import { ActivityPollingService, ActivityService, ActivitySocketService, SessionStorageService } from '../../services';
import { Utils } from '../../services/activity/utils';
import { CaseActivityComponent } from './case-activity.component';

import createSpyObj = jasmine.createSpyObj;

const ActivityIconComponent: any = MockComponent({
  selector: 'ccd-activity-icon',
  inputs: ['description', 'imageLink']
});

const ActivityBannerComponent: any = MockComponent({
  selector: 'ccd-activity-banner',
  inputs: ['description', 'imageLink', 'bannerType']
});

xdescribe('CaseActivityComponent', () => {
  const MOCK_USER = { id: 'abcdefg123456', forename: 'Bob', surname: 'Smith' };
  let component: CaseActivityComponent;
  let fixture: ComponentFixture<CaseActivityComponent>;
  let activityService: any;
  let activityPollingService: any;
  let activitySocketService: any;
  let sessionStorageService: any;

  beforeEach(() => {
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify(MOCK_USER));
    activitySocketService = {
      watching: [],
      isEnabled: true,
      watchCases: (caseIds: string[]): void => {
        activitySocketService.watching.push(caseIds);
      },
      user: MOCK_USER
    };
    activityService = createSpyObj<ActivityService>('activityService', ['postActivity']);
    activityService.modeSubject = new BehaviorSubject<string>(Utils.MODES.socket);
    activityPollingService = createSpyObj<any>('activityPollingService',
      ['subscribeToActivity', 'unsubscribeFromActivity']);
    activityPollingService.subscribeToActivity.and.returnValue();
    activityPollingService.unsubscribeFromActivity.and.returnValue();
    activityPollingService.isEnabled = true;

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          CaseActivityComponent,
          // Mocks
          ActivityIconComponent,
          ActivityBannerComponent
        ],
        providers: [
          { provide: ActivityService, useValue: activityService },
          { provide: ActivityPollingService, useValue: activityPollingService },
          { provide: ActivitySocketService, useValue: activitySocketService }
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(CaseActivityComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  });

  it(`shouldn't fall over`, () => {
    expect(component).toBeTruthy();
  });

  // TODO: Add some ACTUAL tests in here and remove the nonsense one above.
});
