import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseEventTriggerComponent } from './case-event-trigger.component';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CaseEventData, CaseEventTrigger, CaseField, CaseView, HttpError } from '../../../domain';
import { createCaseEventTrigger } from '../../../fixture';
import { CaseService, CasesService } from '../../case-editor';
import { CaseReferencePipe } from '../../../pipes';
import { ActivityPollingService, AlertService } from '../../../services';
import createSpyObj = jasmine.createSpyObj;

describe('CaseEventTriggerComponent', () => {
  const PAGE_ID = 'pageId';
  const CASE_DETAILS: CaseView = new CaseView();
  CASE_DETAILS.case_id = '42';
  CASE_DETAILS.case_type = {
    id: 'TEST_CASE_TYPE',
    name: 'Test Case Type',
    jurisdiction: {
      id: 'TEST',
      name: 'Test'
    }
  };
  CASE_DETAILS.case_type.id = 'TEST_CASE_TYPE';
  CASE_DETAILS.case_type.jurisdiction.id = 'TEST';

  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    'TEST_TRIGGER',
    'Test Trigger',
    '3',
    true,
    [
      <CaseField>({
        id: 'PersonFirstName',
        label: 'First name',
        field_type: null,
        display_context: 'READONLY'
      }),
      <CaseField>({
        id: 'PersonLastName',
        label: 'Last name',
        field_type: null,
        display_context: 'OPTIONAL'
      })
    ]
  );

  const SANITISED_EDIT_FORM: CaseEventData = {
    data: {
      'PersonLastName': 'Khaleesi'
    },
    event: {
      id: EVENT_TRIGGER.id,
      summary: 'Some summary',
      description: 'Some description',
    },
    event_token: 'cbcdcbdh',
    ignore_warning: false
  };

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let fixture: ComponentFixture<CaseEventTriggerComponent>;
  let component: CaseEventTriggerComponent;
  let de: DebugElement;

  let CaseEditComponent: any = MockComponent({
    selector: 'ccd-case-edit',
    inputs: ['eventTrigger', 'submit', 'validate', 'caseDetails', 'saveDraft'],
    outputs: ['cancelled', 'submitted']
  });

  let CaseActivityComponent: any = MockComponent({
    selector: 'ccd-activity',
    inputs: ['caseId', 'displayMode']
  });

  let CaseHeaderComponent: any = MockComponent({
    selector: 'ccd-case-header',
    inputs: ['caseDetails']
  });

  let EventTriggerHeaderComponent: any = MockComponent({
    selector: 'ccd-event-trigger-header',
    inputs: ['eventTrigger']
  });

  let FieldRead: any = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField']
  });

  let FieldWrite: any = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'formGroup', 'idPrefix', 'isExpanded']
  });

  const RouterLinkComponent: any = MockComponent({
    selector: 'a'
  });

  let URL_SEGMENTS: UrlSegment[] = [
    new UrlSegment('a', {}),
    new UrlSegment('b', {})
  ];

  let URL_SEGMENTS_OBS: Observable<UrlSegment[]> = Observable.of(URL_SEGMENTS);

  let mockRoute: any = {
    snapshot: {
      data: {
        case: CASE_DETAILS,
        eventTrigger: EVENT_TRIGGER
      }
    },
    parent: {
      url: URL_SEGMENTS_OBS
    }
  };

  let router: any;
  let alertService: any;
  let caseService: any;
  let casesService: any;
  let casesReferencePipe: any;
  let activityPollingService: any;

  beforeEach(async(() => {
    caseService = createSpyObj<CaseService>('caseService', ['announceCase']);
    casesService = createSpyObj<CasesService>('casesService', ['createEvent', 'validateCase']);
    casesService.createEvent.and.returnValue(Observable.of());
    casesService.validateCase.and.returnValue(Observable.of());

    casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);

    alertService = createSpyObj<AlertService>('alertService', ['success', 'warning']);
    activityPollingService = createSpyObj<ActivityPollingService>('activityPollingService', ['postEditActivity']);
    activityPollingService.postEditActivity.and.returnValue(Observable.of());
    router = createSpyObj('router', ['navigate']);
    router.navigate.and.returnValue({then: f => f()});

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule
        ],
        declarations: [
          CaseEditComponent,
          CaseEventTriggerComponent,

          // Mock
          CaseActivityComponent,
          CaseHeaderComponent,
          EventTriggerHeaderComponent,
          RouterLinkComponent,
          FieldRead,
          FieldWrite,
          CaseReferencePipe
        ],
        providers: [
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: CaseService, useValue: caseService },
          { provide: CasesService, useValue: casesService },
          { provide: Router, useValue: router },
          { provide: AlertService, useValue: alertService },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivityPollingService, useValue: activityPollingService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseEventTriggerComponent);
    component = fixture.componentInstance;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should edit case with sanitised data when form submitted', () => {
    component.submit()(SANITISED_EDIT_FORM);

    expect(casesService.createEvent).toHaveBeenCalledWith(CASE_DETAILS, SANITISED_EDIT_FORM);
  });

  it('should edit case with sanitised data when form validated', () => {
    component.validate()(SANITISED_EDIT_FORM, PAGE_ID);

    expect(casesService.validateCase).toHaveBeenCalledWith(CASE_DETAILS.case_type.id, SANITISED_EDIT_FORM, PAGE_ID);
  });

  it('should navigate to case view upon successful event creation', () => {
    casesService.createEvent.and.returnValue(Observable.of({}));

    component.submitted({caseId: 123});

    expect(router.navigate).toHaveBeenCalledWith(['/' + URL_SEGMENTS[0].path + '/' + URL_SEGMENTS[1].path],
      { queryParams: { onErrorCaseList: true } });
  });

  it('should alert success message after navigation upon successful event creation', () => {
    casesService.createEvent.and.returnValue(Observable.of({}));

    component.submitted({caseId: 123});

    expect(alertService.success).toHaveBeenCalled();
  });

  it('should alert success message after navigation upon successful event creation and call back', () => {
    casesService.createEvent.and.returnValue(Observable.of({}));

    component.submitted({caseId: 123, status: 'happy'});

    expect(alertService.success).toHaveBeenCalled();
  });

  it('should alert warning message after navigation upon successful event creation but incomplete call back', () => {
    casesService.createEvent.and.returnValue(Observable.of({}));

    component.submitted({caseId: 123, status: 'INCOMPLETE_CALLBACK'});

    expect(alertService.warning).toHaveBeenCalled();
  });

  it('should have a cancel button going back to the create case', () => {
    component.cancel();

    expect(router.navigate).toHaveBeenCalledWith(['/' + URL_SEGMENTS[0].path + '/' + URL_SEGMENTS[1].path]);
  });
});
