import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { CaseView, TaskSearchParameter } from '../../../../../../shared/domain';
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

fdescribe('QueryCheckYourAnswersComponent', () => {
  let component: QueryCheckYourAnswersComponent;
  let fixture: ComponentFixture<QueryCheckYourAnswersComponent>;
  let router: Router;
  let nativeElement: any;
  let casesService: any;
  let caseNotifier: any;
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
      parentId: '444-444',
    }
  ];

  const childrenItems = items.map(item => {
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
        name: 'Test',
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [],
    triggers: [],
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
  }

  const userDetails = {
    email: 'smith_solicitor@test.com',
    uid: '1111-2222-3333-4444',
    name: 'Smith Solicitor'
  };

  beforeEach(async () => {
    workAllocationService = jasmine.createSpyObj('WorkAllocationService', ['searchTasks']);
    workAllocationService.searchTasks.and.returnValue(of(response));
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify(userDetails));
    casesService = jasmine.createSpyObj('casesService', ['getEventTrigger', 'createEvent']);
    casesService.getEventTrigger.and.returnValue(of(eventTrigger));
    casesService.createEvent.and.returnValue(of({status: 200}));
    caseNotifier = new CaseNotifier(casesService);
    caseNotifier.caseView = new BehaviorSubject(CASE_VIEW).asObservable();

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QueryCheckYourAnswersComponent,
        RpxTranslateMockPipe
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: snapshotActivatedRoute },
        { provide: CaseNotifier, useValue: caseNotifier },
        { provide: CasesService, useValue: casesService },
        { provide: WorkAllocationService, useValue: workAllocationService },
        { provide: SessionStorageService, useValue: sessionStorageService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCheckYourAnswersComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    component.queryItem = queryListItem;
    component.formGroup = new FormGroup({
      subject: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      isHearingRelated: new FormControl('', Validators.required),
      hearingDate: new FormControl(''),
      attachments: new FormControl([])
    });
    component.formGroup.get('isHearingRelated').setValue(true);
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
    const caption = nativeElement.querySelector('.govuk-caption-l');
    expect(caption).toBeNull();
    const heading = nativeElement.querySelector('.govuk-heading-l');
    expect(heading.textContent.trim()).toEqual('Review query details');
    const columnHeadings = fixture.debugElement.queryAll(By.css('.govuk-summary-list__key'));
    expect(columnHeadings[0].nativeElement.textContent.trim()).toEqual('Query detail');
    expect(columnHeadings[1].nativeElement.textContent.trim()).toEqual('Document attached');
  });

  it('should query submission failure navigate to service down page', () => {
    spyOn(router, 'navigate');
    component.submit();
    expect(router.navigate).toHaveBeenCalledWith(['/', 'service-down']);
  });

  describe('searchAndCompleteTask', () => {
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
        eventId: 'respondToQuery',
        task: response.tasks[0]
      };
      expect(component.eventCompletionParams).toEqual(eventCompletionParams);
    });
  });
});
