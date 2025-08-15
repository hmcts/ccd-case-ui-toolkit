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

  const checkHidden = (): void => {
    fixture.detectChanges();
    const div = fixture.debugElement.query(By.css('.activity-component'));
    expect(div).toBeNull();
  };

  const checkShown = (expectedTexts: string[]): void => {
    fixture.detectChanges();
    const div = fixture.debugElement.query(By.css('.activity-component'));
    expect(div).not.toBeNull();
    expectedTexts.forEach(text => {
      expect(div.nativeElement.textContent).toContain(text);
    });
  };

  const checkLock = (expected: boolean): void => {
    const caseLockedDiv = fixture.debugElement.query(By.css('.case-locked'));
    if (expected) {
      expect(caseLockedDiv).not.toBeNull();
    } else {
      expect(caseLockedDiv).toBeNull();
    }
  };

  const checkMode = (mode: string): void => {
    const banner = fixture.debugElement.query(By.css('.activity-banner'));
    const icon = fixture.debugElement.query(By.css('.activity-icon'));
    if (mode === 'banner') {
      expect(banner).not.toBeNull();
      expect(icon).toBeNull();
    } else {
      expect(banner).toBeNull();
      expect(icon).not.toBeNull();
    }
  }

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
      checkHidden();
    });

    describe('when there is activity', () => {
      it('should not show anything when there are no viewers or editors', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [], [])]);
        checkHidden();
      });
      it('should show a view banner when there is a viewer on the current case', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [], [JOE_BLOGGS])]);
        checkShown([Utils.DESCRIPTIONS.VIEWERS_SUFFIX, 'Joe Bloggs']);
        checkMode('banner');
        checkLock(false);
      });
      it('should not show anything when the viewer is the current user', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [], [BOB_SMITH])]);
        checkHidden();
      });
      it('should show an edit banner when there is an editor on the current case', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [JOE_BLOGGS], [])]);
        checkShown([Utils.DESCRIPTIONS.EDITORS_PREFIX, 'Joe Bloggs']);
        checkLock(true);
      });
      it('should not show anything when the editor is the current user', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [BOB_SMITH], [])]);
        checkHidden();
      });
      it('should not show anything when the activity is on a different case', () => {
        activitySocketService.activity.next([getActivity('different_case', [], [JOE_BLOGGS])]);
        checkHidden();
      });
      it('should not change state when the activity is about a different case', () => {
        activitySocketService.activity.next([getActivity(CASE_ID, [JOE_BLOGGS], [])]);
        checkShown([Utils.DESCRIPTIONS.EDITORS_PREFIX, 'Joe Bloggs']);
        checkLock(true);

        // Now fire in some activity it doesn't care about.
        activitySocketService.activity.next([getActivity('different_case', [], [BOB_SMITH])]);
        checkShown([Utils.DESCRIPTIONS.EDITORS_PREFIX, 'Joe Bloggs']);
        checkLock(true);
      });
      it('should show a view icon when there is a viewer on the current case in iconOnly mode', () => {
        component.iconOnly = true;
        activitySocketService.activity.next([getActivity(CASE_ID, [], [JOE_BLOGGS])]);
        checkShown([Utils.DESCRIPTIONS.VIEWERS_SUFFIX, 'Joe Bloggs']);
        checkLock(false);
        checkMode('icon');
      });
      it('should show an edit icon when there is an editor on the current case in iconOnly mode', () => {
        component.iconOnly = true;
        activitySocketService.activity.next([getActivity(CASE_ID, [], [JOE_BLOGGS])]);
        checkShown([Utils.DESCRIPTIONS.VIEWERS_SUFFIX, 'Joe Bloggs']);
        checkMode('icon');
        const editorsOnly = fixture.debugElement.query(By.css('.editors-only'));
        expect(editorsOnly).toBeNull();
      });
    });

    describe('when there is no activity', () => {
      it('should not show anything when the activity is null', () => {
        activitySocketService.activity.next(null);
        checkHidden();
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
      checkHidden();
    });

    describe('when there is activity', () => {
      it('should not show anything when there are no viewers or editors', () => {
        pollingActivitySubject.next(getActivity(CASE_ID, [], []));
        checkHidden();
      });
      it('should show a view banner when there is a viewer on the current case', () => {
        pollingActivitySubject.next(getActivity(CASE_ID, [], [JOE_BLOGGS]));
        checkShown([Utils.DESCRIPTIONS.VIEWERS_SUFFIX, 'Joe Bloggs']);
        checkLock(false);
      });
      it('should show an edit banner when there is a editor on the current case', () => {
        pollingActivitySubject.next(getActivity(CASE_ID, [JOE_BLOGGS], []));
        checkShown([Utils.DESCRIPTIONS.EDITORS_PREFIX, 'Joe Bloggs']);
        checkLock(true);
      });
      it('should not show anything when the activity is on a different case', () => {
        pollingActivitySubject.next(getActivity('different_case', [], [JOE_BLOGGS]));
        checkHidden();
      });
    });

    describe('when there is no activity', () => {
      it('should not show anything when the activity is null', () => {
        pollingActivitySubject.next(null);
        checkHidden();
      });
    });
  });
});
