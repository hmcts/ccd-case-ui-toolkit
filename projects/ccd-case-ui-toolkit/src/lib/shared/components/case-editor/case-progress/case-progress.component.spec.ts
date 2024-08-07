import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of, throwError } from 'rxjs';

import { CaseDetails, CaseEventData, CaseEventTrigger, CaseField, CaseView } from '../../../domain';
import { HttpError } from '../../../domain/http';
import { createCaseEventTrigger } from '../../../fixture/shared.test.fixture';
import { AlertService } from '../../../services';
import { CasesService, EventTriggerService } from '../services';
import { CaseProgressComponent } from './case-progress.component';

import createSpyObj = jasmine.createSpyObj;

const caseEditComponent: any = MockComponent({
  selector: 'ccd-case-edit',
  inputs: ['eventTrigger', 'submit', 'validate', 'caseDetails', 'saveDraft'],
  outputs: ['cancelled', 'submitted']
});

describe('CaseProgressComponent event trigger resolved and draft does not exist', () => {

  const CTID_UNDEFINED = undefined;
  const JID = 'PROBATE';
  const CTID = 'ComplexTestType';
  const PAGE_ID = 'pageId';
  const CASE_VIEW_DATA: CaseView = {
    case_id: '11',
    case_type: {
      id: CTID,
      name: 'TestAddressBookCase',
      description: 'some case_type description',
      jurisdiction: {
        id: JID,
        name: 'TEST',
        description: 'some jurisdiction description'
      }
    },
    state: null,
    channels: [],
    tabs: [],
    triggers: [],
    events: []
  };
  const CASE_VIEW_DATA_OB = of(CASE_VIEW_DATA);

  const ETID = 'TEST_TRIGGER';
  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    ETID,
    'Test Trigger',
    undefined,
    false,
    [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        field_type: null,
        display_context: 'READONLY'
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        field_type: null,
        display_context: 'OPTIONAL'
      }) as CaseField
    ],
    [],
    true
  );
  const EVENT_TRIGGER_OBS = of(EVENT_TRIGGER);

  const CREATED_CASE: CaseDetails = {
    id: '1234567890123456',
    jurisdiction: JID,
    case_type_id: CTID,
    state: 'CaseCreated'
  };
  const CREATED_CASE_OBS: Observable<CaseDetails> = of(CREATED_CASE);

  const SANITISED_EDIT_FORM: CaseEventData = {
    data: {
      PersonLastName: 'Khaleesi'
    },
    event: {
      id: null,
      summary: 'Some summary',
      description: 'Some description'
    },
    event_token: 'test-token',
    ignore_warning: false
  };

  let fixture: ComponentFixture<CaseProgressComponent>;
  let component: CaseProgressComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  // tslint:disable-next-line: prefer-const
  let alertService: any;
  let eventTriggerService: any;

  beforeEach(waitForAsync(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'getCaseViewV2', 'createEvent', 'validateCase']);
    casesService.getCaseViewV2.and.returnValue(CASE_VIEW_DATA_OB);
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    casesService.createEvent.and.returnValue(CREATED_CASE_OBS);
    casesService.validateCase.and.returnValue(CREATED_CASE_OBS);

    eventTriggerService = createSpyObj('eventTriggerService', ['announceEventTrigger']);
    eventTriggerService.announceEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          CaseProgressComponent,

          // Mocks
          caseEditComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: AlertService, useValue: alertService },
          { provide: EventTriggerService, useValue: eventTriggerService },
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(CaseProgressComponent);
      component = fixture.componentInstance;
      component.case = CASE_VIEW_DATA.case_id;
      component.event = ETID;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
  }));

  it('should get event trigger on loading and announce it', () => {
    expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_VIEW_DATA.case_id);
    expect(casesService.getEventTrigger).toHaveBeenCalledWith(CTID_UNDEFINED, ETID, CASE_VIEW_DATA.case_id);
    expect(eventTriggerService.announceEventTrigger).toHaveBeenCalledWith(EVENT_TRIGGER);
  });

  it('should emit submitted event when submitted emitter is called', () => {
    component.ngOnInit();

    const event = {id: 1, name: 'name'};
    component.emitSubmitted(event);
    expect(submitHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should emit submitted event when submitted emitter is called', () => {
    component.ngOnInit();

    const event = {id: 1, name: 'name'};
    component.emitSubmitted(event);
    expect(submitHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should emit cancelled event when cancelled emitter is called', () => {
    component.ngOnInit();

    const event = {id: 1, name: 'name'};
    component.emitCancelled(event);
    expect(cancelHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should create case with sanitised data when form submitted', () => {
    component.submit()(SANITISED_EDIT_FORM);

    expect(casesService.createEvent).toHaveBeenCalledWith(CASE_VIEW_DATA, SANITISED_EDIT_FORM);
  });

  it('should validate case details with sanitised data when validated', () => {
    component.validate()(SANITISED_EDIT_FORM, PAGE_ID);

    expect(casesService.validateCase).toHaveBeenCalledWith(CTID, SANITISED_EDIT_FORM, PAGE_ID);
  });

});

describe('CaseProgressComponent failed to resolve case details or event trigger', () => {
  const JID = 'PROBATE';
  const CTID = 'ComplexTestType';
  const CASE_VIEW_DATA: CaseView = {
    case_id: '11',
    case_type: {
      id: CTID,
      name: 'TestAddressBookCase',
      description: 'some case_type description',
      jurisdiction: {
        id: JID,
        name: 'TEST',
        description: 'some jurisdiction description'
      }
    },
    state: null,
    channels: [],
    tabs: [],
    triggers: [],
    events: []
  };
  const CASE_VIEW_DATA_OB = of(CASE_VIEW_DATA);

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'ERROR!';
  const ERROR_OBS: Observable<HttpError> = throwError(ERROR);

  let fixture: ComponentFixture<CaseProgressComponent>;
  let component: CaseProgressComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let alertService: any;
  let eventTriggerService: any;

  beforeEach(waitForAsync(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'getCaseViewV2']);
    casesService.getCaseViewV2.and.returnValue(ERROR_OBS);
    alertService = createSpyObj('alertService', ['error']);

    eventTriggerService = createSpyObj('eventTriggerService', ['announceEventTrigger']);
    eventTriggerService.announceEventTrigger.and.returnValue(ERROR_OBS);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          caseEditComponent,
          CaseProgressComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: AlertService, useValue: alertService },
          { provide: EventTriggerService, useValue: eventTriggerService },
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(CaseProgressComponent);
      component = fixture.componentInstance;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
  }));

  it('should alert warning message and never announce event trigger if getting case details fails', () => {
    component.ngOnInit();

    expect(alertService.error).toHaveBeenCalledWith({ phrase: 'ERROR!' });
    expect(eventTriggerService.announceEventTrigger).not.toHaveBeenCalled();
  });

  it('should alert warning message and never announce event trigger if getting event trigger fails', () => {
    casesService.getCaseViewV2.and.returnValue(CASE_VIEW_DATA_OB);
    casesService.getEventTrigger.and.returnValue(ERROR_OBS);
    component.ngOnInit();

    expect(alertService.error).toHaveBeenCalledWith({ phrase: 'ERROR!' });
    expect(eventTriggerService.announceEventTrigger).not.toHaveBeenCalled();
  });
});
