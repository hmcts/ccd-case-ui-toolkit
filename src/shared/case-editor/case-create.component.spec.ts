import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { MockComponent } from 'ng2-mock-component';
import { DebugElement, NO_ERRORS_SCHEMA, Component, Input, EventEmitter, Output } from '@angular/core';
import createSpyObj = jasmine.createSpyObj;
import { CasesService } from '../cases/cases.service';
import { CaseCreateComponent } from './case-create.component';
import { CaseEventTrigger, Draft } from '../domain';
import { createCaseEventTrigger } from '../fixture/shared.fixture';
import { DraftService } from '../draft';
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

fdescribe('CaseCreateComponent', () => {

  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    'TEST_TRIGGER',
    'Test Trigger',
    'caseId',
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
    false
  );

  const EVENT_TRIGGER_OB = of(EVENT_TRIGGER);

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'ERROR!';
  const ERROR_OBS: Observable<HttpError> = Observable.of(ERROR);

  let fixture: ComponentFixture<CaseCreateComponent>;
  let component: CaseCreateComponent;
  let de: DebugElement;

  let cancelHandler: any;
  let submitHandler: any;
  let casesService: any;
  let draftsService: any;
  let alertService: any;

  beforeEach(async(() => {
    cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
    cancelHandler.applyFilters.and.returnValue();

    submitHandler = createSpyObj('submitHandler', ['applyFilters']);
    submitHandler.applyFilters.and.returnValue();

    casesService = createSpyObj('casesService', ['getEventTrigger', 'createCase', 'validateCase']);
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OB);
    draftsService = createSpyObj('draftsService', ['createOrUpdateDraft']);
    alertService = createSpyObj('alertService', ['error']);

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

  it('should emit submitted event when submitted emitter is called', () => {
    component.ngOnInit();
    fixture.detectChanges();

    let event = {id: 1, name: 'name'};
    component.emitSubmitted(event);
    expect(submitHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should emit cancelled event when cancelled emitter is called', () => {
    component.ngOnInit();
    fixture.detectChanges();

    let event = {id: 1, name: 'name'};
    component.emitCancelled(event);
    expect(cancelHandler.applyFilters).toHaveBeenCalledWith(event);
  });

  it('should alert warning message if getting event trigger fails', () => {
    casesService.getEventTrigger.and.returnValue(ERROR_OBS);
    component.ngOnInit();
    fixture.detectChanges();

    expect(alertService.warning).toHaveBeenCalledWith('ERROR');
  });

  // it('should create case with sanitised data when form submitted', () => {
  //   casesService.createCase.and.returnValue(CREATED_CASE_OBS);
  //   component.submit()(SANITISED_EDIT_FORM);

  //   expect(casesService.createCase).toHaveBeenCalledWith(JID, CTID, SANITISED_EDIT_FORM);
  // });

  // it('should validate case details with sanitised data when validated', () => {
  //   casesService.validateCase.and.returnValue(CREATED_CASE_OBS);
  //   component.validate()(SANITISED_EDIT_FORM);

  //   expect(casesService.validateCase).toHaveBeenCalledWith(JID, CTID, SANITISED_EDIT_FORM);
  // });

  // it('should create a draft when saveDraft called with sanitised data', () => {
  //   component.eventTrigger.case_id = undefined;
  //   component.saveDraft()(SANITISED_EDIT_FORM);

  //   expect(draftService.createOrUpdateDraft).toHaveBeenCalledWith(JID, CTID, undefined, SANITISED_EDIT_FORM);
  // });

});
