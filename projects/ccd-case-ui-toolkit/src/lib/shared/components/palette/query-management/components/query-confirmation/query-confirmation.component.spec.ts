import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseQueriesCollection, QueryCreateContext, QueryMessage } from '../../models';
import { QueryConfirmationComponent } from './query-confirmation.component';
import { SessionStorageService } from '../../../../../services';
@Pipe({
  name: 'rpxTranslate',
  standalone: false
})
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string, args?: any): string {
    return value;
  }
}

describe('QueryConfirmationComponent', () => {
  let component: QueryConfirmationComponent;
  let fixture: ComponentFixture<QueryConfirmationComponent>;
  let nativeElement: any;
  let dummyCaseQueriesCollection: CaseQueriesCollection;
  let caseMessages: QueryMessage[];

  const mockRoute = {
    snapshot: {
      params: {
        cid: '1234'
      }
    }
  };

  const mockSessionStorageService = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);

  beforeEach(async () => {
    caseMessages = [
      {
        id: 'ccd-case-message-id-001',
        value: {
          id: '111-111',
          subject: 'Subject 1',
          name: 'Name 1',
          body: 'Body 1',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date('2021-01-01'),
          createdBy: 'Person A'
        }
      },
      {
        id: 'ccd-case-message-id-002',
        value: {
          id: '222-222',
          subject: '',
          name: 'Name 2',
          body: 'Body 2',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date('2021-02-01'),
          createdBy: 'Person B',
          parentId: '111-111'
        }
      },
      {
        id: 'ccd-case-message-id-003',
        value: {
          id: '333-333',
          subject: '',
          name: 'Name 3',
          body: 'Body 2',
          attachments: [],
          isHearingRelated: 'No',
          hearingDate: '',
          createdOn: new Date('2021-03-01'),
          createdBy: 'Person B',
          parentId: '111-111'
        }
      }
    ];

    dummyCaseQueriesCollection = {
      partyName: 'Party Name',
      roleOnCase: 'Role on Case',
      caseMessages
    };

    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        QueryConfirmationComponent,
        RpxTranslateMockPipe
      ],
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: SessionStorageService, useValue: mockSessionStorageService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryConfirmationComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.debugElement.nativeElement;

    component.eventResponseData = dummyCaseQueriesCollection;
    component.getMessageType();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct details for new query', () => {
    component.queryCreateContext = QueryCreateContext.NEW_QUERY;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query submitted');
    expect(nativeElement.querySelector('.govuk-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for query response', () => {
    component.queryCreateContext = QueryCreateContext.RESPOND;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query response submitted');
    expect(nativeElement.querySelector('.govuk-panel__body').textContent).toEqual('This query response has been added to the case');
    expect(nativeElement.querySelector('#tasks-link').textContent).toEqual('return to tasks');
    expect(nativeElement.querySelector('#case-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for follow-up query', () => {
    component.queryCreateContext = QueryCreateContext.FOLLOWUP;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query submitted');
    expect(nativeElement.querySelector('.govuk-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for new query by HMCTS staff', () => {
    component.queryCreateContext = QueryCreateContext.NEW_QUERY;
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query submitted');
    expect(nativeElement.querySelector('.govuk-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for query response by Professional user', () => {
    component.queryCreateContext = QueryCreateContext.FOLLOWUP;
    component.isHmctsStaffRaisedQuery = 'Yes';
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query response submitted');
    expect(nativeElement.querySelector('.govuk-panel__body').textContent).toEqual('This query response has been added to the case');
    expect(nativeElement.querySelector('.govuk-link').textContent).toEqual('Go back to the case');
  });

  it('should display correct details for follow-up query by HMCTS staff', () => {
    component.queryCreateContext = QueryCreateContext.RESPOND;
    component.isHmctsStaffRaisedQuery = 'Yes';
    fixture.detectChanges();
    expect(nativeElement.querySelector('.govuk-panel__title').textContent).toEqual('Query response submitted');
    expect(nativeElement.querySelector('.govuk-panel__body').textContent).toEqual('This query response has been added to the case');
    expect(nativeElement.querySelector('#tasks-link').textContent).toEqual('return to tasks');
    expect(nativeElement.querySelector('#case-link').textContent).toEqual('Go back to the case');
  });
});
