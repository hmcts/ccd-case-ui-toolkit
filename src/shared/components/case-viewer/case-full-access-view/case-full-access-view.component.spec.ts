import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DebugElement, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig, MatDialogRef, MatTabsModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of, Subscription } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { AppMockConfig } from '../../../../app-config.mock';
import { AbstractAppConfig } from '../../../../app.config';
import { DeleteOrCancelDialogComponent } from '../../../components/dialogs';
import { CallbackErrorsContext } from '../../../components/error/domain';
import { PaletteUtilsModule } from '../../../components/palette/utils';
import { LabelSubstitutorDirective } from '../../../directives/substitutor';
import { PlaceholderService } from '../../../directives/substitutor/services';
import { CaseView, CaseViewEvent, CaseViewTrigger } from '../../../domain/case-view';
import { CaseField } from '../../../domain/definition';
import { HttpError } from '../../../domain/http';
import { CaseReferencePipe } from '../../../pipes/case-reference';
import {
  ActivityService,
  AuthService,
  ErrorNotifierService,
  FieldsUtils,
  HttpErrorService,
  HttpService,
  NavigationNotifierService,
  NavigationOrigin,
  SessionStorageService
} from '../../../services/';
import { ActivityPollingService } from '../../../services/activity/activity.polling.service';
import { AlertService } from '../../../services/alert';
import { DraftService } from '../../../services/draft';
import { OrderService } from '../../../services/order';
import { attr, text } from '../../../test/helpers';
import { CaseNotifier, ConvertHrefToRouterService } from '../../case-editor';
import { ComplexModule, PaletteModule } from '../../palette';
import { CaseFullAccessViewComponent } from './case-full-access-view.component';
import createSpyObj = jasmine.createSpyObj;

@Component({
  // tslint:disable-next-line
  selector: 'mat-tab-group',
  template: '<ng-content></ng-content>'
})
class TabsComponent {
}

@Component({
  // tslint:disable-next-line
  selector: 'mat-tab',
  template: '<ng-content></ng-content>'
})
class TabComponent {

  @Input()
  selected: boolean;
}

@Component({
  // tslint:disable-next-line
  selector: 'exui-tasks-container',
  template: '<p>Tasks Container</p>'
})
class TasksContainerComponent {
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
  inputs: ['content', 'markdownUseHrefAsRouterLink']
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
  Object.assign(new CaseField(), {
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
  }),
  Object.assign(new CaseField(), {
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
  }),
  Object.assign(new CaseField(), {
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
  }),
  Object.assign(new CaseField(), {
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
  }),
  Object.assign(new CaseField(), {
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
  }),
  Object.assign(new CaseField(), {
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
  }),
  Object.assign(new CaseField(), {
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
  })
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
const $ALL_TAB_HEADERS = By.css('mat-tab-group>mat-tab');
const $FIRST_TAB_HEADER = By.css('mat-tab-group>mat-tab:first-child');
const $CASE_TAB_HEADERS = By.css('mat-tab-group>mat-tab:not(:first-child)');
const $NAME_TAB_CONTENT = By.css('mat-tab-group>mat-tab#NameTab');
const $PRINT_LINK = By.css('#case-viewer-control-print');
const $ERROR_SUMMARY = By.css('.error-summary');
const $ERROR_HEADING_GENERIC = By.css('.error-summary>h1:first-child');
const $ERROR_MESSAGE_GENERIC = By.css('.govuk-error-summary__body>p:first-child');
const $ERROR_HEADING_SPECIFIC = By.css('.error-summary>h2:first-child');
const $ERROR_MESSAGE_SPECIFIC = By.css('.error-summary>p:nth-child(2)');
const $CALLBACK_DATA_FIELD_ERROR_LIST = By.css('.error-summary-list');
const $FIRST_FIELD_ERROR = By.css('li:first-child');
const $SECOND_FIELD_ERROR = By.css('li:nth-child(2)');

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
      id: 'NameTab',
      label: 'Name',
      order: 2,
      fields: [
        Object.assign(new CaseField(), {
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
        }),
        Object.assign(new CaseField(), {
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
        }),
        Object.assign(new CaseField(), {
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
        })
      ],
      show_condition: 'PersonFirstName="Janet"'
    },
    {
      id: 'HistoryTab',
      label: 'History',
      order: 1,
      fields: [Object.assign(new CaseField(), {
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
      })],
      show_condition: ''
    },
    {
      id: 'SomeTab',
      label: 'Some Tab',
      order: 3,
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

const WORK_ALLOCATION_CASE_VIEW = {
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
      id: 'overview',
      label: 'Overview',
      order: 1,
      fields: [],
      show_condition: ''
    },
    {
      id: 'caseNotes',
      label: 'Case notes',
      order: 2,
      fields: [],
      show_condition: ''
    },
  ],
  triggers: TRIGGERS,
  events: EVENTS,
  metadataFields: METADATA,
};
const $DIALOG_DELETE_BUTTON = By.css('.button[title=Delete]');
const $DIALOG_CANCEL_BUTTON = By.css('.button[title=Cancel]');
const DIALOG_CONFIG = new MatDialogConfig();

let fixture: ComponentFixture<CaseFullAccessViewComponent>;
let fixtureDialog: ComponentFixture<DeleteOrCancelDialogComponent>;
let componentDialog: DeleteOrCancelDialogComponent;
let deDialog: DebugElement;
let component: CaseFullAccessViewComponent;
let de: DebugElement;

let orderService;
let mockCallbackErrorSubject: any;
let activityService: any;
let draftService: any;
let alertService: any;
let dialog: any;
let matDialogRef: any;
let caseNotifier: any;
let navigationNotifierService: NavigationNotifierService;
let errorNotifierService: ErrorNotifierService;

xdescribe('CaseFullAccessViewComponent', () => {

  const FIELDS = CASE_VIEW.tabs[0].fields;
  const SIMPLE_FIELDS = CASE_VIEW.tabs[0].fields.slice(0, 2);
  const COMPLEX_FIELDS = CASE_VIEW.tabs[0].fields.slice(2);

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';
  const ERROR_HEADING_GENERIC = 'Something went wrong';
  const ERROR_MESSAGE_GENERIC = 'We\'re working to fix the problem. Try again shortly.';
  const ERROR_HEADING_SPECIFIC = 'The callback data failed validation';

  beforeEach(async(() => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(Observable.of({}));

    caseNotifier = createSpyObj('caseService', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(Observable.of({}));
    alertService.success.and.returnValue(Observable.of({}));
    alertService.warning.and.returnValue(Observable.of({}));

    navigationNotifierService = new NavigationNotifierService();
    spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
    errorNotifierService = new ErrorNotifierService();

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity']);
    activityService.postViewActivity.and.returnValue(Observable.of());

    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next', 'subscribe', 'unsubscribe']);

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          PaymentLibModule
        ],
        declarations: [
          CaseFullAccessViewComponent,
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
          MarkdownComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          {provide: NavigationNotifierService, useValue: navigationNotifierService},
          {provide: ErrorNotifierService, useValue: errorNotifierService},
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          {provide: OrderService, useValue: orderService},
          {provide: ActivityPollingService, useValue: activityService},
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseFullAccessViewComponent);
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
    expect(tabHeaders.length).toBe(CASE_VIEW.tabs.length);
    expect(attr(tabHeaders[0], 'title')).toBe(CASE_VIEW.tabs[1].label);
    expect(attr(tabHeaders[1], 'title')).toBe(CASE_VIEW.tabs[0].label);
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
    expect(tabHeaders.length).toBe(CASE_VIEW.tabs.length);

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

    expect(attr(tabHeaders[0], 'title')).toBe(CASE_VIEW.tabs[0].label);
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
    expect(navigationNotifierService.announceNavigation).toHaveBeenCalledWith({
      action: NavigationOrigin.EVENT_TRIGGERED,
      queryParams: {},
      etid: TRIGGERS[0].id,
      relativeTo: mockRoute
    });
  });

  it('should navigate to resume draft trigger view on trigger emit', () => {
    component.ignoreWarning = true;
    component.caseDetails.case_id = 'DRAFT123';
    component.caseDetails.case_type.jurisdiction.id = 'TESTJURISDICTION';
    component.caseDetails.case_type.id = 'TEST';
    component.applyTrigger(TRIGGERS[1]);
    expect(navigationNotifierService.announceNavigation).toHaveBeenCalledWith({
      action: NavigationOrigin.DRAFT_RESUMED,
      jid: 'TESTJURISDICTION',
      ctid: 'TEST',
      etid: TRIGGERS[1].id,
      queryParams: {ignoreWarning: true, draft: 'DRAFT123', origin: 'viewDraft'}
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

  it('should change button label when notified about callback errors', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();

    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    let eventTrigger = eventTriggerElement.componentInstance;

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_START);

    callbackErrorsContext.trigger_text = CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE);
  });

  it('should initially not display form errors', () => {
    let error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
  });

  it('should clear errors and warnings', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();
    component.clearErrorsAndWarnings();
    let error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
    expect(component.ignoreWarning).toBeFalsy();
  });

  it('should display generic error heading and message when form error is set but no callback errors, warnings, or error details', () => {
    ERROR.status = 200;
    ERROR.callbackErrors = null;
    ERROR.callbackWarnings = null;
    ERROR.details = null;
    errorNotifierService.announceError(ERROR);
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeTruthy();

    const errorHeading = error.query($ERROR_HEADING_GENERIC);
    expect(text(errorHeading)).toBe(ERROR_HEADING_GENERIC);

    const errorMessage = error.query($ERROR_MESSAGE_GENERIC);
    expect(text(errorMessage)).toBe(ERROR_MESSAGE_GENERIC);
  });

  it('should display specific error heading and message, and callback data field validation errors (if any)', () => {
    ERROR.status = 422;
    ERROR.details = {
      field_errors: [
        {
          message: 'First field error'
        },
        {
          message: 'Second field error'
        }
      ]
    };
    errorNotifierService.announceError(ERROR);
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeTruthy();

    const errorHeading = error.query($ERROR_HEADING_SPECIFIC);
    expect(text(errorHeading)).toBe(ERROR_HEADING_SPECIFIC);

    const errorMessage = error.query($ERROR_MESSAGE_SPECIFIC);
    expect(text(errorMessage)).toBe(ERROR.message);

    const fieldErrorList = de.query($CALLBACK_DATA_FIELD_ERROR_LIST);
    expect(fieldErrorList).toBeTruthy();
    const firstFieldError = fieldErrorList.query($FIRST_FIELD_ERROR);
    expect(text(firstFieldError)).toBe('First field error');
    const secondFieldError = fieldErrorList.query($SECOND_FIELD_ERROR);
    expect(text(secondFieldError)).toBe('Second field error');
  });

  it('should not display generic error heading and message when there are specific callback errors', () => {
    ERROR.status = 422;
    ERROR.callbackErrors = ['First error', 'Second error'];
    ERROR.details = null;
    errorNotifierService.announceError(ERROR);
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
  });

  it('should not display generic error heading and message when there are specific callback warnings', () => {
    ERROR.status = 422;
    ERROR.callbackWarnings = ['First warning', 'Second warning'];
    ERROR.details = null;
    errorNotifierService.announceError(ERROR);
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
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
    component.error = HttpError.from(null);
    fixture.detectChanges();

    expect(component.isTriggerButtonDisabled()).toBeFalsy();
    const error = HttpError.from(null);
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
    const httpError = HttpError.from(new HttpErrorResponse({error: VALID_ERROR}));
    component.error = httpError;

    const eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    const eventTrigger = eventTriggerElement.componentInstance;

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

xdescribe('CaseFullAccessViewComponent - no tabs available', () => {

  beforeEach(async(() => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(Observable.of({}));

    caseNotifier = createSpyObj('caseService', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(Observable.of({}));
    alertService.success.and.returnValue(Observable.of({}));
    alertService.warning.and.returnValue(Observable.of({}));

    navigationNotifierService = new NavigationNotifierService();
    spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
    errorNotifierService = new ErrorNotifierService();
    spyOn(errorNotifierService, 'announceError').and.callThrough();

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity']);
    activityService.postViewActivity.and.returnValue(Observable.of());

    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next', 'subscribe', 'unsubscribe']);

    CASE_VIEW.tabs = [];

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          PaymentLibModule
        ],
        declarations: [
          CaseFullAccessViewComponent,
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
          MarkdownComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          {provide: NavigationNotifierService, useValue: navigationNotifierService},
          {provide: ErrorNotifierService, useValue: errorNotifierService},
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          {provide: OrderService, useValue: orderService},
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: ActivityPollingService, useValue: activityService},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseFullAccessViewComponent);
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

xdescribe('CaseFullAccessViewComponent - print and event selector disabled', () => {

  beforeEach(async(() => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(Observable.of({}));

    caseNotifier = createSpyObj('caseNotifier', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(Observable.of({}));
    alertService.success.and.returnValue(Observable.of({}));
    alertService.warning.and.returnValue(Observable.of({}));

    navigationNotifierService = new NavigationNotifierService();
    spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
    errorNotifierService = new ErrorNotifierService();
    spyOn(errorNotifierService, 'announceError').and.callThrough();

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity']);
    activityService.postViewActivity.and.returnValue(Observable.of());

    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next', 'subscribe', 'unsubscribe']);

    CASE_VIEW.tabs = [];

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          PaymentLibModule
        ],
        declarations: [
          CaseFullAccessViewComponent,
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
          MarkdownComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          {provide: NavigationNotifierService, useValue: navigationNotifierService},
          {provide: ErrorNotifierService, useValue: errorNotifierService},
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          {provide: OrderService, useValue: orderService},
          {provide: ActivityPollingService, useValue: activityService},
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseFullAccessViewComponent);
    component = fixture.componentInstance;
    component.hasPrint = false;
    component.hasEventSelector = false;

    component.callbackErrorsSubject = mockCallbackErrorSubject;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should not display print and event selector if disabled via inputs', () => {
    let eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    let printLink = de.query($PRINT_LINK);

    expect(eventTriggerElement).toBeFalsy();
    expect(printLink).toBeFalsy();
  });
});

describe('CaseFullAccessViewComponent - prependedTabs', () => {

  let comp: CaseFullAccessViewComponent;
  let f: ComponentFixture<CaseFullAccessViewComponent>;
  let d: DebugElement;
  let convertHrefToRouterService;

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          ComplexModule,
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          RouterTestingModule.withRoutes([
            {
              path: 'cases',
              children: [
                {
                  path: 'case-details',
                  children: [
                    {
                      path: ':id',
                      children: [
                        {
                          path: 'tasks',
                          component: TasksContainerComponent
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ])
        ],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useClass: class MockLocation {
              public path =  (includeHash: string) => 'cases/case-details/1234567890123456/tasks'
            }
          },
          ErrorNotifierService,
          {provide: AbstractAppConfig, useClass: AppMockConfig},
          NavigationNotifierService,
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    f = TestBed.createComponent(CaseFullAccessViewComponent);
    comp = f.componentInstance;
    comp.caseDetails = CASE_VIEW;
    comp.prependedTabs = [
      {
        id: 'tasks',
        label: 'Tasks',
        fields: [],
        show_condition: null
      },
      {
        id: 'roles-and-access',
        label: 'Roles and access',
        fields: [],
        show_condition: null
      }
    ];
    d = f.debugElement;
    f.detectChanges();
  }));

  it('should render two pretended tabs', () => {
    const matTabLabels: DebugElement = d.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    expect(matTabHTMLElement.children.length).toBe(5);
  });

  it('should display "Tasks" tab as the first tab ', () => {
    const matTabLabels: DebugElement = d.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    const tasksTab: HTMLElement = matTabHTMLElement.children[0] as HTMLElement;
    expect((<HTMLElement>tasksTab.querySelector('.mat-tab-label-content')).innerText).toBe('Tasks');
  });
})

describe('CaseFullAccessViewComponent - appendedTabs', () => {

  let comp: CaseFullAccessViewComponent;
  let f: ComponentFixture<CaseFullAccessViewComponent>;
  let d: DebugElement;
  let convertHrefToRouterService;

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          ComplexModule,
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          RouterTestingModule.withRoutes([
            {
              path: 'cases',
              children: [
                {
                  path: 'case-details',
                  children: [
                    {
                      path: ':id',
                      children: [
                        {
                          path: 'tasks',
                          component: TasksContainerComponent
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ])
        ],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useClass: class MockLocation {
              public path =  (includeHash: string) => 'cases/case-details/1234567890123456/tasks'
            }
          },
          ErrorNotifierService,
          {provide: AbstractAppConfig, useClass: AppMockConfig},
          NavigationNotifierService,
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    f = TestBed.createComponent(CaseFullAccessViewComponent);
    comp = f.componentInstance;
    comp.caseDetails = CASE_VIEW;
    comp.prependedTabs = [
      {
        id: 'tasks',
        label: 'Tasks',
        fields: [],
        show_condition: null
      },
      {
        id: 'roles-and-access',
        label: 'Roles and access',
        fields: [],
        show_condition: null
      }
    ];
    comp.appendedTabs = [
      {
        id: 'hearings',
        label: 'Hearings',
        fields: [],
        show_condition: null
      }
    ];
    d = f.debugElement;
    f.detectChanges();
  }));

  it('should render appended tabs hearings', () => {
    const matTabLabels: DebugElement = d.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    expect(matTabHTMLElement.children.length).toBe(6);
    const hearingsTab: HTMLElement = matTabHTMLElement.children[5] as HTMLElement;
    expect((<HTMLElement>hearingsTab.querySelector('.mat-tab-label-content')).innerText).toBe('Hearings');
  });

})

describe('CaseFullAccessViewComponent - ends with caseID', () => {

  let comp: CaseFullAccessViewComponent;
  let compFixture: ComponentFixture<CaseFullAccessViewComponent>;
  let debugElement: DebugElement;
  let convertHrefToRouterService;

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          ComplexModule,
          BrowserAnimationsModule,
          PaletteModule,
          RouterTestingModule.withRoutes([
            {
              path: 'cases',
              children: [
                {
                  path: 'case-details',
                  children: [
                    {
                      path: ':id',
                      children: [
                        {
                          path: 'tasks',
                          component: TasksContainerComponent
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]),
        ],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent,
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useClass: class MockLocation {
              public path =  (includeHash: string) => 'cases/case-details/1234567890123456'
            }
          },
          ErrorNotifierService,
          {provide: AbstractAppConfig, useClass: AppMockConfig},
          NavigationNotifierService,
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    compFixture = TestBed.createComponent(CaseFullAccessViewComponent);
    comp = compFixture.componentInstance;
    comp.caseDetails = CASE_VIEW;
    debugElement = compFixture.debugElement;
    compFixture.detectChanges();
  }));

  it('should render 1st order of tabs', () => {
    const matTabLabels: DebugElement = debugElement.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    expect(matTabHTMLElement.children.length).toBe(3);
    const hearingsTab: HTMLElement = matTabHTMLElement.children[0] as HTMLElement;
    expect((<HTMLElement>hearingsTab.querySelector('.mat-tab-label-content')).innerText).toBe('History');
  });

})

// noinspection DuplicatedCode
describe('CaseFullAccessViewComponent - Overview with prepended Tabs', () => {
  let mockLocation: any;

  let caseViewerComponent: CaseFullAccessViewComponent;
  let componentFixture: ComponentFixture<CaseFullAccessViewComponent>;
  let debugElement: DebugElement;
  let convertHrefToRouterService;
  const prependedTabsList = [
    {
      id: 'tasks',
      label: 'Tasks',
      fields: [],
      show_condition: null
    },
    {
      id: 'roles-and-access',
      label: 'Roles and access',
      fields: [],
      show_condition: null
    }
  ];

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('/case/IA/Asylum/1641014744613435/trigger/sendDirection'));
    navigationNotifierService = new NavigationNotifierService();
    spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
    mockLocation = createSpyObj('location', ['path']);
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330#caseNotes');
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          ComplexModule,
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          RouterTestingModule.withRoutes([
            {
              path: 'cases',
              children: [
                {
                  path: 'case-details',
                  children: [
                    {
                      path: ':id#overview',
                      children: [
                        {
                          path: 'tasks',
                          component: TasksContainerComponent
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ])
        ],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useValue: mockLocation
          },
          ErrorNotifierService,
          {provide: AbstractAppConfig, useClass: AppMockConfig},
          NavigationNotifierService,
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    componentFixture = TestBed.createComponent(CaseFullAccessViewComponent);
    caseViewerComponent = componentFixture.componentInstance;
    caseViewerComponent.caseDetails = WORK_ALLOCATION_CASE_VIEW;
    caseViewerComponent.appendedTabs = [
      {
        id: 'hearings',
        label: 'Hearings',
        fields: [],
        show_condition: null
      }
    ];
    caseViewerComponent.prependedTabs = [
      {
        id: 'tasks',
        label: 'Tasks',
        fields: [],
        show_condition: null
      },
      {
        id: 'roles-and-access',
        label: 'Roles and access',
        fields: [],
        show_condition: null
      }
    ];
    debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
  }));

  it('should display overview tab by default', () => {
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('/case/IA/Asylum/1641014744613435/trigger/sendDirection'));
    componentFixture.detectChanges();
    const matTabLabels: DebugElement = debugElement.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    const tasksTab0: HTMLElement = matTabHTMLElement.children[0] as HTMLElement;
    expect((<HTMLElement>tasksTab0.querySelector('.mat-tab-label-content')).innerText).toBe('Tasks');
    const tasksTab1: HTMLElement = matTabHTMLElement.children[1] as HTMLElement;
    expect((<HTMLElement>tasksTab1.querySelector('.mat-tab-label-content')).innerText).toBe('Roles and access');
    const tasksTab2: HTMLElement = matTabHTMLElement.children[2] as HTMLElement;
    expect((<HTMLElement>tasksTab2.querySelector('.mat-tab-label-content')).innerText).toBe('Overview');
    const tasksTab3: HTMLElement = matTabHTMLElement.children[3] as HTMLElement;
    expect((<HTMLElement>tasksTab3.querySelector('.mat-tab-label-content')).innerText).toBe('Case notes');
    const tasksTab4: HTMLElement = matTabHTMLElement.children[4] as HTMLElement;
    expect((<HTMLElement>tasksTab4.querySelector('.mat-tab-label-content')).innerText).toBe('Hearings');
  });

  it('should add prepended & appended tabs to the existing tab list', () => {
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('/case/IA/Asylum/1641014744613435/trigger/sendDirection'));
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) })
    componentFixture.detectChanges();
    expect(caseViewerComponent.tabGroup._tabs.length).toEqual(5);
  });

  it('should return blank array when pretended tabs are null', () => {
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330');
    componentFixture.detectChanges();
    caseViewerComponent.prependedTabs = null;
    caseViewerComponent.organiseTabPosition();
    expect(caseViewerComponent.prependedTabs).toEqual([]);
  });

  it('should return tabs', () => {
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) })
    componentFixture.detectChanges();
    expect(caseViewerComponent.hasTabsPresent).toBeTruthy();
  })

  it('should navigate to roles and access tab', () => {
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/roles-and-access');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) })
    componentFixture.detectChanges();
    expect(caseViewerComponent.tabGroup.selectedIndex).toEqual(0);
  });

});

describe('CaseFullAccessViewComponent - get default hrefMarkdownLinkContent', () => {
  let mockLocation: any;

  let caseViewerComponent: CaseFullAccessViewComponent;
  let componentFixture: ComponentFixture<CaseFullAccessViewComponent>;
  let debugElement: DebugElement;
  let convertHrefToRouterService;
  let subscribeSpy: jasmine.Spy;
  let subscriptionMock: Subscription = new Subscription();

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('Default'));

    mockLocation = createSpyObj('location', ['path']);
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330#caseNotes');
    subscribeSpy = spyOn(subscriptionMock, 'unsubscribe');
    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(Observable.of({}));
    alertService.success.and.returnValue(Observable.of({}));
    alertService.warning.and.returnValue(Observable.of({}));

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          ComplexModule,
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          RouterTestingModule.withRoutes([
            {
              path: 'cases',
              children: [
                {
                  path: 'case-details',
                  children: [
                    {
                      path: ':id#overview',
                      children: [
                        {
                          path: 'tasks',
                          component: TasksContainerComponent
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ])
        ],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          // Mock
          CaseActivityComponent,
          EventTriggerComponent,
          CaseHeaderComponent,
          LinkComponent,
          CallbackErrorsComponent
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useValue: mockLocation
          },
          ErrorNotifierService,
          {provide: AbstractAppConfig, useClass: AppMockConfig},
          NavigationNotifierService,
          {provide: CaseNotifier, useValue: caseNotifier},
          {provide: ActivatedRoute, useValue: mockRoute},
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          {provide: DraftService, useValue: draftService},
          {provide: AlertService, useValue: alertService},
          {provide: MatDialog, useValue: dialog},
          {provide: MatDialogRef, useValue: matDialogRef},
          {provide: MatDialogConfig, useValue: DIALOG_CONFIG},
          {provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService},
          DeleteOrCancelDialogComponent
        ]
      })
      .compileComponents();

    componentFixture = TestBed.createComponent(CaseFullAccessViewComponent);
    caseViewerComponent = componentFixture.componentInstance;
    caseViewerComponent.caseDetails = WORK_ALLOCATION_CASE_VIEW;
    caseViewerComponent.prependedTabs = [
      {
        id: 'tasks',
        label: 'Tasks',
        fields: [],
        show_condition: null
      },
      {
        id: 'roles-and-access',
        label: 'Roles and access',
        fields: [],
        show_condition: null
      }
    ];
    debugElement = componentFixture.debugElement;
    componentFixture.detectChanges();
    de = componentFixture.debugElement;
  }));

  it('should not call callAngularRouter() on initial (default) value', (done) => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('Default'));
    componentFixture.detectChanges();
    convertHrefToRouterService.getHrefMarkdownLinkContent().subscribe((hrefMarkdownLinkContent: string) => {
      expect(convertHrefToRouterService.callAngularRouter).not.toHaveBeenCalled();
      done();
    });
  });

  it('should clear errors and warnings', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
    caseViewerComponent.callbackErrorsNotify(callbackErrorsContext);
    componentFixture.detectChanges();

    let eventTriggerElement = debugElement.query(By.directive(EventTriggerComponent));
    let eventTrigger = eventTriggerElement.componentInstance;

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_START);

    callbackErrorsContext.trigger_text = CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE;
    caseViewerComponent.callbackErrorsNotify(callbackErrorsContext);
    componentFixture.detectChanges();

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE);
  });

  it('should return true for tab available', () => {
    expect(caseViewerComponent.hasTabsPresent()).toEqual(true);
  })

  it('should pass flag to disable button when form valid but callback errors exist', () => {
    caseViewerComponent.error = HttpError.from(null);
    componentFixture.detectChanges();

    expect(caseViewerComponent.isTriggerButtonDisabled()).toBeFalsy();
    const error = HttpError.from(null);
    error.callbackErrors = ['anErrors'];
    caseViewerComponent.error = error;
    componentFixture.detectChanges();

    expect(caseViewerComponent.isTriggerButtonDisabled()).toBeTruthy();
  });

  it('should unsubscribe', () => {
    caseViewerComponent.unsubscribe(subscriptionMock);
    expect(subscribeSpy).toHaveBeenCalled();
  });

  it('should not unsubscribe', () => {
    subscriptionMock = null;
    caseViewerComponent.unsubscribe(subscriptionMock);
    expect(subscribeSpy).not.toHaveBeenCalled();
  });
});
