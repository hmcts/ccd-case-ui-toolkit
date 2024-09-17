import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { CaseField, CaseView, FieldType, TaskSearchParameter } from '../../../../../../shared/domain';
import { SessionStorageService } from '../../../../../services';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, CasesService, WorkAllocationService } from '../../../../case-editor/services';
import { QueryCreateContext, QueryListItem } from '../../models';
import { QueryCheckYourAnswersComponent } from './query-check-your-answers.component';

@Pipe({ name: 'rpxTranslate' })
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
      params: {
        qid: '1'
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

  const response = {
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

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    workAllocationService = jasmine.createSpyObj('WorkAllocationService', ['searchTasks']);
    workAllocationService.searchTasks.and.returnValue(of(response));
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
        { provide: Router, useValue: router }
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
      attachments: new FormControl([])
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

  it('should query submission failure navigate to service down page', () => {
    component.submit();
    expect(router.navigate).toHaveBeenCalledWith(['/', 'service-down']);
  });

  it('should set querySubmitted to true when submit is called', () => {
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW_OTHER).asObservable();

    component.eventData = eventData;
    fixture.detectChanges();
    component.ngOnInit();

    spyOn(component.querySubmitted, 'emit');
    component.submit();

    expect(component.querySubmitted.emit).toHaveBeenCalledWith(true);
  });

  it('should set querySubmitted to true when submit is called', () => {
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW_OTHER).asObservable();
    fixture.detectChanges();
    component.ngOnInit();

    component.fieldId = null;
    component.submit();

    expect(router.navigate).toHaveBeenCalledWith(['/', 'service-down']);
  });

  describe('searchAndCompleteTask', () => {
    it('should call search task', () => {
      component.queryCreateContext = QueryCreateContext.NEW_QUERY;
      component.searchAndCompleteTask();
    });
  });

  describe('submit', () => {
    it('should call search task', () => {
      component.searchAndCompleteTask();
      fixture.detectChanges();
      const searchParameter = { ccdId: '1' } as TaskSearchParameter;
      expect(workAllocationService.searchTasks).toHaveBeenCalledWith(searchParameter);
    });

    it('should trigger event completion', () => {
      component.searchAndCompleteTask();
      fixture.detectChanges();
      const eventCompletionParams: EventCompletionParams = {
        caseId: '1',
        eventId: 'queryManagementRespondQuery',
        task: response.tasks[0]
      };
      expect(component.eventCompletionParams).toEqual(eventCompletionParams);
    });
  });
});
