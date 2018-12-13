import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import createSpyObj = jasmine.createSpyObj;
import { CasesService } from '../services/cases.service';
import { CaseCreateComponent } from './case-create.component';
import { CaseEventTrigger, DRAFT_PREFIX } from '../../../domain';
import { createCaseEventTrigger } from '../../../fixture/shared.fixture';
import { DraftService } from '../../../services/draft';
import { AlertService } from '../../../services/alert';
import { of, Observable, throwError } from 'rxjs';
import { HttpError } from '../../../domain/http';
import { MockComponent } from 'ng2-mock-component';
import { EventTriggerService } from '../services/event-trigger.service';
import { CaseDetails } from '../../../domain/case-details.model';
import { CaseEventData } from '../../../domain/case-event-data.model';

let CaseEditComponent: any = MockComponent({
  selector: 'ccd-case-edit',
  inputs: ['eventTrigger', 'submit', 'validate', 'caseDetails', 'saveDraft'],
  outputs: ['cancelled', 'submitted']
});

describe('CaseCreateComponent event trigger resolved and draft does not exist', () => {

  const JID_UNDEFINED = undefined;
  const ETID = 'TEST_TRIGGER';
  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    ETID,
    'Test Trigger',
    undefined,
    false,
    [
      {
        id: 'PersonFirstName',
        label: 'First name',
        field_type: null,
        display_context: 'READONLY'
      },
      {
        id: 'PersonLastName',
        label: 'Last name',
        field_type: null,
        display_context: 'OPTIONAL'
      }
    ],
    [],
    true
  );

  const EVENT_TRIGGER_OB = of(EVENT_TRIGGER);

  const PAGE_ID = 'pageId';
  const JID = 'PROBATE';
  const CTID = 'ComplexTestType';
  const CREATED_CASE: CaseDetails = {
    id: '1234567890123456',
    jurisdiction: JID,
    case_type_id: CTID,
    state: 'CaseCreated'
  };
  const CREATED_CASE_OBS: Observable<CaseDetails> = Observable.of(CREATED_CASE);

  const SANITISED_EDIT_FORM: CaseEventData = {
    data: {
      'PersonLastName': 'Khaleesi'
    },
    event: {
      id: null,
      summary: 'Some summary',
      description: 'Some description'
    },
    event_token: 'test-token',
    ignore_warning: false
  };

  let fixture: ComponentFixture<CaseCreateComponent>;
  let component: CaseCreateComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let draftService: any;
  let alertService: any;
  let eventTriggerService: any;

  beforeEach(async(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'createCase', 'validateCase']);
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OB);
    draftService = createSpyObj('draftsService', ['createOrUpdateDraft']);
    alertService = createSpyObj('alertService', ['error']);
    eventTriggerService = createSpyObj('eventTriggerService', ['announceEventTrigger']);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
          CaseEditComponent,
          CaseCreateComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: EventTriggerService, useValue: eventTriggerService },
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(CaseCreateComponent);
      component = fixture.componentInstance;
      component.jurisdiction = JID;
      component.caseType = CTID;
      component.event = ETID;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
  }));

  it('should get event trigger on loading and announce it', () => {
    expect(casesService.getEventTrigger).toHaveBeenCalledWith(CTID, ETID);
    expect(eventTriggerService.announceEventTrigger).toHaveBeenCalledWith(EVENT_TRIGGER);
  });

  it('should emit submitted event when submitted emitter is called', () => {
    component.ngOnInit();

    let event = {id: 1, name: 'name'};
    component.emitSubmitted(event);
    expect(submitHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should emit cancelled event when cancelled emitter is called', () => {
    component.ngOnInit();

    let event = {id: 1, name: 'name'};
    component.emitCancelled(event);
    expect(cancelHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should create case with sanitised data when form submitted', () => {
    casesService.createCase.and.returnValue(CREATED_CASE_OBS);
    component.submit()(SANITISED_EDIT_FORM);

    expect(casesService.createCase).toHaveBeenCalledWith(JID, CTID, SANITISED_EDIT_FORM);
  });

  it('should validate case details with sanitised data when validated', () => {
    casesService.validateCase.and.returnValue(CREATED_CASE_OBS);
    component.validate()(SANITISED_EDIT_FORM, PAGE_ID);

    expect(casesService.validateCase).toHaveBeenCalledWith(CTID, SANITISED_EDIT_FORM, PAGE_ID);
  });

  it('should create a draft when saveDraft called with sanitised data', () => {
    component.saveDraft()(SANITISED_EDIT_FORM);

    expect(draftService.createOrUpdateDraft).toHaveBeenCalledWith(JID, CTID, undefined, SANITISED_EDIT_FORM);
  });

});

describe('CaseCreateComponent event trigger resolved and draft does exist', () => {

  const ETID = 'TEST_TRIGGER';
  const DRAFT_ID = '12345';
  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    ETID,
    'Test Trigger',
    DRAFT_PREFIX + DRAFT_ID,
    false,
    [
      {
        id: 'PersonFirstName',
        label: 'First name',
        field_type: null,
        display_context: 'READONLY'
      },
      {
        id: 'PersonLastName',
        label: 'Last name',
        field_type: null,
        display_context: 'OPTIONAL'
      }
    ],
    [],
    true
  );

  const EVENT_TRIGGER_OB = of(EVENT_TRIGGER);

  const JID = 'PROBATE';
  const CTID = 'ComplexTestType';

  const SANITISED_EDIT_FORM: CaseEventData = {
    data: {
      'PersonLastName': 'Khaleesi'
    },
    event: {
      id: null,
      summary: 'Some summary',
      description: 'Some description'
    },
    event_token: 'test-token',
    ignore_warning: false
  };

  let fixture: ComponentFixture<CaseCreateComponent>;
  let component: CaseCreateComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let draftService: any;
  let alertService: any;
  let eventTriggerService: any;

  beforeEach(async(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'createCase', 'validateCase']);
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OB);
    draftService = createSpyObj('draftsService', ['createOrUpdateDraft']);
    alertService = createSpyObj('alertService', ['error']);
    eventTriggerService = createSpyObj('eventTriggerService', ['announceEventTrigger']);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
          CaseEditComponent,
          CaseCreateComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: EventTriggerService, useValue: eventTriggerService },
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(CaseCreateComponent);
      component = fixture.componentInstance;
      component.jurisdiction = JID;
      component.caseType = CTID;
      component.event = ETID;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
  }));

  it('should update draft when saveDraft called with sanitised data for second time', () => {
    component.saveDraft()(SANITISED_EDIT_FORM);

    expect(draftService.createOrUpdateDraft).toHaveBeenCalledWith(JID, CTID, DRAFT_PREFIX + DRAFT_ID, SANITISED_EDIT_FORM);
  });
});

describe('CaseCreateComponent failed to resolve event trigger', () => {
  const ERROR: HttpError = new HttpError();
  ERROR.message = 'ERROR!';
  const ERROR_OBS: Observable<HttpError> = throwError(ERROR);

  let fixture: ComponentFixture<CaseCreateComponent>;
  let component: CaseCreateComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let draftsService: any;
  let alertService: any;
  let eventTriggerService: any;

  beforeEach(async(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'createCase', 'validateCase']);
    casesService.getEventTrigger.and.returnValue(ERROR_OBS);
    draftsService = createSpyObj('draftsService', ['createOrUpdateDraft']);
    alertService = createSpyObj('alertService', ['error']);
    eventTriggerService = createSpyObj('eventTriggerService', ['announceEventTrigger']);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
          CaseEditComponent,
          CaseCreateComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: DraftService, useValue: draftsService },
          { provide: AlertService, useValue: alertService },
          { provide: EventTriggerService, useValue: eventTriggerService },
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(CaseCreateComponent);
      component = fixture.componentInstance;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
  }));

  it('should alert warning message and never announce event trigger if getting event trigger fails', () => {

    expect(alertService.error).toHaveBeenCalledWith('ERROR!');
    expect(eventTriggerService.announceEventTrigger).not.toHaveBeenCalled();
  });

});
