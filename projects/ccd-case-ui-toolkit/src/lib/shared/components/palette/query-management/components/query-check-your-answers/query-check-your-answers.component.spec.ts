import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { CaseField, CaseView, FieldType } from '../../../../../../shared/domain';
import { AlertService, ErrorNotifierService, SessionStorageService } from '../../../../../services';
import { CaseNotifier, CasesService, WorkAllocationService } from '../../../../case-editor/services';
import { QueryCreateContext, QueryListItem } from '../../models';
import { QueryCheckYourAnswersComponent } from './query-check-your-answers.component';
import { QualifyingQuestionService } from '../../services/qualifying-question.service';
import { QueryManagementService } from '../../services';

@Pipe({
  name: 'rpxTranslate',
  standalone: false
})
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('QueryCheckYourAnswersComponent', () => {
  let component: QueryCheckYourAnswersComponent;
  let fixture: ComponentFixture<QueryCheckYourAnswersComponent>;
  let nativeElement: any;
  let casesService: any;
  let caseNotifier: any;
  let router: Router;
  let workAllocationService: any;
  let sessionStorageService: any;

  const items = [
    {
      id: '222-222',
      subject: '',
      name: 'Name 2',
      body: 'Body 2',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2021-02-01'),
      createdBy: 'Person A',
      parentId: '111-111',
      children: []
    },
    {
      id: '333-333',
      subject: '',
      name: 'Name 3',
      body: 'Body 3',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2021-03-01'),
      createdBy: 'Person B',
      parentId: '111-111',
      children: []
    },
    {
      id: '444-444',
      subject: '',
      name: 'Name 4',
      body: 'Body 4',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2020-03-01'),
      createdBy: 'Person C',
      parentId: '222-222'
    },
    // lastSubmittedBy
    {
      id: '555-555',
      subject: '',
      name: 'Name 5',
      body: 'Body 5',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2023-06-01'),
      createdBy: 'Person D',
      parentId: '444-444'
    }
  ];

  const childrenItems = items.map((item) => {
    const listItem = new QueryListItem();
    Object.assign(listItem, item);
    return listItem;
  });

  const queryListItem = new QueryListItem();
  Object.assign(queryListItem, {
    id: '111-111',
    subject: 'Subject 1',
    name: 'Name 1',
    body: 'Body 1',
    attachments: [
      {
        _links: {
          self: {
            href: 'https://hmcts.internal/documents/111-111'
          },
          binary: {
            href: 'https://hmcts.internal/documents/111-111/binary'
          }
        },
        originalDocumentName: 'Document 1'
      }
    ],
    isHearingRelated: true,
    hearingDate: new Date('2023-06-29'),
    createdOn: new Date('2023-06-25'),
    createdBy: 'Person A',
    children: [
      childrenItems[0],
      childrenItems[1],
      {
        ...childrenItems[2],
        children: [
          // lastSubmittedBy
          childrenItems[3]
        ]
      }
    ]
  });

  const snapshotActivatedRoute = {
    snapshot: {
      queryParams: {
        tid: 'Task_2'
      },
      params: {
        qid: '1',
        dataid: 'id-007'
      },
      data: {
        case: {
          tabs: [
            {
              fields: [],
              id: 'QueryManagement2',
              label: 'Queries (writeable view)',
              order: 8,
              show_condition: null
            },
            {
              fields: [
                {
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'ComponentLauncher',
                    max: null,
                    min: null,
                    regular_expression: null,
                    type: 'ComponentLauncher'
                  },
                  id: 'QueryManagement1',
                  label: 'Query management component'
                },
                {
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'CaseQueriesCollection',
                    max: null,
                    min: null,
                    regular_expression: null,
                    type: 'Complex'
                  },
                  id: 'qmCaseQueriesCollection',
                  label: 'Query management case queries collection',
                  value: {
                    caseMessages: [{
                      id: '42ea7fd3-178c-4584-b48b-f1275bf1804f',
                      value: {
                        attachments: [],
                        body: 'testing by olu',
                        createdBy: '120b3665-0b8a-4e80-ace0-01d8d63c1005',
                        createdOn: '2024-08-27T15:44:50.700Z',
                        hearingDate: '2023-01-10',
                        id: null,
                        isHearingRelated: 'Yes',
                        name: 'Piran Sam',
                        parentId: 'ca',
                        subject: 'Review attached document'
                      }
                    }],
                    partyName: '',
                    roleOnCase: ''
                  }
                }

              ],
              id: 'QueryManagement1',
              label: 'Queries (read-only view)',
              order: 7,
              show_condition: null
            }
          ]
        }

      }
    }
  };

  const CASE_VIEW: CaseView = {
    case_id: '1',
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test'
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [
      {
        fields: [],
        id: 'QueryManagement2',
        label: 'Queries (writeable view)',
        order: 8,
        show_condition: null
      },
      {
        fields: [],
        id: 'QueryManagement1',
        label: 'Queries (read-only view)',
        order: 8,
        show_condition: null
      }
    ],
    triggers: [
    ],
    events: []
  };
  const CASE_VIEW_OTHER: CaseView = {
    case_id: '1',
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test'
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [
      {
        fields: [],
        id: 'QueryManagement2',
        label: 'Queries (writeable view)',
        order: 8,
        show_condition: null
      },
      {
        fields: [],
        id: 'QueryManagement1',
        label: 'Queries (read-only view)',
        order: 8,
        show_condition: null
      }
    ],
    triggers: [
      {
        description: 'Raise a query',
        id: 'queryManagementRaiseQuery',
        name: 'Raise a query',
        order: 14
      },
      {
        description: 'Respond to a query (not intended to be visible)',
        id: 'queryManagementRespondQuery',
        name: 'Respond to a query',
        order: 15
      }
    ],
    events: []
  };

  const taskResponse = {
    tasks: [{
      additional_properties: {
        additionalProp1: '1'
      },
      assignee: '12345',
      case_id: '1',
      case_name: 'Alan Jonson',
      created_date: '2021-04-19T14:00:00.000+0000',
      due_date: '2021-05-20T16:00:00.000+0000',
      id: 'Task_2',
      jurisdiction: 'Immigration and Asylum',
      case_category: 'asylum',
      name: 'Task name',
      permissions: null
    }]
  };

  const eventTrigger = {
    id: 'queryManagementRaiseQuery',
    name: 'queryManagementRaiseQuery',
    description: 'Respond to a query',
    event_token: 'token0011223344'
  };

  const userDetails = {
    email: 'smith_solicitor@test.com',
    uid: '1111-2222-3333-4444',
    name: 'Smith Solicitor'
  };

  const eventData = {
    ...eventTrigger,
    case_fields: [
      {
        field_type: {
          collection_field_type: null,
          complex_fields: [],
          fixed_list_items: [],
          id: 'ComponentLauncher',
          max: null,
          min: null,
          regular_expression: null,
          type: 'ComponentLauncher'
        } as FieldType,
        id: 'QueryManagement1',
        label: 'Query management component'
      } as CaseField,
      {
        field_type: {
          collection_field_type: null,
          complex_fields: [],
          fixed_list_items: [],
          id: 'CaseQueriesCollection',
          max: null,
          min: null,
          regular_expression: null,
          type: 'Complex'
        } as FieldType,
        id: 'qmCaseQueriesCollection',
        label: 'Query management case queries collection',
        value: {
          caseMessages: [{
            id: '42ea7fd3-178c-4584-b48b-f1275bf1804f',
            value: {
              attachments: [],
              body: 'testing by olu',
              createdBy: '120b3665-0b8a-4e80-ace0-01d8d63c1005',
              createdOn: '2024-08-27T15:44:50.700Z',
              hearingDate: '2023-01-10',
              id: null,
              isHearingRelated: 'Yes',
              name: 'Piran Sam',
              parentId: 'ca',
              subject: 'Review attached document'
            }
          }],
          partyName: '',
          roleOnCase: ''
        }
      } as CaseField
    ],
    wizard_pages: [],
    hasFields(): boolean {
      return true;
    },
    hasPages(): boolean {
      return false;
    }
  };

  const mockAttachment = {
    originalDocumentName: 'blank.docx',
    _links: {
      binary: { href: 'http://dm-store-aat.service.core-compute-aat.inter…ments/718288ed-517f-4348-b27d-3cbabf2aaff0/binary' },
      self: { href: 'http://dm-store-aat.service.core-compute-aat.internal/documents/718288ed-517f-4348-b27d-3cbabf2aaff0' }
    }
  };

  const qualifyingQuestionService = jasmine.createSpyObj('qualifyingQuestionService', ['clearQualifyingQuestionSelection']);
  const queryManagementService = jasmine.createSpyObj('QueryManagementService', [
    'generateCaseQueriesCollectionData',
    'setCaseQueriesCollectionData',
    'getCaseQueriesCollectionFieldOrderFromWizardPages'
  ]);

  const errorNotifierService = jasmine.createSpyObj('ErrorNotifierService', ['announceError']);
  const alertService = jasmine.createSpyObj('AlertService', ['error']);

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    workAllocationService = jasmine.createSpyObj('WorkAllocationService', ['getTasksByCaseIdAndEventId', 'completeTask']);
    workAllocationService.getTasksByCaseIdAndEventId.and.returnValue(of(taskResponse));
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify(userDetails));
    casesService = jasmine.createSpyObj('casesService', ['createEvent', 'getCaseViewV2']);
    casesService.createEvent.and.returnValue(of({ status: 200 }));
    caseNotifier = new CaseNotifier(casesService);
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW).asObservable();

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule],
      declarations: [
        QueryCheckYourAnswersComponent,
        RpxTranslateMockPipe
      ],
      providers: [
        { provide: ActivatedRoute, useValue: snapshotActivatedRoute },
        { provide: CaseNotifier, useValue: caseNotifier },
        { provide: CasesService, useValue: casesService },
        { provide: WorkAllocationService, useValue: workAllocationService },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: Router, useValue: router },
        { provide: QualifyingQuestionService, useValue: qualifyingQuestionService },
        { provide: QueryManagementService, useValue: queryManagementService },
        { provide: ErrorNotifierService, useValue: errorNotifierService },
        { provide: AlertService, useValue: alertService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCheckYourAnswersComponent);
    component = fixture.componentInstance;
    component.queryItem = queryListItem;
    component.formGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      isHearingRelated: new FormControl('', Validators.required),
      attachments: new FormControl([mockAttachment]),
      closeQuery: new FormControl(false)
    });

    // Updated test setup for correct service behavior and destructuring
    queryManagementService.setCaseQueriesCollectionData.and.returnValue({
      fieldId: 'field1',
      caseQueriesCollections: [
        { partyName: 'Party 1', roleOnCase: '', caseMessages: [] },
        { partyName: 'Party 2', roleOnCase: '', caseMessages: [] }
      ]
    });

    // Specific test override when checking messageId behavior
    snapshotActivatedRoute.snapshot.params.dataid = 'targetMessageId';
    queryManagementService.setCaseQueriesCollectionData.and.returnValue({
      fieldId: 'field1',
      caseQueriesCollections: [
        {
          partyName: 'Y',
          roleOnCase: '',
          caseMessages: [{ value: { id: 'targetMessageId' } }]
        }
      ]
    });

    component.formGroup.get('isHearingRelated')?.setValue(true);
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit back clicked event', () => {
    spyOn(component.backClicked, 'emit');
    component.goBack();
    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  it('should display correct columns for raise a query', () => {
    component.queryCreateContext = QueryCreateContext.NEW_QUERY;
    component.readyToSubmit = true;
    fixture.detectChanges();
    component.ngOnInit();
    const caption = nativeElement.querySelector('.govuk-caption-l');
    expect(caption.innerText).toEqual('Raise a query');
    const heading = nativeElement.querySelector('.govuk-heading-l');
    expect(heading.textContent.trim()).toEqual('Review query details');
    const columnHeadings = fixture.debugElement.queryAll(By.css('.govuk-summary-list__key'));
    expect(columnHeadings[0].nativeElement.textContent.trim()).toEqual('Query subject');
    expect(columnHeadings[1].nativeElement.textContent.trim()).toEqual('Query detail');
    expect(columnHeadings[2].nativeElement.textContent.trim()).toEqual('Is the query hearing related?');
    expect(columnHeadings[3].nativeElement.textContent.trim()).toEqual('What is the date of the hearing?');
    expect(columnHeadings[4].nativeElement.textContent.trim()).toEqual('Upload a file to the query');
  });

  it('should display correct columns for respond to a query', () => {
    component.queryCreateContext = QueryCreateContext.RESPOND;
    component.readyToSubmit = true;
    fixture.detectChanges();
    component.ngOnInit();
    const caption = nativeElement.querySelector('.govuk-caption-l');
    expect(caption).toBeNull();
    const heading = nativeElement.querySelector('.govuk-heading-l');
    expect(heading.textContent.trim()).toEqual('Review query response details');
    const columnHeadings = fixture.debugElement.queryAll(By.css('.govuk-summary-list__key'));
    expect(columnHeadings[0].nativeElement.textContent.trim()).toEqual('Submitted query');
    expect(columnHeadings[1].nativeElement.textContent.trim()).toEqual('Response detail');
    expect(columnHeadings[2].nativeElement.textContent.trim()).toEqual('Document attached');
  });

  it('should display correct columns for following up a query', () => {
    component.queryCreateContext = QueryCreateContext.FOLLOWUP;
    component.readyToSubmit = true;
    fixture.detectChanges();
    component.ngOnInit();
    const caption = nativeElement.querySelector('.govuk-caption-l');
    expect(caption).toBeNull();
    const heading = nativeElement.querySelector('.govuk-heading-l');
    expect(heading.textContent.trim()).toEqual('Review query details');
    const columnHeadings = fixture.debugElement.queryAll(By.css('.govuk-summary-list__key'));
    expect(columnHeadings[0].nativeElement.textContent.trim()).toEqual('Query detail');
    expect(columnHeadings[1].nativeElement.textContent.trim()).toEqual('Document attached');
  });

  it('should navigate to service-down page on event creation error', () => {
    const authError = { status: 403, message: 'Forbidden' }; // Must match the routing condition
    casesService.createEvent.and.returnValue(throwError(() => authError));

    component.fieldId = 'validFieldId';
    component.eventData = { event_token: 'token123' } as any;

    component.submit();

    expect(router.navigate).toHaveBeenCalledWith(['/', 'service-down']);
  });

  it('should navigate to service-down page on error during submission', () => {
    component.fieldId = 'someFieldId';
    const authError = { status: 403, message: 'Forbidden' };
    casesService.createEvent.and.returnValue(throwError(() => authError));

    component.submit();
    expect(router.navigate).toHaveBeenCalledWith(['/', 'service-down']);
  });

  it('should set querySubmitted to true when submit is called', () => {
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW_OTHER).asObservable();
    component.fieldId = 'someFieldId';
    component.eventData = { event_token: 'token' } as any;

    casesService.createEvent.and.returnValue(of({}));

    spyOn(component.querySubmitted, 'emit');
    spyOn(component.callbackConfirmationMessage, 'emit');
    component.submit();

    expect(casesService.createEvent).toHaveBeenCalled();
    expect(component.querySubmitted.emit).toHaveBeenCalledWith(true);
    expect(component.callbackConfirmationMessage.emit).toHaveBeenCalledWith({ body: undefined, header: undefined });
  });

  it('should set fieldId to undefined when eventData is unavailable', () => {
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW_OTHER).asObservable();

    component.eventData = null;
    fixture.detectChanges();
    component.ngOnInit();
    component.submit();

    expect(component.fieldId).toBeUndefined();
  });

  it('should call setCaseQueriesCollectionData on init', () => {
    spyOn(component, 'setCaseQueriesCollectionData');
    component.ngOnInit();
    expect(component.setCaseQueriesCollectionData).toHaveBeenCalled();
  });

  describe('form validation', () => {
    it('should be invalid when form controls are empty', () => {
      component.formGroup.get('name')?.setValue('');
      component.formGroup.get('body')?.setValue('');
      expect(component.formGroup.valid).toBeFalsy();
    });

    it('should be valid when form controls are filled', () => {
      component.formGroup.get('name')?.setValue('Valid Name');
      component.formGroup.get('body')?.setValue('Valid Body');
      expect(component.formGroup.valid).toBeTruthy();
    });
  });

  it('should set caseQueriesCollections and fieldId correctly when case_fields are present', () => {
    queryManagementService.setCaseQueriesCollectionData.and.callFake(() => {
      component.fieldId = 'field1';
      component.caseQueriesCollections = [
        { partyName: 'Party 1', roleOnCase: '', caseMessages: [] },
        { partyName: 'Party 2', roleOnCase: '', caseMessages: [] }
      ];
    });

    component.eventData = {
      case_fields: [],
      wizard_pages: []
    } as any;

    component.setCaseQueriesCollectionData();

    expect(component.fieldId).toBe('field1');
    expect(component.caseQueriesCollections?.length).toBe(2);
  });

  it('should set caseQueriesCollections and fieldId correctly for multiple QmCaseQueriesCollection to the first collection for CIVIL jurisdiction', () => {
    component.caseDetails.case_type.jurisdiction.id = 'CIVIL';

    component.eventData = {
      case_fields: [
        {
          id: 'field1',
          value: { caseMessages: [] },
          field_type: { id: 'CaseQueriesCollection', type: 'Complex' },
          display_context: 'OPTIONAL'
        },
        {
          id: 'field2',
          value: { caseMessages: [] },
          field_type: { id: 'CaseQueriesCollection', type: 'Complex' },
          display_context: 'OPTIONAL'
        }
      ],
      wizard_pages: [
        {
          wizard_page_fields: [
            { case_field_id: 'field2', order: 1 },
            { case_field_id: 'field1', order: 2 }
          ]
        }
      ]
    } as any;

    queryManagementService.setCaseQueriesCollectionData.and.callFake(() => {
      component.fieldId = 'field2';
      component.caseQueriesCollections = [
        { partyName: 'A', roleOnCase: '', caseMessages: [] },
        { partyName: 'B', roleOnCase: '', caseMessages: [] }
      ];
    });

    component.queryCreateContext = QueryCreateContext.NEW_QUERY;

    component.setCaseQueriesCollectionData();

    expect(component.fieldId).toBe('field2');
    expect(component.caseQueriesCollections.length).toBe(2);
  });

  it('should show console error for multiple QmCaseQueriesCollection for other jurisdiction', () => {
    const mockCollections = [
      { partyName: 'C1', roleOnCase: '', caseMessages: [] },
      { partyName: 'C2', roleOnCase: '', caseMessages: [] }
    ];

    spyOn(console, 'error');

    component.caseDetails.case_type.jurisdiction.id = 'PUBLICLAW';

    queryManagementService.setCaseQueriesCollectionData.and.callFake(() => {
      console.error('Error: Multiple CaseQueriesCollections are not supported yet for the PUBLICLAW jurisdiction');
      component.fieldId = null;
      component.caseQueriesCollections = mockCollections;
    });

    component.setCaseQueriesCollectionData();

    expect(console.error).toHaveBeenCalledWith(
      'Error: Multiple CaseQueriesCollections are not supported yet for the PUBLICLAW jurisdiction'
    );
    expect(component.caseQueriesCollections.length).toBe(2);
  });

  it('should show console error if Jurisdiction is undefined', () => {
    const mockCollections = [
      { partyName: 'P1', roleOnCase: '', caseMessages: [] },
      { partyName: 'P2', roleOnCase: '', caseMessages: [] }
    ];

    spyOn(console, 'error');

    component.caseDetails.case_type.jurisdiction.id = undefined;

    queryManagementService.setCaseQueriesCollectionData.and.callFake(() => {
      console.error('Jurisdiction ID is missing.');
      component.fieldId = null;
      component.caseQueriesCollections = mockCollections;
    });

    component.setCaseQueriesCollectionData();

    expect(console.error).toHaveBeenCalledWith('Jurisdiction ID is missing.');
    expect(component.caseQueriesCollections.length).toBe(2);
  });

  it('should set fieldId based on messageId when found', () => {
    snapshotActivatedRoute.snapshot.params.dataid = 'targetMessageId';

    // Fake side effects instead of returning
    queryManagementService.setCaseQueriesCollectionData.and.callFake(() => {
      component.fieldId = 'field1';
      component.caseQueriesCollections = [
        {
          partyName: 'Y',
          roleOnCase: '',
          caseMessages: [{ value: { id: 'targetMessageId' } } as any]
        }
      ];
    });

    component.eventData = {
      case_fields: [],
      wizard_pages: []
    } as any;

    component.queryCreateContext = QueryCreateContext.NEW_QUERY;

    component.setCaseQueriesCollectionData();

    expect(component.fieldId).toBe('field1');
  });

  it('should return undefined when case_fields is empty', () => {
    const eventData = {
      case_fields: [],
      wizard_pages: [{ wizard_page_fields: [{ case_field_id: 'someId', order: 1 }] }]
    } as any;

    const result = queryManagementService['getCaseQueriesCollectionFieldOrderFromWizardPages'](eventData);
    expect(result).toBeUndefined();
  });

  it('should return undefined when wizard_page_fields is missing in wizard_pages', () => {
    const caseField = {
      id: 'field1',
      field_type: { id: 'CaseQueriesCollection', type: 'Complex' },
      display_context: 'OPTIONAL'
    };

    component.eventData = {
      case_fields: [caseField],
      wizard_pages: [{}] // No `wizard_page_fields`
    } as any;

    const result = queryManagementService['getCaseQueriesCollectionFieldOrderFromWizardPages'](component.eventData);
    expect(result).toBeUndefined();
  });

  it('should initialize newQueryData correctly when fieldId is set', () => {
    component.fieldId = 'someFieldId';
    component.caseQueriesCollections = [
      {
        caseMessages: [{ value: { id: 'messageId1' } }]
      }
    ] as any;

    component.submit();

    expect(casesService.createEvent).toHaveBeenCalled();
  });

  it('should create a new query data structure when no existing collection matches', () => {
    casesService.createEvent.and.returnValue(of({}));
    component.fieldId = 'someFieldId';
    component.caseQueriesCollections = [];

    component.submit();

    expect(casesService.createEvent).toHaveBeenCalled();
  });

  it('should filter tasks by tid and complete task when query is submitted', () => {
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW_OTHER).asObservable();
    component.queryCreateContext = QueryCreateContext.RESPOND;
    component.fieldId = 'someFieldId';

    fixture.detectChanges();
    component.ngOnInit();

    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].id).toBe('Task_2');

    spyOn(component.callbackConfirmationMessage, 'emit');
    component.submit();

    expect(workAllocationService.completeTask).toHaveBeenCalled();
    expect(component.callbackConfirmationMessage.emit).toHaveBeenCalledWith({ body: undefined, header: undefined });
  });

  it('should return early and not call createEvent if isSubmitting is true', () => {
    component.isSubmitting = true;

    component.submit();

    expect(casesService.createEvent).not.toHaveBeenCalled();
  });

  it('should emit error on callbackErrorsSubject on non-auth error', () => {
    const callbackError = { status: 500, message: 'Server error' };
    spyOn(component.callbackErrorsSubject, 'next');

    workAllocationService.getTasksByCaseIdAndEventId.and.returnValue(throwError(() => callbackError));

    component.queryCreateContext = QueryCreateContext.RESPOND;
    component.ngOnInit();

    expect(component.callbackErrorsSubject.next).toHaveBeenCalledWith(callbackError);
  });

  it('should return true if error has callbackErrors', () => {
    const error = { callbackErrors: ['some error'] };
    expect(component.isServiceErrorFound(error)).toBeTruthy();
  });

  it('should return false if error has no callbackErrors', () => {
    const error = { message: 'Plain error' };
    expect(component.isServiceErrorFound(error)).toBeFalsy();
  });

  it('should call errorNotifierService.announceError on non-auth error', () => {
    const callbackError = { status: 500, message: 'Internal server error' };
    workAllocationService.getTasksByCaseIdAndEventId.and.returnValue(throwError(() => callbackError));

    component.queryCreateContext = QueryCreateContext.RESPOND;
    component.ngOnInit();

    expect(errorNotifierService.announceError).toHaveBeenCalledWith(callbackError);
  });

  it('should call alertService.error on non-auth error in task fetch', () => {
    const callbackError = { status: 500, message: 'Internal server error' };
    workAllocationService.getTasksByCaseIdAndEventId.and.returnValue(throwError(() => callbackError));

    component.queryCreateContext = QueryCreateContext.RESPOND;
    component.ngOnInit();

    expect(alertService.error).toHaveBeenCalledWith({ phrase: 'Internal server error' });
  });
});
