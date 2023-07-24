import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../../public-api';
import { SessionStorageService } from '../../../../../services';
import { CaseNotifier } from '../../../../case-editor/services';
import { QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagmentService } from '../../services/query-managment.service';
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
  let appConfig: any;
  let nativeElement: any;
  let sessionStorageService: any;

  const response = {
    tasks: [{
      additional_properties: {
          additionalProp1: '1234'
      },
      assignee: '1234-1234-1234-1234',
      auto_assigned: false,
      case_category: 'asylum',
      case_id: '2345678901',
      case_management_category: null,
      case_name: 'Alan Jonson',
      case_type_id: null,
      created_date: '2021-04-19T14:00:00.000+0000',
      due_date: '2021-05-20T16:00:00.000+0000',
      execution_type: null,
      id: 'Task_2',
      jurisdiction: 'Immigration and Asylum',
      location: null,
      location_name: null,
      name: 'Task name',
      permissions: null,
      region: null,
      security_classification: null,
      task_state: null,
      task_system: null,
      task_title: 'Some lovely task name',
      type: null,
      warning_list: null,
      warnings: true,
      work_type_id: null
    }]
  };

  const userDetails = {
    id: 1,
    forename: 'Firstname',
    surname: 'Surname',
    roles: ['caseworker-role1', 'caseworker-role3'],
    email: 'test@mail.com',
    token: null
  };

  appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl', 'getUserInfoApiUrl', 'getWAServiceConfig']);
  appConfig.getWorkAllocationApiUrl.and.returnValue('');
  sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
  sessionStorageService.getItem.and.returnValue(userDetails);
  const casesService = jasmine.createSpyObj('casesService', ['caseView', 'cachedCaseView']);
  const mockCaseNotifier = new CaseNotifier(casesService);
  const queryManagmentService = jasmine.createSpyObj('QueryManagmentService', ['searchTasks' , 'completeTask']);
  queryManagmentService.searchTasks.and.returnValue(of(response));

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QueryCheckYourAnswersComponent,
        RpxTranslateMockPipe
      ],
      providers: [
        { provide: QueryManagmentService, useValue: queryManagmentService },
        { provide: CaseNotifier, useValue: mockCaseNotifier },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: ActivatedRoute, useValue: {
          snapshot: {
            params: {
              cid: '123'
            }
          }
        }
      }]
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

  describe('submit', () => {
    it('should call searchAndCompleteTask', ()=> {
      spyOn(component, 'searchAndCompleteTask').and.callFake(()=>{});
      component.submit();
      fixture.detectChanges();
      expect(component.searchAndCompleteTask).toHaveBeenCalled();
    });

    it('searchAndCompleteTask - should search task to be called',  () => {
      component.searchAndCompleteTask();
      fixture.detectChanges();
      expect(queryManagmentService.searchTasks).toHaveBeenCalled();
    });
  })
});
