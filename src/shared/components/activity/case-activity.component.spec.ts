import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';

import { Activity, CaseActivityInfo, User } from '../../domain';
import { ActivityPollingService, ActivityService, ActivitySocketService } from '../../services';
import { MODES, Utils } from '../../services/activity/utils';
import { ActivityBannerComponent } from './activity-banner';
import { ActivityIconComponent } from './activity-icon';
import { CaseActivityComponent } from './case-activity.component';

describe('CaseActivityComponent', () => {
  const BOB_SMITH = { id: 'BS', forename: 'Bob', surname: 'Smith' };
  const JOE_BLOGGS = { id: 'JB', forename: 'Joe', surname: 'Bloggs', };
  const CASE_ID = 'bob';
  let component: CaseActivityComponent;
  let fixture: ComponentFixture<CaseActivityComponent>;
  let activityService: any;
  let activityPollingService: any;
  let activitySocketService: any;
  let pollingActivitySubject: Subject<Activity>;

  const getActivity = (caseId: string, editors: User[], viewers: User[]): Activity | CaseActivityInfo => {
    return { caseId, editors, viewers, unknownViewers: 0, unknownEditors: 0 };
  };

  beforeEach(() => {
    activitySocketService = {
      watching: [],
      isEnabled: true,
      activity: new BehaviorSubject<CaseActivityInfo[]>([]),
      watchCases: (caseIds: string[]): void => {
        activitySocketService.watching.push(caseIds);
      },
      user: BOB_SMITH
    };
    activityService = jasmine.createSpyObj<ActivityService>('activityService', ['postActivity']);
    activityService.modeSubject = new BehaviorSubject<string>(undefined);
    pollingActivitySubject = new Subject<Activity>();
    activityPollingService = jasmine.createSpyObj<any>('activityPollingService', ['stopPolling']);
    activityPollingService.subscribeToActivity = (caseId: string, done: (activity: Activity) => void): Subject<Activity> => {
      pollingActivitySubject.subscribe(activity => {
        if (activity) {
          if (activity.caseId === caseId) {
            done(activity);
          }
        } else {
          done(activity);
        }
      });
      return pollingActivitySubject;
    };
    activityPollingService.isEnabled = true;

    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        CaseActivityComponent,
        ActivityIconComponent,
        ActivityBannerComponent
      ],
      providers: [
        { provide: ActivityService, useValue: activityService },
        { provide: ActivityPollingService, useValue: activityPollingService },
        { provide: ActivitySocketService, useValue: activitySocketService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseActivityComponent);
    component = fixture.componentInstance;
    component.caseId = CASE_ID;
    component.iconOnly = false;
    fixture.detectChanges();
  });

  it(`shouldn't set up any subjects or subscriptions by default`, () => {
    expect(component['pollingSubject']).toBeUndefined();
    expect(component['socketSubscription']).toBeUndefined();
  });

  describe('when the activity mode is set to "socket"', () => {
    beforeEach(() => {
      activityService.modeSubject.next(MODES.socket);
      fixture.detectChanges();
    });

    it('should set up the socket subscription but not the polling subject ', () => {
      expect(component['pollingSubject']).toBeUndefined();
      expect(component['socketSubscription']).toBeDefined();
    });
    it('should not show anything with no activity set', () => {
      const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
      expect(outerDiv).toBeNull();
    });

    describe('when there is activity', () => {
      it('should not show anything when there are no viewers or editors', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [], [])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
      it('should show a view banner when there is a viewer on the current case', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [], [JOE_BLOGGS])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).not.toBeNull();
        expect(outerDiv.nativeElement.textContent).toContain(Utils.DESCRIPTIONS.VIEWERS_SUFFIX);
        expect(outerDiv.nativeElement.textContent).toContain('Joe Bloggs');
        const activityBanner = fixture.debugElement.query(By.css('.activity-banner'));
        expect(activityBanner).not.toBeNull();
        const caseLockedDiv = fixture.debugElement.query(By.css('.case-locked'));
        expect(caseLockedDiv).toBeNull();
        const activityIcon = fixture.debugElement.query(By.css('.activity-icon'));
        expect(activityIcon).toBeNull();
      });
      it('should not show anything when the viewer is the current user', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [], [BOB_SMITH])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
      it('should show an edit banner when there is a editor on the current case', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [JOE_BLOGGS], [])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).not.toBeNull();
        expect(outerDiv.nativeElement.textContent).toContain(Utils.DESCRIPTIONS.EDITORS_PREFIX);
        expect(outerDiv.nativeElement.textContent).toContain('Joe Bloggs');
        const caseLockedDiv = fixture.debugElement.query(By.css('.case-locked'));
        expect(caseLockedDiv).not.toBeNull();
      });
      it('should not show anything when the editor is the current user', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [BOB_SMITH], [])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
      it('should not show anything when the activity is on a different case', () => {
        activitySocketService.activity.next([getActivity('different_case', [], [JOE_BLOGGS])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
      it('should show a view icon when there is a viewer on the current case in iconOnly mode', () => {
        component.iconOnly = true;
        activitySocketService.activity.next([getActivity(CASE_ID, [], [JOE_BLOGGS])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).not.toBeNull();
        expect(outerDiv.nativeElement.textContent).toContain(Utils.DESCRIPTIONS.VIEWERS_SUFFIX);
        expect(outerDiv.nativeElement.textContent).toContain('Joe Bloggs');
        const activityBanner = fixture.debugElement.query(By.css('.activity-banner'));
        expect(activityBanner).toBeNull();
        const caseLockedDiv = fixture.debugElement.query(By.css('.case-locked'));
        expect(caseLockedDiv).toBeNull();
        const activityIcon = fixture.debugElement.query(By.css('.activity-icon'));
        expect(activityIcon).not.toBeNull();
      });
      it('should show an edit icon when there is an editor on the current case in iconOnly mode', () => {
        component.iconOnly = true;
        activitySocketService.activity.next([getActivity(CASE_ID, [], [JOE_BLOGGS])]);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).not.toBeNull();
        expect(outerDiv.nativeElement.textContent).toContain(Utils.DESCRIPTIONS.VIEWERS_SUFFIX);
        expect(outerDiv.nativeElement.textContent).toContain('Joe Bloggs');
        const activityBanner = fixture.debugElement.query(By.css('.activity-banner'));
        expect(activityBanner).toBeNull();
        const caseLockedDiv = fixture.debugElement.query(By.css('.editors-only'));
        expect(caseLockedDiv).toBeNull();
        const activityIcon = fixture.debugElement.query(By.css('.activity-icon'));
        expect(activityIcon).not.toBeNull();
      });
    });

    describe('when there is no activity', () => {
      it('should not show anything when the activity is null', () => {
        activitySocketService.activity.next(null);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
    });
  });

  describe('when the activity mode is set to "polling"', () => {
    beforeEach(() => {
      activityService.modeSubject.next(MODES.polling);
      fixture.detectChanges();
    });

    it('should set up the socket subscription but not the polling subject ', () => {
      expect(component['pollingSubject']).toBeDefined();
      expect(component['socketSubscription']).toBeUndefined();
    });
    it('should not show anything with no activity set', () => {
      const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
      expect(outerDiv).toBeNull();
    });

    describe('when there is activity', () => {
      it('should not show anything when there are no viewers or editors', () => {
        pollingActivitySubject.next(getActivity(CASE_ID, [], []));
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
      it('should show a view banner when there is a viewer on the current case', () => {
        pollingActivitySubject.next(getActivity(CASE_ID, [], [JOE_BLOGGS]));
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).not.toBeNull();
        expect(outerDiv.nativeElement.textContent).toContain(Utils.DESCRIPTIONS.VIEWERS_SUFFIX);
        expect(outerDiv.nativeElement.textContent).toContain('Joe Bloggs');
        const caseLockedDiv = fixture.debugElement.query(By.css('.case-locked'));
        expect(caseLockedDiv).toBeNull();
      });
      it('should show an edit banner when there is a editor on the current case', () => {
        pollingActivitySubject.next(getActivity(CASE_ID, [JOE_BLOGGS], []));
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).not.toBeNull();
        expect(outerDiv.nativeElement.textContent).toContain(Utils.DESCRIPTIONS.EDITORS_PREFIX);
        expect(outerDiv.nativeElement.textContent).toContain('Joe Bloggs');
        const caseLockedDiv = fixture.debugElement.query(By.css('.case-locked'));
        expect(caseLockedDiv).not.toBeNull();
      });
      it('should not show anything when the activity is on a different case', () => {
        pollingActivitySubject.next(getActivity('different_case', [], [JOE_BLOGGS]));
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
    });

    describe('when there is no activity', () => {
      it('should not show anything when the activity is null', () => {
        pollingActivitySubject.next(null);
        fixture.detectChanges();
        const outerDiv = fixture.debugElement.query(By.css('.activity-component'));
        expect(outerDiv).toBeNull();
      });
    });
  });
});
