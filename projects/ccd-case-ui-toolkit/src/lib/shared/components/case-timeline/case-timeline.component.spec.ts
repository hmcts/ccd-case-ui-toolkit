import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { CaseView, CaseViewEvent, HttpError } from '../../domain';
import { AlertService } from '../../services';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { CaseNotifier, CasesService } from '../case-editor';
import { CaseTimelineComponent, CaseTimelineDisplayMode } from './case-timeline.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseTimelineComponent', () => {
  const CASE_EVENTS: CaseViewEvent[] = [
    {
      id: 5,
      timestamp: '2017-05-10T10:00:00.000',
      summary: 'Case updated again!',
      comment: 'Latest update',
      event_id: 'updateCase',
      event_name: 'Update a case',
      state_id: 'CaseUpdated',
      state_name: 'Case Updated',
      user_id: 0,
      user_last_name: 'smith',
      user_first_name: 'justin',
      significant_item: {
        type: 'DOCUMENT',
        description: 'First document description',
        url: 'https://google.com'
      }
    },
    {
      id: 4,
      timestamp: '2017-05-09T16:07:03.973',
      summary: 'Case updated!',
      comment: 'Plop plop',
      event_id: 'updateCase',
      event_name: 'Update a case',
      state_id: 'CaseUpdated',
      state_name: 'Case Updated',
      user_id: 0,
      user_last_name: 'chan',
      user_first_name: 'phillip',
      significant_item: {
        type: 'NON-DOCUMENT',
        description: 'Second document description',
        url: 'https://google.com'
      }
    }
  ];
  const CASE_REFERENCE = '1234123412341234';
  const CASE_VIEW: CaseView = {
    case_id: CASE_REFERENCE,
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test',
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [],
    triggers: [],
    events: CASE_EVENTS
  };
  const CASE_VIEW_OBS: Observable<CaseView> = of(CASE_VIEW);

  let eventLogComponentMock;
  let caseHistoryComponentMock;
  let caseNotifier;
  let casesService;
  let alertService: any;

  let fixture: ComponentFixture<CaseTimelineComponent>;
  let component: CaseTimelineComponent;
  let de: DebugElement;
  casesService = createSpyObj('casesService', ['getCaseViewV2']);
  eventLogComponentMock = MockComponent({ selector: 'ccd-event-log', inputs: [
    'events'
  ]});

  caseHistoryComponentMock = MockComponent({ selector: 'ccd-case-history', inputs: [
    'event'
  ]});

  describe('CaseTimelineComponent successfully resolves case view', () => {
    const $BACK_TO_TIMELINE_LINK = By.css('div>div>ol>li>a');

    beforeEach(async() => {
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      casesService.getCaseViewV2.and.returnValue(CASE_VIEW_OBS);

      alertService = createSpyObj('alertService', ['error']);
      alertService.error.and.returnValue(of({}));

      caseNotifier = new CaseNotifier(casesService);
      caseNotifier.caseView = new BehaviorSubject(CASE_VIEW).asObservable();

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            CaseTimelineComponent,
            MockRpxTranslatePipe,
            // Mocks
            eventLogComponentMock,
            caseHistoryComponentMock,
            MockRpxTranslatePipe
          ],
          providers: [
            { provide: CaseNotifier, useValue: caseNotifier },
            { provide: CasesService, useValue: casesService },
            { provide: AlertService, useValue: alertService }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseTimelineComponent);
      component = fixture.componentInstance;
      component.case = CASE_REFERENCE;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should render in case timeline view mode as default', () => {
      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_REFERENCE);
      expect(component.events).toEqual(CASE_EVENTS);
      expect(component.displayMode).toEqual(CaseTimelineDisplayMode.TIMELINE);

      const eventLogDe = de.query(By.directive(eventLogComponentMock));

      expect(eventLogDe).toBeDefined();
      const eventLogComponent = eventLogDe.componentInstance;
      expect(eventLogComponent.events).toEqual(CASE_EVENTS);

      const caseHistoryDetailsDe = de.query(By.directive(caseHistoryComponentMock));

      expect(caseHistoryDetailsDe).toBeNull();
    });

    it('should change view mode to case history details', () => {
      expect(component.displayMode).toEqual(CaseTimelineDisplayMode.TIMELINE);
      component.caseHistoryClicked('5');
      expect(component.displayMode).toEqual(CaseTimelineDisplayMode.DETAILS);
      expect(component.selectedEventId).toEqual('5');

      fixture.detectChanges();

      const link = de.query($BACK_TO_TIMELINE_LINK);
      expect(link.nativeElement.textContent).toBe(' Back to case timeline ');

      const caseHistoryDe = de.query(By.directive(caseHistoryComponentMock));
      expect(caseHistoryDe).toBeDefined();
      const caseHistoryComponent = caseHistoryDe.componentInstance;
      expect(caseHistoryComponent.event).toEqual('5');

      const eventLogDe = de.query(By.directive(eventLogComponentMock));
      expect(eventLogDe).toBeNull();
    });

    it('should change view mode to case timeline if on case details and back to timeline button clicked', () => {
      component.caseHistoryClicked('5');
      expect(component.displayMode).toEqual(CaseTimelineDisplayMode.DETAILS);
      expect(component.selectedEventId).toEqual('5');
      fixture.detectChanges();

      component.goToCaseTimeline();
      fixture.detectChanges();

      const caseHistoryDetailsDe = de.query(By.directive(caseHistoryComponentMock));
      expect(caseHistoryDetailsDe).toBeNull();

      const eventLogDe = de.query(By.directive(eventLogComponentMock));
      expect(eventLogDe).toBeDefined();
      const eventLogComponent = eventLogDe.componentInstance;
      expect(eventLogComponent.events).toEqual(CASE_EVENTS);
    });
  });

  describe('CaseTimelineComponent fails to resolve case view', () => {
    const ERROR_MSG = 'Critical error!';

    beforeEach(async() => {
      eventLogComponentMock = MockComponent({ selector: 'ccd-event-log', inputs: [
        'events'
      ]});

      const ERROR: HttpError = new HttpError();
      ERROR.message = ERROR_MSG;
      const ERROR_OBS: Observable<HttpError> = throwError(ERROR);

      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      casesService.getCaseViewV2.and.returnValue(ERROR_OBS);

      alertService = createSpyObj('alertService', ['error']);
      alertService.error.and.returnValue(of({}));

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            CaseTimelineComponent,
            // Mocks
            MockRpxTranslatePipe,
            eventLogComponentMock,
            caseHistoryComponentMock
          ],
          providers: [
            { provide: CaseNotifier, useValue: caseNotifier },
            { provide: CasesService, useValue: casesService },
            { provide: AlertService, useValue: alertService }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseTimelineComponent);
      component = fixture.componentInstance;
      component.case = CASE_REFERENCE;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should call alert service and not render event log component', () => {
      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_REFERENCE);
      const eventLogDe = de.query(By.directive(eventLogComponentMock));

      expect(eventLogDe).toBeNull();
      expect(alertService.error).toHaveBeenCalledWith({ phrase: ERROR_MSG });
      expect(component.events).toBeUndefined();
    });
  });
});
