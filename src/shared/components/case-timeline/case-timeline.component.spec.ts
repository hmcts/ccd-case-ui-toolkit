import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { By } from '@angular/platform-browser';
import { CaseViewEvent, CaseView, HttpError } from '../../domain';
import { CaseTimelineComponent } from './case-timeline.component';
import { Observable, throwError } from 'rxjs';
import { CasesService } from '../case-editor';
import createSpyObj = jasmine.createSpyObj;
import { AlertService } from '../../services';

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
  const CASE_VIEW: CaseView = {
    case_id: '1',
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
  const CASE_VIEW_OBS: Observable<CaseView> = Observable.of(CASE_VIEW);

  let EventLogComponent;
  let casesService;
  let alertService: any;

  let fixture: ComponentFixture<CaseTimelineComponent>;
  let component: CaseTimelineComponent;
  let de: DebugElement;

  describe('CaseTimelineComponent successfully resolves case view', () => {
    beforeEach(async(() => {

      EventLogComponent = MockComponent({ selector: 'ccd-event-log', inputs: [
        'events'
      ]});

      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      casesService.getCaseViewV2.and.returnValue(CASE_VIEW_OBS);

      alertService = createSpyObj('alertService', ['error']);
      alertService.error.and.returnValue(Observable.of({}));

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            CaseTimelineComponent,

            // Mocks
            EventLogComponent
          ],
          providers: [
            { provide: CasesService, useValue: casesService },
            { provide: AlertService, useValue: alertService },
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseTimelineComponent);
      component = fixture.componentInstance;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render case history component', () => {
      let eventLogDe = de.query(By.directive(EventLogComponent));

      expect(eventLogDe).toBeDefined();

      let eventLogComponent = eventLogDe.componentInstance;
      expect(eventLogComponent.events).toEqual(CASE_EVENTS);
      expect(component.events).toEqual(CASE_EVENTS);
    });
  });

  describe('CaseTimelineComponent fails to resolve case view', () => {

    const ERROR_MSG = 'Critical error!';

    beforeEach(async(() => {

      EventLogComponent = MockComponent({ selector: 'ccd-event-log', inputs: [
        'events'
      ]});

      const ERROR: HttpError = new HttpError();
      ERROR.message = ERROR_MSG;
      const ERROR_OBS: Observable<HttpError> = throwError(ERROR);
      casesService.getCaseViewV2.and.returnValue(ERROR_OBS);

      alertService = createSpyObj('alertService', ['error']);

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            CaseTimelineComponent,

            // Mocks
            EventLogComponent
          ],
          providers: [
            { provide: CasesService, useValue: casesService },
            { provide: AlertService, useValue: alertService },
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseTimelineComponent);
      component = fixture.componentInstance;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should call alert service and not render event log component', () => {
      let eventLogDe = de.query(By.directive(EventLogComponent));

      expect(eventLogDe).toBeNull();
      expect(alertService.error).toHaveBeenCalledWith(ERROR_MSG);
      expect(component.events).toBeUndefined();

    });
  });
});
