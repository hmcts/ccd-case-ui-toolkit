import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { CaseViewerComponent } from './case-viewer.component';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MockComponent } from 'ng2-mock-component';
import { Observable } from 'rxjs';
import { attr, text } from '../../test/helpers';
import { Subject } from 'rxjs/Subject';
import { ActivityPollingService } from '../../services/activity/activity.polling.service';
import { PaletteUtilsModule } from '../../components/palette/utils';
import { CaseField } from '../../domain/definition';
import { PlaceholderService } from '../../directives/substitutor/services';
import { FieldsUtils } from '../../services/';
import { LabelSubstitutorDirective } from '../../directives/substitutor';
import { HttpError } from '../../domain/http';
import { OrderService } from '../../services/order';
import { DeleteOrCancelDialogComponent } from '../../components/dialogs';
import { CaseViewTrigger, CaseViewEvent, CaseView } from '../../domain/case-view';
import { AlertService } from '../../services/alert';
import { CallbackErrorsContext } from '../../components/error/domain';
import { DraftService } from '../../services/draft';
import { CaseReferencePipe } from '../../pipes/case-reference';
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { CaseService } from '../case-editor';

@Component({
  // tslint:disable-next-line
  selector: 'cut-tabs',
  template: '<ng-content></ng-content>'
})
class TabsComponent { }

@Component({
  // tslint:disable-next-line
  selector: 'cut-tab',
  template: '<ng-content></ng-content>'
})
class TabComponent {
  @Input()
  selected: boolean;
}

@Component({
  selector: 'ccd-event-trigger',
  template: ``
})
class EventTriggerComponent {
  @Input()
  triggers: CaseViewTrigger[];

  @Input()
  triggerText: string;

  @Input()
  isDisabled: boolean;

  @Output()
  onTriggerSubmit: EventEmitter<CaseViewTrigger> = new EventEmitter();

  @Output()
  onTriggerChange: EventEmitter<any> = new EventEmitter();
}

@Component({
  selector: 'ccd-callback-errors',
  template: ``
})
class CallbackErrorsComponent {

  @Input()
  triggerTextIgnore: string;
  @Input()
  triggerTextContinue: string;
  @Input()
  callbackErrorsSubject: Subject<any> = new Subject();
  @Output()
  callbackErrorsContext: EventEmitter<any> = new EventEmitter();

}

const CaseHeaderComponent: any = MockComponent({
  selector: 'ccd-case-header',
  inputs: ['caseDetails']
});

const MarkdownComponent: any = MockComponent({
  selector: 'ccd-markdown',
  inputs: ['content']
});

let CaseActivityComponent: any = MockComponent({
  selector: 'ccd-activity',
  inputs: ['caseId', 'displayMode']
});

let FieldReadComponent: any = MockComponent({
  selector: 'ccd-field-read', inputs: [
    'caseField',
    'caseReference'
  ]
});

let LinkComponent: any = MockComponent({
  selector: 'a', inputs: [
    'routerLink'
  ]
});

const EVENTS: CaseViewEvent[] = [
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
    user_last_name: 'Chan',
    user_first_name: 'Phillip',
    significant_item: {
      type: 'DOCUMENT',
      description: 'First document description',
      url: 'https://google.com'
    }
  }
];

const METADATA: CaseField[] = [
  {
    id: '[CASE_REFERENCE]',
    label: 'Case Reference',
    value: 1533032330714079,
    hint_text: null,
    field_type: {
      id: 'Number',
      type: 'Number',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: null
    },
    security_label: 'PUBLIC',
    order: null,
    display_context: null,
    show_condition: null,
    show_summary_change_option: null,
    show_summary_content_option: null
  },
  {
    id: '[CASE_TYPE]',
    label: 'Case Type',
    value: 'DIVORCE',
    hint_text: null,
    field_type: {
      id: 'Text',
      type: 'Text',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: null
    },
    security_label: 'PUBLIC',
    order: null,
    display_context: null,
    show_condition: null,
    show_summary_change_option: null,
    show_summary_content_option: null
  },
  {
    id: '[CREATED_DATE]',
    label: 'Created Date',
    value: '2018-07-31T10:18:50.737',
    hint_text: null,
    field_type: {
      id: 'Date',
      type: 'Date',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: null
    },
    security_label: 'PUBLIC',
    order: null,
    display_context: null,
    show_condition: null,
    show_summary_change_option: null,
    show_summary_content_option: null
  },
  {
    id: '[JURISDICTION]',
    label: 'Jurisdiction',
    value: 'DIVORCE',
    hint_text: null,
    field_type: {
      id: 'Text',
      type: 'Text',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: null
    },
    security_label: 'PUBLIC',
    order: null,
    display_context: null,
    show_condition: null,
    show_summary_change_option: null,
    show_summary_content_option: null
  },
  {
    id: '[LAST_MODIFIED_DATE]',
    label: 'Last Modified Date',
    value: '2018-07-31T10:18:50.737',
    hint_text: null,
    field_type: {
      id: 'Date',
      type: 'Date',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: null
    },
    security_label: 'PUBLIC',
    order: null,
    display_context: null,
    show_condition: null,
    show_summary_change_option: null,
    show_summary_content_option: null
  },
  {
    id: '[SECURITY_CLASSIFICATION]',
    label: 'Security Classification',
    value: 'PUBLIC',
    hint_text: null,
    field_type: {
      id: 'Text',
      type: 'Text',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: null
    },
    security_label: 'PUBLIC',
    order: null,
    display_context: null,
    show_condition: null,
    show_summary_change_option: null,
    show_summary_content_option: null
  }
];

const TRIGGERS: CaseViewTrigger[] = [
  {
    id: 'EDIT',
    name: 'Edit',
    description: 'Edit a case'
  },
  {
    id: 'RESUME',
    name: 'Resume',
    description: 'Resume Draft'
  },
  {
    id: 'DELETE',
    name: 'Delete',
    description: 'Delete Draft'
  }
];

const JID = 'TEST';
const CTID = 'TestAddressBookCase';
const CID = '1234567890123456';

// Page object selectors
const $ALL_TAB_HEADERS = By.css('cut-tabs>cut-tab');
const $FIRST_TAB_HEADER = By.css('cut-tabs>cut-tab:first-child');
const $CASE_TAB_HEADERS = By.css('cut-tabs>cut-tab:not(:first-child)');
const $NAME_TAB_CONTENT = By.css('cut-tabs>cut-tab#NameTab');
const $EVENT_TAB_CONTENT = By.css('cut-tabs>cut-tab#HistoryTab');
const $PRINT_LINK = By.css('#case-viewer-control-print');
const $ERROR_SUMMARY = By.css('.error-summary');
const $ERROR_MESSAGE = By.css('p');

const CASE_VIEW: CaseView = {
  case_id: CID,
  case_type: {
    id: CTID,
    name: 'Test Address Book Case',
    jurisdiction: {
      id: JID,
      name: 'Test',
    },
    printEnabled: true
  },
  channels: [],
  state: {
    id: 'CaseCreated',
    name: 'Case created'
  },
  tabs: [
    {
      id: 'AddressTab',
      label: 'Address',
      order: 3,
      fields: [],
      show_condition: 'PersonFirstName="Jane"'
    },
    {
      id: 'NameTab',
      label: 'Name',
      order: 2,
      fields: [
        {
          id: 'PersonFirstName',
          label: 'First name',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          order: 2,
          value: 'Janet',
          show_condition: '',
          hint_text: ''
        },
        {
          id: 'PersonLastName',
          label: 'Last name',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          order: 1,
          value: 'Parker',
          show_condition: 'PersonFirstName="Jane*"',
          hint_text: ''
        },
        {
          id: 'PersonComplex',
          label: 'Complex field',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Complex',
            type: 'Complex',
            complex_fields: []
          },
          order: 3,
          show_condition: 'PersonFirstName="Park"',
          hint_text: ''
        }
      ],
      show_condition: 'PersonFirstName="Janet"'
    },
    {
      id: 'HistoryTab',
      label: 'History',
      order: 1,
      fields: [{
        id: 'CaseHistory',
        label: 'Case History',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'CaseHistoryViewer',
          type: 'CaseHistoryViewer'
        },
        order: 1,
        value: EVENTS,
        show_condition: '',
        hint_text: ''
      }],
      show_condition: ''
    },
    {
      id: 'SomeTab',
      label: 'Some Tab',
      order: 4,
      fields: [],
      show_condition: ''
    },
  ],
  triggers: TRIGGERS,
  events: EVENTS,
  metadataFields: METADATA,
};

let mockRoute: any = {
  snapshot: {
    data: {
      case: CASE_VIEW
    }
  }
};

const $DIALOG_DELETE_BUTTON = By.css('.button[title=Delete]');
const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');
const DIALOG_CONFIG = new MatDialogConfig();

let fixture: ComponentFixture<CaseViewerComponent>;
let fixtureDialog: ComponentFixture<DeleteOrCancelDialogComponent>;
let componentDialog: DeleteOrCancelDialogComponent;
let deDialog: DebugElement;
let component: CaseViewerComponent;
let de: DebugElement;

let orderService;
let router: any;
let mockCallbackErrorSubject: any;
let activityService: any;
let draftService: any;
let alertService: any;
let dialog: any;
let matDialogRef: any;
let caseService: any;

describe('CaseViewerComponent', () => {

  const FIELDS = CASE_VIEW.tabs[1].fields;
  const SIMPLE_FIELDS = CASE_VIEW.tabs[1].fields.slice(0, 2);
  const COMPLEX_FIELDS = CASE_VIEW.tabs[1].fields.slice(2);

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  beforeEach(async(() => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(Observable.of({}));

    caseService = createSpyObj('caseService', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(Observable.of({}));
    alertService.success.and.returnValue(Observable.of({}));
    alertService.warning.and.returnValue(Observable.of({}));

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity']);
    activityService.postViewActivity.and.returnValue(Observable.of());

    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(new Promise(any));
    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next', 'subscribe', 'unsubscribe']);

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
        ],
        declarations: [
          CaseViewerComponent,
          LabelSubstitutorDirective,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          FieldReadComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent,
          TabsComponent,
          TabComponent,
          MarkdownComponent,
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          { provide: CaseService, useValue: caseService },
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: OrderService, useValue: orderService },
          { provide: Router, useValue: router },
          { provide: ActivityPollingService, useValue: activityService },
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseViewerComponent);
    component = fixture.componentInstance;
    component.callbackErrorsSubject = mockCallbackErrorSubject;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render a case header', () => {
    let header = de.query(By.directive(CaseHeaderComponent));
    expect(header).toBeTruthy();
    expect(header.componentInstance.caseDetails).toEqual(CASE_VIEW);
  });

  it('should render the correct tabs based on show_condition', () => {
    // we expect address tab not to be rendered
    let tabHeaders = de.queryAll($ALL_TAB_HEADERS);
    expect(tabHeaders.length).toBe(CASE_VIEW.tabs.length - 1);
    expect(attr(tabHeaders[0], 'title')).toBe(CASE_VIEW.tabs[2].label);
    expect(attr(tabHeaders[1], 'title')).toBe(CASE_VIEW.tabs[1].label);
  });

  it('should render the history tab first and select it', () => {
    // we expect address tab not to be rendered
    let firstTabHeader = de.query($FIRST_TAB_HEADER);

    expect(firstTabHeader).toBeTruthy();
    expect(attr(firstTabHeader, 'title')).toBe('History');
  });

  it('should render each tab defined by the Case view', () => {
    // we expect address tab not to be rendered
    let tabHeaders = de.queryAll($ALL_TAB_HEADERS);
    expect(tabHeaders.length).toBe(CASE_VIEW.tabs.length - 1);

    expect(tabHeaders.find(c => 'Name' === attr(c, 'title'))).toBeTruthy('Could not find tab Name');
    expect(tabHeaders.find(c => 'Some Tab' === attr(c, 'title'))).toBeTruthy('Could not find tab Some Tab');
  });

  it('should render the field labels based on show_condition', () => {
    let headers = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr>th'));

    expect(headers.find(r => r.nativeElement.textContent.trim() === 'Complex field'))
      .toBeFalsy('Found row with label Complex field');
    expect(headers.find(r => r.nativeElement.textContent.trim() === 'Last name'))
      .toBeTruthy('Cannot find row with label Last name');
    expect(headers.find(r => r.nativeElement.textContent.trim() === 'First name'))
      .toBeTruthy('Cannot find row with label First name');
  });

  it('should render tabs in ascending order', () => {
    let tabHeaders = de.queryAll($CASE_TAB_HEADERS);

    expect(attr(tabHeaders[0], 'title')).toBe(CASE_VIEW.tabs[1].label);
    expect(orderService.sort).toHaveBeenCalledWith(CASE_VIEW.tabs);
  });

  it('should render a row for each field in a given tab', () => {
    let rows = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr'));
    expect(rows.length).toBe(FIELDS.length);
  });

  it('should render each simple field label as a table header', () => {
    let headers = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr>th'));

    SIMPLE_FIELDS.forEach(field => {
      expect(headers.find(r => r.nativeElement.textContent.trim() === field.label))
        .toBeTruthy(`Could not find row with label ${field.label}`);
    });
  });

  it('should render each compound field without label as a cell spanning 2 columns', () => {
    let headers = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr.complex-field>th'));

    expect(headers.length).toBe(0);

    let cells = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr.compound-field>th'));

    expect(cells.length).toEqual(COMPLEX_FIELDS.length);
  });

  it('should render each field value using FieldReadComponent', () => {
    let readFields_fields = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr td>span>ccd-field-read'));

    let readFields_compound = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr th>span>ccd-field-read'));

    let readFields = readFields_fields.concat(readFields_compound);

    FIELDS.forEach(field => {
      expect(readFields.find(f => {
        let fieldInstance = f.componentInstance;
        return JSON.stringify(fieldInstance.caseField) === JSON.stringify(field);
      }))
        .toBeTruthy(`Could not find field with type ${field.field_type}`);
    });
    expect(FIELDS.length).toBe(readFields.length);
  });

  it('should render fields in ascending order', () => {
    let headers = de
      .query($NAME_TAB_CONTENT)
      .queryAll(By.css('tbody>tr>th'));

    expect(headers[0].nativeElement.textContent.trim()).toBe(FIELDS[1].label);
    expect(orderService.sort).toHaveBeenCalledWith(FIELDS);
  });

  it('should render an event trigger', () => {
    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));

    expect(eventTriggerElement).toBeTruthy();

    let eventTrigger = eventTriggerElement.componentInstance;

    expect(eventTrigger.triggers).toEqual(TRIGGERS);
  });

  it('should emit trigger event on trigger submit', () => {
    spyOn(component, 'applyTrigger').and.callThrough();

    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    let eventTrigger = eventTriggerElement.componentInstance;

    eventTrigger.onTriggerSubmit.emit(TRIGGERS[0]);

    expect(component.applyTrigger).toHaveBeenCalledWith(TRIGGERS[0]);
    expect(component.applyTrigger).toHaveBeenCalledTimes(1);
  });

  it('should navigate to event trigger view on trigger emit', () => {
    component.applyTrigger(TRIGGERS[0]);
    expect(router.navigate).toHaveBeenCalledWith(['trigger', TRIGGERS[0].id], {
      queryParams: {},
      relativeTo: mockRoute
    });
  });

  it('should navigate to resume draft trigger view on trigger emit', () => {
    component.ignoreWarning = true;
    component.caseDetails.case_id = 'DRAFT123';
    component.applyTrigger(TRIGGERS[1]);
    expect(router.navigate).toHaveBeenCalledWith(['create/case', 'TEST', 'TestAddressBookCase', TRIGGERS[1].id], {
      queryParams: { ignoreWarning: true, draft: 'DRAFT123', origin: 'viewDraft' }
    });
  });

  it('should trigger the delete case event when delete case button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DeleteOrCancelDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();

    let dialogDeleteButton = deDialog.query($DIALOG_DELETE_BUTTON);
    dialogDeleteButton.nativeElement.click();

    expect(componentDialog.result).toEqual('Delete');
    fixture.detectChanges();
  });

  it('should not trigger the delete case event when cancel button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DeleteOrCancelDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();

    let dialogCancelButton = deDialog.query($DIALOG_CANCEL_BUTTON);
    dialogCancelButton.nativeElement.click();

    expect(componentDialog.result).toEqual('Cancel');
    fixture.detectChanges();
  });

  it('should notify user about errors/warnings when trigger applied and response with callback warnings/errors', () => {
    const VALID_ERROR = {
      callbackErrors: ['error1', 'error2'],
      callbackWarnings: ['warning1', 'warning2']
    };
    router.navigate.and.returnValue({ catch: (error) => error(VALID_ERROR) });

    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    let eventTrigger = eventTriggerElement.componentInstance;
    eventTrigger.onTriggerSubmit.emit(TRIGGERS[0]);

    expect(router.navigate).toHaveBeenCalledWith(['trigger', TRIGGERS[0].id], {
      queryParams: {},
      relativeTo: mockRoute
    });
    expect(mockCallbackErrorSubject.next).toHaveBeenCalledWith(VALID_ERROR);
  });

  it('should change button label when notified about callback errors', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CaseViewerComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();

    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    let eventTrigger = eventTriggerElement.componentInstance;

    expect(eventTrigger.triggerText).toEqual(CaseViewerComponent.TRIGGER_TEXT_START);

    callbackErrorsContext.trigger_text = CaseViewerComponent.TRIGGER_TEXT_CONTINUE;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();

    expect(eventTrigger.triggerText).toEqual(CaseViewerComponent.TRIGGER_TEXT_CONTINUE);
  });

  it('should initially not display form errors', () => {
    let error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
  });

  it('should clear errors and warnings', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CaseViewerComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();
    component.clearErrorsAndWarnings();
    let error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
    expect(component.ignoreWarning).toBeFalsy();
  });

  it('should display error when form error get set', () => {
    component.error = ERROR;
    fixture.detectChanges();

    let error = de.query($ERROR_SUMMARY);
    expect(error).toBeTruthy();

    let errorMessage = error.query($ERROR_MESSAGE);
    expect(text(errorMessage)).toBe(ERROR.message);
  });

  it('should contain a print link', () => {
    let printLink = de.query($PRINT_LINK);

    expect(printLink).toBeTruthy();
    expect(printLink.componentInstance.routerLink).toEqual('print');
  });

  it('should not contain a print link if Draft', () => {
    component.caseDetails.case_id = 'DRAFT123';
    fixture.detectChanges();
    let printLink = de.query($PRINT_LINK);

    expect(printLink).toBeFalsy();
  });

  it('should not contain a print link if printableDocumentsUrl not configured', () => {
    component.caseDetails.case_type.printEnabled = null;
    fixture.detectChanges();
    let printLink = de.query($PRINT_LINK);
    expect(component.isPrintEnabled()).toBeFalsy();
    expect(printLink).toBeFalsy();
  });

  it('should pass flag to disable button when form valid but callback errors exist', () => {
    component.error = HttpError.from({});
    fixture.detectChanges();

    expect(component.isTriggerButtonDisabled()).toBeFalsy();
    let error = HttpError.from({});
    error.callbackErrors = ['anErrors'];
    component.error = error;
    fixture.detectChanges();

    expect(component.isTriggerButtonDisabled()).toBeTruthy();
  });

  it('should clear alerts and errors when selected trigger changed', () => {
    const FIELD_ERRORS = [
      {
        x: ''
      }
    ];
    const VALID_ERROR = {
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    let httpError = HttpError.from(VALID_ERROR);
    component.error = httpError;

    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    let eventTrigger = eventTriggerElement.componentInstance;

    eventTrigger.onTriggerChange.next(null);
    fixture.detectChanges();

    expect(alertService.clear).toHaveBeenCalled();
    expect(component.error).toEqual(null);
    expect(mockCallbackErrorSubject.next).toHaveBeenCalled();
  });

  it('should not clear alerts when there are no errors at init', () => {
    component.error = null;

    component.ngOnInit();
    fixture.detectChanges();

    expect(alertService.clear).not.toHaveBeenCalled();
  });
});

describe('CaseViewerComponent - no tabs available', () => {

  beforeEach(async(() => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(Observable.of({}));

    caseService = createSpyObj('caseService', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(Observable.of({}));
    alertService.success.and.returnValue(Observable.of({}));
    alertService.warning.and.returnValue(Observable.of({}));

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity']);
    activityService.postViewActivity.and.returnValue(Observable.of());

    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(new Promise(any));
    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next', 'subscribe', 'unsubscribe']);

    CASE_VIEW.tabs = [];

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
        ],
        declarations: [
          CaseViewerComponent,
          LabelSubstitutorDirective,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          FieldReadComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent,
          TabsComponent,
          TabComponent,
          MarkdownComponent,
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          { provide: CaseService, useValue: caseService },
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: OrderService, useValue: orderService },
          { provide: Router, useValue: router },
          { provide: ActivityPollingService, useValue: activityService },
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseViewerComponent);
    component = fixture.componentInstance;
    component.callbackErrorsSubject = mockCallbackErrorSubject;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should not display any tabs if unavailable', () => {
    let tabHeaders = de.queryAll($ALL_TAB_HEADERS);
    expect(tabHeaders.length).toBe(0);
  });
});
