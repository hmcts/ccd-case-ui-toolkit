import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA, Component, Input, EventEmitter, Output } from '@angular/core';
import createSpyObj = jasmine.createSpyObj;
import { CasesService } from '../cases/cases.service';
import { CaseProgressComponent } from './case-progress.component';
import { CaseEventTrigger, Draft, CaseDetails, CaseEventData, CaseView } from '../domain';
import { createCaseEventTrigger } from '../fixture/shared.fixture';
import { AlertService } from '../alert';
import { of, Observable } from 'rxjs';
import { HttpError } from '../http';

@Component({
  selector: 'ccd-case-edit',
  template: ``
})
class CaseEditComponent {

  @Input()
  eventTrigger: CaseEventTrigger;

  @Input()
  submit: (CaseEventData) => Observable<object>;

  @Input()
  validate: (CaseEventData) => Observable<object>;

  @Input()
  saveDraft: (CaseEventData) => Observable<Draft>;

  @Output()
  cancelled: EventEmitter<any> = new EventEmitter();

  @Output()
  submitted: EventEmitter<string> = new EventEmitter();
}

describe('CaseProgressComponent event trigger resolved and draft does not exist', () => {

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

  let fixture: ComponentFixture<CaseProgressComponent>;
  let component: CaseProgressComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let alertService: any;

  beforeEach(async(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'getCaseViewV2', 'createEvent', 'validateCase']);
    casesService.getCaseViewV2.and.returnValue(CASE_VIEW_DATA_OB);
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OB);
    casesService.createEvent.and.returnValue(CREATED_CASE_OBS);
    casesService.validateCase.and.returnValue(CREATED_CASE_OBS);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
          CaseEditComponent,
          CaseProgressComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: AlertService, useValue: alertService },
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
    component.submit()(SANITISED_EDIT_FORM);

    expect(casesService.createEvent).toHaveBeenCalledWith(CASE_VIEW_DATA, SANITISED_EDIT_FORM);
  });

  it('should validate case details with sanitised data when validated', () => {
    component.validate()(SANITISED_EDIT_FORM);

    expect(casesService.validateCase).toHaveBeenCalledWith(JID, CTID, SANITISED_EDIT_FORM);
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
  const ERROR_OBS: Observable<HttpError> = Observable.throw(ERROR);

  let fixture: ComponentFixture<CaseProgressComponent>;
  let component: CaseProgressComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let alertService: any;

  beforeEach(async(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'getCaseViewV2']);
    casesService.getCaseViewV2.and.returnValue(ERROR_OBS);
    alertService = createSpyObj('alertService', ['error']);

    TestBed
      .configureTestingModule({
        imports: [
        ],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
          CaseEditComponent,
          CaseProgressComponent,
        ],
        providers: [
          { provide: CasesService, useValue: casesService },
          { provide: AlertService, useValue: alertService },
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

  it('should alert warning message if getting case details fails', () => {
    component.ngOnInit();

    expect(alertService.error).toHaveBeenCalledWith('ERROR!');
  });

  it('should alert warning message if getting event trigger fails', () => {
    casesService.getCaseViewV2.and.returnValue(CASE_VIEW_DATA_OB);
    casesService.getEventTrigger.and.returnValue(ERROR_OBS);
    component.ngOnInit();

    expect(alertService.error).toHaveBeenCalledWith('ERROR!');
  });
});
