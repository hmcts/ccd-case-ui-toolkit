import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, EventEmitter, Input, NO_ERRORS_SCHEMA, Output, SimpleChange } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import clone from 'just-clone';
import { MockComponent } from 'ng2-mock-component';
import { RpxTranslationService } from 'rpx-xui-translation';
import { of, Subject, Subscription } from 'rxjs';
import { AppMockConfig } from '../../../../app-config.mock';
import { AbstractAppConfig } from '../../../../app.config';
import { NotificationBannerModule } from '../../../../components/banners/notification-banner/notification-banner.module';
import { CallbackErrorsContext } from '../../../components/error/domain';
import { PaletteUtilsModule } from '../../../components/palette/utils';
import { ConditionalShowRegistrarService } from '../../../directives';
import { LabelSubstitutorDirective } from '../../../directives/substitutor';
import { PlaceholderService } from '../../../directives/substitutor/services';
import { CaseTab, CaseView, CaseViewEvent, CaseViewTrigger } from '../../../domain/case-view';
import { CaseViewEventIds } from '../../../domain/case-view/case-view-event-ids.enum';
import { CaseField } from '../../../domain/definition';
import { HttpError } from '../../../domain/http';
import { CaseReferencePipe } from '../../../pipes/case-reference';
import {
  ActivityService,
  AuthService,
  CaseFieldService,
  ErrorNotifierService,
  FieldsPurger,
  FieldsUtils,
  FieldTypeSanitiser,
  FormErrorService,
  FormValueService,
  HttpErrorService,
  HttpService,
  LoadingService,
  NavigationNotifierService,
  NavigationOrigin,
  ProfileNotifier,
  ProfileService,
  SessionStorageService
} from '../../../services/';
import { ActivityPollingService } from '../../../services/activity/activity.polling.service';
import { AlertService } from '../../../services/alert';
import { DraftService } from '../../../services/draft';
import { OrderService } from '../../../services/order';
import { attr, text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseEditComponent, CaseEditPageComponent, CaseNotifier, ConvertHrefToRouterService, PageValidationService, WizardFactoryService } from '../../case-editor';
import { DeleteOrCancelDialogComponent } from '../../dialogs';
import { CaseFlagStatus, PaletteModule } from '../../palette';
import { CaseFullAccessViewComponent } from './case-full-access-view.component';
import createSpyObj = jasmine.createSpyObj;
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';
import { LinkedCasesService } from '../../palette/linked-cases/services';

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
  public selected: boolean;
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
  public triggers: CaseViewTrigger[];

  @Input()
  public triggerText: string;

  @Input()
  public isDisabled: boolean;

  @Output()
  public onTriggerSubmit: EventEmitter<CaseViewTrigger> = new EventEmitter();

  @Output()
  public onTriggerChange: EventEmitter<any> = new EventEmitter();
}

@Component({
  selector: 'ccd-callback-errors',
  template: ``
})
class CallbackErrorsComponent {
  @Input()
  public triggerTextIgnore: string;
  @Input()
  public triggerTextContinue: string;
  @Input()
  public callbackErrorsSubject: Subject<any> = new Subject();
  @Output()
  public callbackErrorsContext: EventEmitter<any> = new EventEmitter();

}

const caseHeaderComponentMock: any = MockComponent({
  selector: 'ccd-case-header',
  inputs: ['caseDetails']
});

const markdownComponentMock: any = MockComponent({
  selector: 'ccd-markdown',
  inputs: ['content']
});

const caseActivityComponentMock: any = MockComponent({
  selector: 'ccd-activity',
  inputs: ['caseId', 'displayMode']
});

const fieldReadComponentMock: any = MockComponent({
  selector: 'ccd-field-read', inputs: [
    'caseField',
    'caseReference'
  ]
});

const linkComponentMock: any = MockComponent({
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
    {
      id: 'CaseFlagsTab',
      label: 'Case flags',
      fields: [
        Object.assign(new CaseField(), {
          id: 'FlagLauncher1',
          label: 'Flag launcher',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'FlagLauncher',
            type: 'FlagLauncher'
          },
          order: 4,
          value: null,
          show_condition: '',
          hint_text: ''
        }),
        Object.assign(new CaseField(), {
          id: 'CaseFlag1',
          label: 'First Case Flag',
          display_context: null,
          field_type: {
            id: 'Flags',
            type: 'Complex',
            complex_fields: []
          },
          value: {
            partyName: 'John Smith',
            roleOnCase: '',
            details: [
              {
                id: '9c2129ba-3fc6-4bae-afc3-32808ffd9cbe',
                value: {
                  name: 'Wheel chair access',
                  subTypeValue: '',
                  subTypeKey: '',
                  otherDescription: '',
                  flagComment: '',
                  dateTimeModified: new Date('2021-09-09 00:00:00'),
                  dateTimeCreated: new Date('2021-09-09 00:00:00'),
                  path: [],
                  hearingRelevant: false,
                  flagCode: '',
                  status: CaseFlagStatus.ACTIVE
                }
              },
              {
                id: '9125aac8-1506-4753-b820-b3a3be451235',
                value: {
                  name: 'Sign language',
                  subTypeValue: 'British Sign Language (BSL)',
                  subTypeKey: '',
                  otherDescription: '',
                  flagComment: '',
                  dateTimeModified: new Date('2021-09-09 00:00:00'),
                  dateTimeCreated: new Date('2021-09-09 00:00:00'),
                  path: [],
                  hearingRelevant: false,
                  flagCode: '',
                  status: CaseFlagStatus.INACTIVE
                }
              }
            ]
          },
        })
      ],
      show_condition: null
    }
  ],
  triggers: TRIGGERS,
  events: EVENTS,
  metadataFields: METADATA,
};

const mockRoute: any = {
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
const CASE_FLAGS_READ_EXTERNAL_MODE = '#ARGUMENT(READ,EXTERNAL)';

let fixture: ComponentFixture<CaseFullAccessViewComponent>;
let fixtureDialog: ComponentFixture<DeleteOrCancelDialogComponent>;
let componentDialog: DeleteOrCancelDialogComponent;
let deDialog: DebugElement;
let component: CaseFullAccessViewComponent;
let de: DebugElement;

let orderService: OrderService;
let mockCallbackErrorSubject: any;
let activityService: jasmine.SpyObj<ActivityPollingService>;
let draftService: jasmine.SpyObj<DraftService>;
let alertService: jasmine.SpyObj<AlertService>;
let dialog: jasmine.SpyObj<MatDialog>;
let matDialogRef: jasmine.SpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>;
let caseNotifier: jasmine.SpyObj<CaseNotifier>;
let navigationNotifierService: NavigationNotifierService;
let errorNotifierService: ErrorNotifierService;

describe('CaseFullAccessViewComponent', () => {
  let caseViewData: CaseView;
  let FIELDS: CaseField[];
  let SIMPLE_FIELDS: CaseField[];
  let COMPLEX_FIELDS: CaseField[];
  let mockRouterEvents: any;

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';
  const ERROR_HEADING_GENERIC = 'Something went wrong';
  const ERROR_MESSAGE_GENERIC = 'We\'re working to fix the problem. Try again shortly.';
  const ERROR_HEADING_SPECIFIC = 'The callback data failed validation';
  let convertHrefToRouterMockService: jasmine.SpyObj<ConvertHrefToRouterService>;
  let sessionStorageMockService: jasmine.SpyObj<SessionStorageService>;
  let router: Router;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>;
  let errorSource: Subject<any>;
  beforeEach((() => {
    mockRouterEvents = of(new NavigationEnd(1, 'url', 'urlAfterRedirects'));

    router = {
      events: mockRouterEvents,
      navigate: jasmine.createSpy('navigate')
    } as any;

    errorSource = new Subject<any>();
    mockLocation = createSpyObj<Location>('Location', ['path']);
    mockDialog = createSpyObj<MatDialog>('MatDialog', ['open']);
    // Clone
    caseViewData = clone(CASE_VIEW);
    caseViewData.metadataFields = caseViewData.metadataFields.map(field => Object.assign(new CaseField(), field));
    FIELDS = caseViewData.tabs[0].fields;
    SIMPLE_FIELDS = caseViewData.tabs[0].fields.slice(0, 2);
    COMPLEX_FIELDS = caseViewData.tabs[0].fields.slice(2);

    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(of({}));

    caseNotifier = createSpyObj('caseService', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(of({}));
    alertService.success.and.returnValue(of({}));
    alertService.warning.and.returnValue(of({}));

    navigationNotifierService = new NavigationNotifierService();
    spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
    errorNotifierService = new ErrorNotifierService();

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity', 'isEnabled']);
    activityService.postViewActivity.and.returnValue(of());
    activityService.isEnabled.valueOf();

    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next', 'subscribe', 'unsubscribe']);

    convertHrefToRouterMockService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterMockService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));

    sessionStorageMockService = jasmine.createSpyObj('SessionStorageService', ['getItem', 'setItem', 'removeItem']);
    mockDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('MatDialogRef', ['afterClosed']);
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          PaymentLibModule,
          RouterTestingModule
        ],
        declarations: [
          CaseFullAccessViewComponent,
          LabelSubstitutorDirective,
          DeleteOrCancelDialogComponent,
          CallbackErrorsComponent,
          TabsComponent,
          TabComponent,
          EventTriggerComponent,
          // Mocks
          caseActivityComponentMock,
          fieldReadComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          markdownComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          { provide: NavigationNotifierService, useValue: navigationNotifierService },
          { provide: ErrorNotifierService, useValue: errorNotifierService },
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: OrderService, useValue: orderService },
          { provide: ActivityPollingService, useValue: activityService },
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          DeleteOrCancelDialogComponent,
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterMockService },
          { provide: SessionStorageService, useValue: sessionStorageMockService },
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate']) },
          LoadingService,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CaseFullAccessViewComponent);
    component = fixture.componentInstance;
    component.callbackErrorsSubject = mockCallbackErrorSubject;
    component.caseDetails = caseViewData;
    component.prependedTabs = [
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
    de = fixture.debugElement;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }));
  
it('should set case view tab based on navigation end event', () => {
    // Mock tabGroup._tabs with some dummy values for testing
    component.tabGroup = { _tabs: [{ textLabel: 'Tab1' }, { textLabel: 'Tab2' }] } as any;

    component['checkRouteAndSetCaseViewTab()'];

    // Since we're using mockRouterEvents, the navigation end event should trigger the subscription
    expect(component.tabGroup._tabs[0].textLabel).toEqual('Tab1');

    // Trigger the NavigationEnd event
    mockRouterEvents.subscribe((event: NavigationEnd) => {
      component['checkRouteAndSetCaseViewTab()'];
      expect(component.tabGroup._tabs[0].textLabel).toEqual('Tab1');
    });

    // Now simulate a URL with a tab name
    const urlWithTab = 'http://example.com#Tab2';
    mockRouterEvents = of(new NavigationEnd(1, urlWithTab, urlWithTab));

    mockRouterEvents.subscribe((event: NavigationEnd) => {
      component['checkRouteAndSetCaseViewTab()'];

      // Expect the second tab to be active now
      expect(component.tabGroup._tabs[0].textLabel).toEqual('Tab1');
      expect(component.tabGroup._tabs[1].textLabel).toEqual('Tab2');
    });
  })

  it('should call reset for linkedCaseService and caseFlagStateService oninit', () => {
    const linkedCasesService = TestBed.inject(LinkedCasesService);
    const caseFlagStateService = TestBed.inject(CaseFlagStateService);
    component.ngOnInit();
    expect(linkedCasesService.resetLinkedCaseData).toHaveBeenCalled();
    expect(caseFlagStateService.resetInitialCaseFlags).toHaveBeenCalled();
  });

  it('should unsubscribe from all subscriptions on destroy', () => {
    const sub = new Subscription();
    component['sub'] = [sub];
    spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(sub.unsubscribe).not.toHaveBeenCalled();
  });

  it('should clear errors and reset trigger text', () => {
    component.clearErrorsAndWarnings();
    expect(component.ignoreWarning).toBeFalsy();
    expect(component.triggerText).toBe(CaseFullAccessViewComponent.TRIGGER_TEXT_START);
  });

  it('should notify errors when callbackErrorsNotify is called', () => {
    const context = { ignoreWarning: true, triggerText: 'New Text', eventId: '123' } as CallbackErrorsContext;
    component.callbackErrorsNotify(context);
    expect(component.ignoreWarning).toBeTruthy();
    expect(component.triggerText).toBe('New Text');
    expect(component.eventId).toBe('123');
  });

  it('should render a case header', () => {
    const header = de.query(By.directive(caseHeaderComponentMock));
    expect(header).toBeTruthy();
    expect(header.componentInstance.caseDetails).toEqual(caseViewData);
  });

  describe('tabs', () => {
    it('should render the correct tabs based on show_condition', () => {
      // we expect address tab not to be rendered
      const tabHeaders = de.queryAll($ALL_TAB_HEADERS);
      expect(tabHeaders.length).toBe(caseViewData.tabs.length+1);
      expect(attr(tabHeaders[0], 'title')).toBe(null);
      expect(attr(tabHeaders[1], 'title')).toBe(null);
    });

    it('should render the history tab first and select it', () => {
      // we expect address tab not to be rendered
      const firstTabHeader = de.query($FIRST_TAB_HEADER);

      expect(firstTabHeader).toBeTruthy();
      expect(attr(firstTabHeader, 'title')).toBe(null);
    });

    it('should render each tab defined by the Case view', () => {
      // we expect address tab not to be rendered
      const tabHeaders = de.queryAll($ALL_TAB_HEADERS);
      expect(tabHeaders.length).toBe(caseViewData.tabs.length + 1);

      expect(tabHeaders.find(c => 'Name' === attr(c, 'title'))).toBeFalsy('Could not find tab Name');
      expect(tabHeaders.find(c => 'Some Tab' === attr(c, 'title'))).toBeFalsy('Could not find tab Some Tab');
    });

    xit('should render the field labels based on show_condition', () => {
      const headers = de
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
      const tabHeaders = de.queryAll($CASE_TAB_HEADERS);

      expect(attr(tabHeaders[0], 'title')).toBe(null);
      expect(orderService.sort).toHaveBeenCalledWith(caseViewData.tabs);
    });

    xit('should render a row for each field in a given tab', () => {
      const rows = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr'));
      expect(rows.length).toBe(FIELDS.length);
    });

    xit('should render each simple field label as a table header', () => {
      const headers = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr>th'));

      SIMPLE_FIELDS.forEach(field => {
        expect(headers.find(r => r.nativeElement.textContent.trim() === field.label))
          .toBeTruthy(`Could not find row with label ${field.label}`);
      });
    });
    it('should unsubscribe from subscriptions on destroy', () => {
      component.activitySubscription = new Subscription();
      component.caseSubscription = new Subscription();
      component.callbackErrorsSubject = new Subject<any>();
      component.errorSubscription = new Subscription();
      component.subscription = new Subscription();
      component['subs'] = [new Subscription(), new Subscription()];
  
      spyOn(component.activitySubscription, 'unsubscribe');
      spyOn(component.caseSubscription, 'unsubscribe');
      spyOn(component.errorSubscription, 'unsubscribe');
      spyOn(component.subscription, 'unsubscribe');
      component['subs'].forEach(sub => spyOn(sub, 'unsubscribe'));
  
      component.ngOnDestroy();
      component['activityPollingService'].isEnabled
      if (component['activityPollingService'].isEnabled) {
        expect(component.activitySubscription.unsubscribe).toHaveBeenCalled();
      } else {
        expect(component.activitySubscription.unsubscribe).not.toHaveBeenCalled();
      }
      if (!component['route'].snapshot.data.case) {
        expect(component.caseSubscription.unsubscribe).toHaveBeenCalled();
      } else {
        expect(component.caseSubscription.unsubscribe).not.toHaveBeenCalled();
      }
      expect(component.errorSubscription.unsubscribe).toHaveBeenCalled();
      expect(component.subscription.unsubscribe).toHaveBeenCalled();
      component['subs'].forEach(sub => expect(sub.unsubscribe).toHaveBeenCalled());
    });
    
  
    

    xit('should render each compound field without label as a cell spanning 2 columns', () => {
      const headers = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr.complex-field>th'));

      expect(headers.length).toBe(0);

      const cells = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr.compound-field>th'));

      expect(cells.length).toEqual(COMPLEX_FIELDS.length);
    });

    xit('should render each field value using FieldReadComponent', () => {
      const readFieldsFields = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr td>span>ccd-field-read'));

      const readFieldsCompound = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr th>span>ccd-field-read'));

      const readFields = readFieldsFields.concat(readFieldsCompound);

      FIELDS.forEach(field => {
        expect(readFields.find(f => {
          const fieldInstance = f.componentInstance;
          return JSON.stringify(fieldInstance.caseField) === JSON.stringify(field);
        }))
          .toBeTruthy(`Could not find field with type ${field.field_type}`);
      });
      expect(FIELDS.length).toBe(readFields.length);
    });

    xit('should render fields in ascending order', () => {
      const headers = de
        .query($NAME_TAB_CONTENT)
        .queryAll(By.css('tbody>tr>th'));


      expect(headers[0].nativeElement.textContent.trim()).toBe(FIELDS[1].label);
      expect(orderService.sort).toHaveBeenCalledWith(FIELDS);
    });
  });

  it('should handle route changes and set case view tab', () => {
    spyOn<any>(component, 'checkRouteAndSetCaseViewTab');
    component.ngOnInit();
    expect(component['checkRouteAndSetCaseViewTab']).toHaveBeenCalled();
  });

  it('should set error and emit value for non-401/403 status codes', () => {
    const errors = [
      { status: 400, message: 'Bad Request' },
      { status: 404, message: 'Not Found' },
      { status: 500, message: 'Internal Server Error' }
    ];

    const results = [];
    component.callbackErrorsSubject.subscribe(error => results.push(error));

    errors.forEach(error => errorSource.next(error));
    expect(component.isEventButtonClicked).toBeFalsy();
    expect(results.length).toEqual(0);
    expect(results).toEqual([]);
  });

  it('should not set error or emit value for 401/403 status codes', () => {
    const errors = [
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' }
    ];

    const results = [];
    component.callbackErrorsSubject.subscribe(error => results.push(error));

    errors.forEach(error => errorSource.next(error));
    expect(results.length).toBe(0);
    expect(component.error).toBeUndefined();
  });


  it('should render an event trigger', () => {
    const eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    expect(eventTriggerElement).toBeTruthy();

    const eventTrigger = eventTriggerElement.componentInstance;
    expect(eventTrigger.triggers).toEqual(TRIGGERS);
  });

  describe('applyTrigger', () => {
    it('should emit trigger event on trigger submit', () => {
      spyOn(component, 'applyTrigger').and.callThrough();

      const eventTriggerElement = de.query(By.directive(EventTriggerComponent));
      const eventTrigger = eventTriggerElement.componentInstance;

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

    it('should navigate to route when the id of the emitted trigger is CaseViewEventIds.QueryManagementRaiseQuery', async () => {
      const respondToQueryTrigger = new CaseViewTrigger();
      respondToQueryTrigger.id = CaseViewEventIds.QueryManagementRaiseQuery;
      const spyObj = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      await component.applyTrigger(respondToQueryTrigger);
      expect(spyObj).toHaveBeenCalledWith([`/query-management/query/${component.caseDetails.case_id}`]);
    });
  });

  it('should trigger the delete case event when delete case button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DeleteOrCancelDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();

    const dialogDeleteButton = deDialog.query($DIALOG_DELETE_BUTTON);
    dialogDeleteButton.nativeElement.click();

    expect(componentDialog.result).toEqual('Delete');
    fixture.detectChanges();
  });

  it('should not trigger the delete case event when cancel button is clicked', () => {
    fixtureDialog = TestBed.createComponent(DeleteOrCancelDialogComponent);
    componentDialog = fixtureDialog.componentInstance;
    deDialog = fixtureDialog.debugElement;
    fixtureDialog.detectChanges();

    const dialogCancelButton = deDialog.query($DIALOG_CANCEL_BUTTON);
    dialogCancelButton.nativeElement.click();

    expect(componentDialog.result).toEqual('Cancel');
    fixture.detectChanges();
  });

  it('should change button label when notified about callback errors', () => {
    const callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.triggerText = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();

    const eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    const eventTrigger = eventTriggerElement.componentInstance;

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_START);

    callbackErrorsContext.triggerText = CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE);
  });

  it('should initially not display form errors', () => {
    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
  });

  it('should clear errors and warnings', () => {
    const callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.triggerText = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);
    fixture.detectChanges();
    component.clearErrorsAndWarnings();
    const error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
    expect(component.ignoreWarning).toBeFalsy();
  });

  xit('should display generic error heading and message when form error is set but no callback errors, warnings, or error details', () => {
    ERROR.status = 200;
    ERROR.callbackErrors = null;
    ERROR.callbackWarnings = null;
    ERROR.details = null;
    errorNotifierService.announceError(ERROR);
    fixture.detectChanges();

    const error = de.query($ERROR_SUMMARY);
    // expect(error).toBeTruthy();

    const errorHeading = error.query($ERROR_HEADING_GENERIC);
    expect(text(errorHeading)).toBe(ERROR_HEADING_GENERIC);

    const errorMessage = error.query($ERROR_MESSAGE_GENERIC);
    expect(text(errorMessage)).toBe(ERROR_MESSAGE_GENERIC);
  });

  xit('should display specific error heading and message, and callback data field validation errors (if any)', () => {
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
    expect(error).toBeFalsy();

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
    const printLink = de.query($PRINT_LINK);

    expect(printLink).toBeTruthy();
    expect(printLink.componentInstance.routerLink).toEqual('print');
  });

  it('should not contain a print link if Draft', () => {
    component.caseDetails.case_id = 'DRAFT123';
    fixture.detectChanges();
    const printLink = de.query($PRINT_LINK);

    expect(printLink).toBeFalsy();
  });

  it('should not contain a print link if printableDocumentsUrl not configured', () => {
    component.caseDetails.case_type.printEnabled = null;
    fixture.detectChanges();
    const printLink = de.query($PRINT_LINK);
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

  xit('should clear alerts and errors when selected trigger changed', () => {
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
    component.error = HttpError.from(new HttpErrorResponse({ error: VALID_ERROR }));

    const eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    const eventTrigger = eventTriggerElement.componentInstance;
    const err = new HttpError()//{ timestamp: '2024-06-04T12:41:26.823Z', error: 'Unknown error', message: 'Something unexpected happened, our technical staff have been automatically notified', status: 500, exception: null, path: null, details: Object({ field_errors: [ Object({ x: '' }) ] }), callbackErrors: null, callbackWarnings: null });

    eventTrigger.onTriggerChange.next(null);
    fixture.detectChanges();

    //expect(alertService.clear).toHaveBeenCalled();
    expect(component.error).toEqual(VALID_ERROR);
   // expect(mockCallbackErrorSubject.next).toHaveBeenCalled();
  });

  it('should not clear alerts when there are no errors at init', () => {
    component.error = null;

    component.ngOnInit();
    fixture.detectChanges();

    expect(alertService.clear).not.toHaveBeenCalled();
  });
});

describe('CaseFullAccessViewComponent - prependedTabs', () => {
  let comp: CaseFullAccessViewComponent;
  let f: ComponentFixture<CaseFullAccessViewComponent>;
  let d: DebugElement;
  let convertHrefToRouterService: jasmine.SpyObj<ConvertHrefToRouterService>;

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          NotificationBannerModule,
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
          StoreModule.forRoot({}),
          EffectsModule.forRoot([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          EventTriggerComponent,
          CallbackErrorsComponent,
          // Mocks
          caseActivityComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useClass: class MockLocation {
              public path = (_: string) => 'cases/case-details/1234567890123456/tasks';
            }
          },
          ErrorNotifierService,
          { provide: AbstractAppConfig, useClass: AppMockConfig },
          NavigationNotifierService,
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate']) },
          DeleteOrCancelDialogComponent,
          LoadingService,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
        ],
        teardown: { destroyAfterEach: false }
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
    // Use a fake implementation of Router.navigate() to avoid unhandled navigation errors when invoked by
    // ngAfterViewInit() before each unit test
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    f.detectChanges();
  }));

  it('should render two prepended tabs', () => {
    const matTabLabels: DebugElement = d.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    expect(matTabHTMLElement.children.length).toBe(6);
  });

  it('should display "Tasks" tab as the first tab', () => {
    const matTabLabels: DebugElement = d.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    const tasksTab: HTMLElement = matTabHTMLElement.children[0] as HTMLElement;
    expect((tasksTab.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Tasks');
  });
});

describe('CaseFullAccessViewComponent - appendedTabs', () => {
  let comp: CaseFullAccessViewComponent;
  let f: ComponentFixture<CaseFullAccessViewComponent>;
  let d: DebugElement;
  let convertHrefToRouterService;
  let mockLocation: any;

  beforeEach((() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));

    mockLocation = createSpyObj('location', ['path', 'go', 'isCurrentPathEqualTo']);
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330#caseNotes');

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          NotificationBannerModule,
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
          StoreModule.forRoot({}),
          EffectsModule.forRoot([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          EventTriggerComponent,
          CallbackErrorsComponent,
          // Mocks
          caseActivityComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          { provide: Location, useValue: mockLocation },
          ErrorNotifierService,
          { provide: AbstractAppConfig, useClass: AppMockConfig },
          NavigationNotifierService,
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate', 'getTranslation$']) },
          DeleteOrCancelDialogComponent,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
        ],
        teardown: { destroyAfterEach: false }
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
    // Use a fake implementation of Router.navigate() to avoid unhandled navigation errors when invoked by
    // ngAfterViewInit() before each unit test
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    f.detectChanges();
  }));

  it('should render appended tabs hearings', () => {
    const matTabLabels: DebugElement = d.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    expect(matTabHTMLElement.children.length).toBe(7);
    const hearingsTab: HTMLElement = matTabHTMLElement.children[6] as HTMLElement;
    expect((hearingsTab.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Hearings');
  });

  it('should display active Case Flags banner message if at least one of the Case Flags is active', () => {
    // Spy on the hasActiveCaseFlags() function to check it is called in ngOnInit(), checking for active Case Flags
    spyOn(comp, 'hasActiveCaseFlags').and.callThrough();

    // Manual call of ngOnInit() to ensure activeCaseFlags boolean is set correctly
    comp.ngOnInit();

    expect(comp.hasActiveCaseFlags).toHaveBeenCalledTimes(1);
    const bannerElement = d.nativeElement.querySelector('.govuk-notification-banner');
    expect(bannerElement.textContent).toContain('There is 1 active flag on this case');
    expect(comp.activeCaseFlags).toBe(true);
  });

  it('should not display active Case Flags banner message if none of the Case Flags are active', () => {
    // Set first Case Flag status to "Inactive"
    CASE_VIEW.tabs[3].fields[1].value.details[0].value.status = CaseFlagStatus.INACTIVE;

    // Spy on the hasActiveCaseFlags() function to check it is called in ngOnInit(), checking for active Case Flags
    spyOn(comp, 'hasActiveCaseFlags').and.callThrough();

    // Manual call of ngOnInit() as above
    comp.ngOnInit();
    f.detectChanges();

    expect(comp.hasActiveCaseFlags).toHaveBeenCalledTimes(1);
    const bannerElement = d.nativeElement.querySelector('.govuk-notification-banner');
    expect(bannerElement).toBeNull();
    expect(comp.activeCaseFlags).toBe(false);
  });

  it('should display active Case Flags banner message with the correct text when there is more than one active Case Flag', () => {
    // Set both Case Flags' status to "Active"
    CASE_VIEW.tabs[3].fields[1].value.details[0].value.status = CaseFlagStatus.ACTIVE;
    CASE_VIEW.tabs[3].fields[1].value.details[1].value.status = CaseFlagStatus.ACTIVE;

    // Spy on the hasActiveCaseFlags() function to check it is called in ngOnInit(), checking for active Case Flags
    spyOn(comp, 'hasActiveCaseFlags').and.callThrough();

    // Manual call of ngOnInit() as above
    comp.ngOnInit();
    f.detectChanges();

    expect(comp.hasActiveCaseFlags).toHaveBeenCalledTimes(1);
    const bannerElement = d.nativeElement.querySelector('.govuk-notification-banner');
    expect(bannerElement.textContent).toContain('There are 2 active flags on this case');
    expect(comp.activeCaseFlags).toBe(true);
  });

  it('should select the tab containing Case Flags data when the "View case flags" link in the banner message is clicked', () => {
    const viewCaseFlagsLink = d.nativeElement.querySelector('.govuk-notification-banner__link');
    // Case Flags tab is expected to be the sixth tab (i.e. index 5)
    const caseFlagsTab = d.nativeElement.querySelector('.mat-tab-labels').children[5] as HTMLElement;
    expect(caseFlagsTab.getAttribute('aria-selected')).toEqual('false');
    // Click the "View case flags" link and check the Case Flags tab is now active
    viewCaseFlagsLink.click();
    f.detectChanges();
    expect(caseFlagsTab.getAttribute('aria-selected')).toEqual('true');
    // Change the active tab to a different one and check the Case Flags tab is no longer active
    comp.selectedTabIndex = 6;
    f.detectChanges();
    expect(caseFlagsTab.getAttribute('aria-selected')).toEqual('false');
    // Click the "View case flags" link and check the Case Flags tab is active again
    viewCaseFlagsLink.click();
    f.detectChanges();
    expect(caseFlagsTab.getAttribute('aria-selected')).toEqual('true');
  });

  it('should not display active Case Flags banner message for an external user, even if there are active Case Flags', () => {
    // Set the display_context_parameter attribute of the FlagLauncher CaseField to external mode
    CASE_VIEW.tabs[3].fields[0].display_context_parameter = CASE_FLAGS_READ_EXTERNAL_MODE;
    // Set both Case Flags' status to "Active"
    CASE_VIEW.tabs[3].fields[1].value.details[0].value.status = CaseFlagStatus.ACTIVE;
    CASE_VIEW.tabs[3].fields[1].value.details[1].value.status = CaseFlagStatus.ACTIVE;

    // Spy on the hasActiveCaseFlags() function to check it is called in ngOnInit(), checking for active Case Flags
    spyOn(comp, 'hasActiveCaseFlags').and.callThrough();

    // Manual call of ngOnInit() as above
    comp.ngOnInit();
    f.detectChanges();

    expect(comp.hasActiveCaseFlags).toHaveBeenCalledTimes(1);
    const bannerElement = d.nativeElement.querySelector('.govuk-notification-banner');
    expect(bannerElement).toBeNull();
    expect(comp.activeCaseFlags).toBe(true);
  });
});

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
                },
              ]
            }
          ]),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          EventTriggerComponent,
          CallbackErrorsComponent,
          // Mocks
          caseActivityComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          FieldsUtils,
          CaseEditComponent,
          CaseEditPageComponent,
          ConditionalShowRegistrarService,
          PlaceholderService,
          CaseReferencePipe,
          OrderService,
          {
            provide: Location,
            useClass: class MockLocation {
              public path = (_: string) => 'cases/case-details/1234567890123456';
            }
          },
          ErrorNotifierService,
          { provide: AbstractAppConfig, useClass: AppMockConfig },
          NavigationNotifierService,
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
          DeleteOrCancelDialogComponent,
          FieldsPurger,
          WizardFactoryService,
          ProfileService,
          ProfileNotifier,
          FormValueService,
          FormErrorService,
          FieldTypeSanitiser,
          PageValidationService,
          CaseFieldService,
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate', 'getTranslation$']) },
          LoadingService,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
        ],
        teardown: { destroyAfterEach: false }
      })
      .compileComponents();

    compFixture = TestBed.createComponent(CaseFullAccessViewComponent);
    comp = compFixture.componentInstance;
    comp.caseDetails = CASE_VIEW;
    debugElement = compFixture.debugElement;
    // Use a fake implementation of Router.navigate() to avoid unhandled navigation errors when invoked by
    // ngAfterViewInit() before each unit test
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    compFixture.detectChanges();
  }));

  it('should render 1st order of tabs', () => {
    const matTabLabels: DebugElement = debugElement.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    expect(matTabHTMLElement.children.length).toBe(4);
    const hearingsTab: HTMLElement = matTabHTMLElement.children[0] as HTMLElement;
    expect((hearingsTab.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('History');
  });
});

// noinspection DuplicatedCode
describe('CaseFullAccessViewComponent - Overview with prepended Tabs', () => {
  let mockLocation: any;

  let caseViewerComponent: CaseFullAccessViewComponent;
  let componentFixture: ComponentFixture<CaseFullAccessViewComponent>;
  let debugElement: DebugElement;
  let convertHrefToRouterService;
  let router: Router;
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

  beforeEach(waitForAsync(() => {
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
          BrowserAnimationsModule,
          PaletteModule,
          PaymentLibModule,
          NotificationBannerModule,
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
          ]),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          EventTriggerComponent,
          CallbackErrorsComponent,
          // Mocks
          caseActivityComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          MockRpxTranslatePipe
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
          { provide: AbstractAppConfig, useClass: AppMockConfig },
          NavigationNotifierService,
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate', 'getTranslation$']) },
          DeleteOrCancelDialogComponent,
          LoadingService,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
        ],
        teardown: { destroyAfterEach: false }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    componentFixture = TestBed.createComponent(CaseFullAccessViewComponent);
    caseViewerComponent = componentFixture.componentInstance;
    caseViewerComponent.caseDetails = WORK_ALLOCATION_CASE_VIEW;
    caseViewerComponent.appendedTabs = [
      {
        id: 'hearings',
        label: 'Hearings',
        fields: [],
        show_condition: null
      },
      {
        id: 'caseNotes',
        label: 'Case notes',
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
    router = TestBed.inject(Router);
    componentFixture.detectChanges();
  });

  it('should display overview tab by default', () => {
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('/case/IA/Asylum/1641014744613435/trigger/sendDirection'));
    componentFixture.detectChanges();
    const matTabLabels: DebugElement = debugElement.query(By.css('.mat-tab-labels'));
    const matTabHTMLElement: HTMLElement = matTabLabels.nativeElement as HTMLElement;
    const tasksTab0: HTMLElement = matTabHTMLElement.children[0] as HTMLElement;
    expect((tasksTab0.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Tasks');
    const tasksTab1: HTMLElement = matTabHTMLElement.children[1] as HTMLElement;
    expect((tasksTab1.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Roles and access');
    const tasksTab2: HTMLElement = matTabHTMLElement.children[2] as HTMLElement;
    expect((tasksTab2.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Overview');
    const tasksTab3: HTMLElement = matTabHTMLElement.children[3] as HTMLElement;
    expect((tasksTab3.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Case notes');
    const tasksTab4: HTMLElement = matTabHTMLElement.children[4] as HTMLElement;
    expect((tasksTab4.querySelector('.mat-tab-label-content') as HTMLElement).innerText).toBe('Hearings');
  });

  it('should add prepended & appended tabs to the existing tab list', () => {
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('/case/IA/Asylum/1641014744613435/trigger/sendDirection'));
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    componentFixture.detectChanges();
    expect(caseViewerComponent.tabGroup._tabs.length).toEqual(6);
  });

  it('should return blank array when prepended tabs are null', () => {
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330');
    componentFixture.detectChanges();
    caseViewerComponent.prependedTabs = null;
    caseViewerComponent.organiseTabPosition();
    expect(caseViewerComponent.prependedTabs).toEqual([]);
  });

  it('should return tabs', () => {
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    componentFixture.detectChanges();
    expect(caseViewerComponent.hasTabsPresent).toBeTruthy();
  });

  it('should navigate to roles and access tab', () => {
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/roles-and-access');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    componentFixture.detectChanges();
    expect(caseViewerComponent.tabGroup.selectedIndex).toEqual(1);
  });

  it('should set tabGroup selected index if a non-roles/tasks/hearings tab with ID matching last path of the URL is found', fakeAsync(() => {
    spyOn(caseViewerComponent, 'organiseTabPosition').and.callThrough();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const selectedIndexSetSpy = spyOnProperty(caseViewerComponent.tabGroup, 'selectedIndex', 'set').and.callThrough();
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/caseNotes');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    tick();
    componentFixture.detectChanges();
    expect(caseViewerComponent.organiseTabPosition).toHaveBeenCalled();
    // Selected index is actually the *absolute* position of the "Case notes" tab (after Tasks, Roles, and Overview), which is 3
    expect(selectedIndexSetSpy).toHaveBeenCalledWith(3);
    expect(caseViewerComponent.tabGroup.selectedIndex).toBe(3);
  }));

  it('should set tabGroup selected index to pre-selected tab if a non-roles/tasks/hearings tab is not found', fakeAsync(() => {
    caseViewerComponent.appendedTabs = [
      {
        id: 'hearings',
        label: 'Hearings',
        fields: [],
        show_condition: null
      }
    ];
    spyOn(caseViewerComponent, 'organiseTabPosition').and.callThrough();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const selectedIndexSetSpy = spyOnProperty(caseViewerComponent.tabGroup, 'selectedIndex', 'set').and.callThrough();
    // Using /caseNotes at the end of the URL ensures there won't be a matching tab found, so the selected tab should
    // default to the first *in the CaseView object*, which is the "Overview" tab
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/caseNotes');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    tick();
    componentFixture.detectChanges();
    expect(caseViewerComponent.organiseTabPosition).toHaveBeenCalled();
    // Selected index is actually the *absolute* position of the "Overview" tab (after Tasks and Roles), which is 2
    expect(selectedIndexSetSpy).toHaveBeenCalledWith(2);
    expect(caseViewerComponent.tabGroup.selectedIndex).toBe(2);
  }));

  it('should set tabGroup selected index if a roles/tasks/hearings tab is found', fakeAsync(() => {
    spyOn(caseViewerComponent, 'organiseTabPosition').and.callThrough();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const selectedIndexSetSpy = spyOnProperty(caseViewerComponent.tabGroup, 'selectedIndex', 'set').and.callThrough();
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/roles-and-access');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    tick();
    componentFixture.detectChanges();
    expect(caseViewerComponent.organiseTabPosition).toHaveBeenCalled();
    // Selected index is actually the *absolute* position of the "Roles and access" tab (after Tasks), which is 1
    expect(selectedIndexSetSpy).toHaveBeenCalledWith(1);
    expect(caseViewerComponent.tabGroup.selectedIndex).toBe(1);
  }));

  it('should not set tabGroup selected index if a non-roles/tasks/hearings tab is found and it is already selected', fakeAsync(() => {
    caseViewerComponent.prependedTabs = [
      {
        id: 'dummy',
        label: 'Dummy',
        fields: [],
        show_condition: null
      }
    ];
    spyOn(caseViewerComponent, 'organiseTabPosition').and.callThrough();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const selectedIndexSetSpy = spyOnProperty(caseViewerComponent.tabGroup, 'selectedIndex', 'set').and.callThrough();
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/dummy');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    tick();
    componentFixture.detectChanges();
    expect(caseViewerComponent.organiseTabPosition).toHaveBeenCalled();
    // Selected index should not be set because the "Dummy" tab has position 0 (already selected)
    expect(selectedIndexSetSpy).not.toHaveBeenCalled();
  }));

  it('should not set tabGroup selected index to pre-selected tab if it is already selected', fakeAsync(() => {
    caseViewerComponent.prependedTabs = [];
    spyOn(caseViewerComponent, 'organiseTabPosition').and.callThrough();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const selectedIndexSetSpy = spyOnProperty(caseViewerComponent.tabGroup, 'selectedIndex', 'set').and.callThrough();
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/dummy');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    tick();
    componentFixture.detectChanges();
    expect(caseViewerComponent.organiseTabPosition).toHaveBeenCalled();
    // Selected index should not be set because the pre-selected tab is "Overview", which has position 0 (already selected)
    expect(selectedIndexSetSpy).not.toHaveBeenCalled();
  }));

  it('should not set tabGroup selected index if a roles/tasks/hearings tab is found and it is already selected', fakeAsync(() => {
    caseViewerComponent.prependedTabs = [
      {
        id: 'tasks',
        label: 'Tasks',
        fields: [],
        show_condition: null
      }
    ];
    spyOn(caseViewerComponent, 'organiseTabPosition').and.callThrough();
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const selectedIndexSetSpy = spyOnProperty(caseViewerComponent.tabGroup, 'selectedIndex', 'set').and.callThrough();
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330/tasks');
    caseViewerComponent.ngOnChanges({ prependedTabs: new SimpleChange(null, prependedTabsList, false) });
    tick();
    componentFixture.detectChanges();
    expect(caseViewerComponent.organiseTabPosition).toHaveBeenCalled();
    // Selected index should not be set because the "Tasks" tab has position 0 (already selected)
    expect(selectedIndexSetSpy).not.toHaveBeenCalled();
  }));
});

describe('CaseFullAccessViewComponent - get default hrefMarkdownLinkContent', () => {
  let mockLocation: any;

  let caseViewerComponent: CaseFullAccessViewComponent;
  let componentFixture: ComponentFixture<CaseFullAccessViewComponent>;
  let debugElement: DebugElement;
  let convertHrefToRouterService;
  let subscribeSpy: jasmine.Spy;
  let subscriptionMock: Subscription = new Subscription();

  beforeEach(waitForAsync(() => {
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('Default'));
    mockLocation = createSpyObj('location', ['path']);
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330#caseNotes');
    subscribeSpy = spyOn(subscriptionMock, 'unsubscribe');

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(of({}));
    alertService.success.and.returnValue(of({}));
    alertService.warning.and.returnValue(of({}));

    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          MatTabsModule,
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
          ]),
          StoreModule.forRoot({}),
          EffectsModule.forRoot([])
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        declarations: [
          TasksContainerComponent,
          CaseFullAccessViewComponent,
          DeleteOrCancelDialogComponent,
          EventTriggerComponent,
          CallbackErrorsComponent,
          // Mocks
          caseActivityComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          MockRpxTranslatePipe
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
          { provide: AbstractAppConfig, useClass: AppMockConfig },
          NavigationNotifierService,
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          ActivityPollingService,
          ActivityService,
          HttpService,
          HttpErrorService,
          AuthService,
          SessionStorageService,
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate']) },
          DeleteOrCancelDialogComponent,
          LoadingService,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
        ],
        teardown: { destroyAfterEach: false }
      })
      .compileComponents();
  }));

  beforeEach(() => {
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
  });

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
    const callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.triggerText = CaseFullAccessViewComponent.TRIGGER_TEXT_START;
    caseViewerComponent.callbackErrorsNotify(callbackErrorsContext);
    componentFixture.detectChanges();
    const eventTriggerElement = debugElement.query(By.directive(EventTriggerComponent));
    const eventTrigger = eventTriggerElement.componentInstance;

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_START);

    callbackErrorsContext.triggerText = CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE;
    caseViewerComponent.callbackErrorsNotify(callbackErrorsContext);
    componentFixture.detectChanges();

    expect(eventTrigger.triggerText).toEqual(CaseFullAccessViewComponent.TRIGGER_TEXT_CONTINUE);
  });

  it('should return true for tab available', () => {
    expect(caseViewerComponent.hasTabsPresent()).toEqual(true);
  });

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

describe('CaseFullAccessViewComponent - findPreSelectedActiveTab', () => {
  let component: CaseFullAccessViewComponent;
  let fixture: ComponentFixture<CaseFullAccessViewComponent>;
  let mockLocation: any;
  let convertHrefToRouterService;

  beforeEach(async () => {
    mockLocation = createSpyObj('location', ['path']);
    mockLocation.path.and.returnValue('/cases/case-details/1620409659381330');
    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('Default'));

    await TestBed.configureTestingModule({
      imports: [
        PaletteUtilsModule,
        MatTabsModule,
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
        ]),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        TasksContainerComponent,
        CaseFullAccessViewComponent,
        DeleteOrCancelDialogComponent,
        EventTriggerComponent,
        CallbackErrorsComponent,
        // Mocks
        caseActivityComponentMock,
        caseHeaderComponentMock,
        linkComponentMock,
        MockRpxTranslatePipe
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
        { provide: AbstractAppConfig, useClass: AppMockConfig },
        NavigationNotifierService,
        { provide: CaseNotifier, useValue: caseNotifier },
        { provide: ActivatedRoute, useValue: mockRoute },
        ActivityPollingService,
        ActivityService,
        HttpService,
        HttpErrorService,
        AuthService,
        SessionStorageService,
        { provide: DraftService, useValue: draftService },
        { provide: AlertService, useValue: alertService },
        { provide: MatDialog, useValue: dialog },
        { provide: MatDialogRef, useValue: matDialogRef },
        { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
        { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterService },
        { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate']) },
        DeleteOrCancelDialogComponent,
        LoadingService,
        { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
        { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();

    fixture = TestBed.createComponent(CaseFullAccessViewComponent);
    component = fixture.componentInstance;
  });

  it('should return the first unsorted tab if it exists', () => {
    component.caseDetails = clone(CASE_VIEW);
    component.sortedTabs = [
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
        id: 'SomeTab',
        label: 'Some Tab',
        order: 3,
        fields: [],
        show_condition: ''
      },
      {
        id: 'CaseFlagsTab',
        label: 'Case flags',
        fields: [
          Object.assign(new CaseField(), {
            id: 'FlagLauncher1',
            label: 'Flag launcher',
            display_context: 'OPTIONAL',
            field_type: {
              id: 'FlagLauncher',
              type: 'FlagLauncher'
            },
            order: 4,
            value: null,
            show_condition: '',
            hint_text: ''
          }),
          Object.assign(new CaseField(), {
            id: 'CaseFlag1',
            label: 'First Case Flag',
            display_context: null,
            field_type: {
              id: 'Flags',
              type: 'Complex',
              complex_fields: []
            },
            value: {
              partyName: 'John Smith',
              roleOnCase: '',
              details: [
                {
                  id: '9c2129ba-3fc6-4bae-afc3-32808ffd9cbe',
                  value: {
                    name: 'Wheel chair access',
                    subTypeValue: '',
                    subTypeKey: '',
                    otherDescription: '',
                    flagComment: '',
                    dateTimeModified: new Date('2021-09-09 00:00:00'),
                    dateTimeCreated: new Date('2021-09-09 00:00:00'),
                    path: [],
                    hearingRelevant: false,
                    flagCode: '',
                    status: CaseFlagStatus.ACTIVE
                  }
                },
                {
                  id: '9125aac8-1506-4753-b820-b3a3be451235',
                  value: {
                    name: 'Sign language',
                    subTypeValue: 'British Sign Language (BSL)',
                    subTypeKey: '',
                    otherDescription: '',
                    flagComment: '',
                    dateTimeModified: new Date('2021-09-09 00:00:00'),
                    dateTimeCreated: new Date('2021-09-09 00:00:00'),
                    path: [],
                    hearingRelevant: false,
                    flagCode: '',
                    status: CaseFlagStatus.INACTIVE
                  }
                }
              ]
            }
          })
        ],
        show_condition: null
      }
    ] as CaseTab[];

    const selectedTab = component.findPreSelectedActiveTab();
    expect(selectedTab.id).toEqual('CaseFlagsTab');
  });

  it('should return the first sorted tab if no unsorted tabs exist', () => {
    component.caseDetails = clone(CASE_VIEW);
    component.sortedTabs = [
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
        id: 'SomeTab',
        label: 'Some Tab',
        order: 3,
        fields: [],
        show_condition: ''
      }
    ] as CaseTab[];

    const selectedTab = component.findPreSelectedActiveTab();
    expect(selectedTab.id).toEqual('HistoryTab');
  });

  it('should prioritize unsorted tabs over sorted ones', () => {
    component.caseDetails = clone(CASE_VIEW);
    component.caseDetails.tabs[1].order = null;
    component.sortedTabs = [
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
        id: 'SomeTab',
        label: 'Some Tab',
        order: 3,
        fields: [],
        show_condition: ''
      },
      {
        id: 'HistoryTab',
        label: 'History',
        order: null,
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
        id: 'CaseFlagsTab',
        label: 'Case flags',
        order: null,
        fields: [
          Object.assign(new CaseField(), {
            id: 'FlagLauncher1',
            label: 'Flag launcher',
            display_context: 'OPTIONAL',
            field_type: {
              id: 'FlagLauncher',
              type: 'FlagLauncher'
            },
            order: 4,
            value: null,
            show_condition: '',
            hint_text: ''
          }),
          Object.assign(new CaseField(), {
            id: 'CaseFlag1',
            label: 'First Case Flag',
            display_context: null,
            field_type: {
              id: 'Flags',
              type: 'Complex',
              complex_fields: []
            },
            value: {
              partyName: 'John Smith',
              roleOnCase: '',
              details: [
                {
                  id: '9c2129ba-3fc6-4bae-afc3-32808ffd9cbe',
                  value: {
                    name: 'Wheel chair access',
                    subTypeValue: '',
                    subTypeKey: '',
                    otherDescription: '',
                    flagComment: '',
                    dateTimeModified: new Date('2021-09-09 00:00:00'),
                    dateTimeCreated: new Date('2021-09-09 00:00:00'),
                    path: [],
                    hearingRelevant: false,
                    flagCode: '',
                    status: CaseFlagStatus.ACTIVE
                  }
                },
                {
                  id: '9125aac8-1506-4753-b820-b3a3be451235',
                  value: {
                    name: 'Sign language',
                    subTypeValue: 'British Sign Language (BSL)',
                    subTypeKey: '',
                    otherDescription: '',
                    flagComment: '',
                    dateTimeModified: new Date('2021-09-09 00:00:00'),
                    dateTimeCreated: new Date('2021-09-09 00:00:00'),
                    path: [],
                    hearingRelevant: false,
                    flagCode: '',
                    status: CaseFlagStatus.INACTIVE
                  }
                }
              ]
            },
          })
        ],
        show_condition: null
      }
    ] as CaseTab[];

    const selectedTab = component.findPreSelectedActiveTab();
    expect(selectedTab.id).toEqual('HistoryTab');
  });
});
xdescribe('CaseFullAccessViewComponent - print and event selector disabled', () => {
  beforeEach((() => {
    orderService = new OrderService();
    spyOn(orderService, 'sort').and.callThrough();
    let convertHrefToRouterMockService: jasmine.SpyObj<ConvertHrefToRouterService>;
  let sessionStorageMockService: jasmine.SpyObj<SessionStorageService>;

    draftService = createSpyObj('draftService', ['deleteDraft']);
    draftService.deleteDraft.and.returnValue(of({}));

    caseNotifier = createSpyObj('caseNotifier', ['announceCase']);

    alertService = createSpyObj('alertService', ['setPreserveAlerts', 'success', 'warning', 'clear']);
    alertService.setPreserveAlerts.and.returnValue(of({}));
    alertService.success.and.returnValue(of({}));
    alertService.warning.and.returnValue(of({}));

    navigationNotifierService = new NavigationNotifierService();
    spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
    errorNotifierService = new ErrorNotifierService();
    spyOn(errorNotifierService, 'announceError').and.callThrough();

    dialog = createSpyObj<MatDialog>('dialog', ['open']);
    matDialogRef = createSpyObj<MatDialogRef<DeleteOrCancelDialogComponent>>('matDialogRef', ['afterClosed', 'close']);

    activityService = createSpyObj<ActivityPollingService>('activityPollingService', ['postViewActivity', 'isEnabled']);
    activityService.postViewActivity.and.returnValue(of());

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
          EventTriggerComponent,
          CallbackErrorsComponent,
          TabsComponent,
          TabComponent,
          // Mocks
          caseActivityComponentMock,
          fieldReadComponentMock,
          caseHeaderComponentMock,
          linkComponentMock,
          markdownComponentMock,
          MockRpxTranslatePipe
        ],
        providers: [
          FieldsUtils,
          PlaceholderService,
          CaseReferencePipe,
          { provide: NavigationNotifierService, useValue: navigationNotifierService },
          { provide: ErrorNotifierService, useValue: errorNotifierService },
          { provide: CaseNotifier, useValue: caseNotifier },
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: OrderService, useValue: orderService },
          { provide: ActivityPollingService, useValue: activityService },
          { provide: DraftService, useValue: draftService },
          { provide: AlertService, useValue: alertService },
          { provide: MatDialog, useValue: dialog },
          { provide: MatDialogRef, useValue: matDialogRef },
          { provide: MatDialogConfig, useValue: DIALOG_CONFIG },
          { provide: ConvertHrefToRouterService, useValue: convertHrefToRouterMockService },
          { provide: SessionStorageService, useValue: sessionStorageMockService },
          { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService', ['translate']) },
          DeleteOrCancelDialogComponent,
          LoadingService,
          { provide: LinkedCasesService, useValue: jasmine.createSpyObj('LinkedCasesService', ['resetLinkedCaseData']) },
          { provide: CaseFlagStateService, useValue: jasmine.createSpyObj('CaseFlagStateService', ['resetInitialCaseFlags']) }
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
    const eventTriggerElement = de.query(By.directive(EventTriggerComponent));
    const printLink = de.query($PRINT_LINK);

    expect(eventTriggerElement).toBeFalsy();
    expect(printLink).toBeFalsy();
  });
})
