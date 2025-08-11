import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { CaseView } from '../../../../../../domain';
import { CaseNotifier } from '../../../../../case-editor';
import { QueryWriteRespondToQueryComponent } from './query-write-respond-to-query.component';
import {
  SessionStorageService
} from '../../../../../../services';
import { CaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../../models';
import { of, throwError } from 'rxjs';

@Pipe({ name: 'rpxTranslate' })
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryWriteRespondToQueryComponent', () => {
  let component: QueryWriteRespondToQueryComponent;
  let fixture: ComponentFixture<QueryWriteRespondToQueryComponent>;
  let activatedRoute: ActivatedRoute;
  let sessionStorageService: any;

  const caseId = '123';
  const CASE_VIEW: CaseView = {
    case_id: '123',
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
    tabs: [],
    triggers: [],
    events: []
  };

  const caseQueriesCollectionsMockData: CaseQueriesCollection[] = [
    {
      caseMessages: [{
        id: '42ea7fd3-178c-4584-b48b-f1275bf1804f',
        value: {
          attachments: [],
          body: 'testing by olu',
          createdBy: '120b3665-0b8a-4e80-ace0-01d8d63c1005',
          createdOn: new Date('2024-08-27T15:44:50.700Z'),
          hearingDate: '2023-01-10',
          id: 'id-007',
          isHearingRelated: 'Yes',
          name: 'Piran Sam',
          subject: 'Review attached document'
        }
      },
      {
        id: '42ea7dsd233233232',
        value: {
          attachments: [],
          body: 'testing by olu',
          createdBy: '344t',
          createdOn: new Date('2024-08-27T15:44:50.700Z'),
          hearingDate: '2023-01-10',
          id: 'id-007-testt',
          isHearingRelated: 'Yes',
          name: 'Piran Sam',
          parentId: 'id-007',
          subject: 'Review attached document'
        }
      }],
      partyName: '',
      roleOnCase: ''
    }
  ];

  const mockCaseNotifier = jasmine.createSpyObj('CaseNotifier', ['fetchAndRefresh']);
  mockCaseNotifier.fetchAndRefresh.and.returnValue(of(CASE_VIEW));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QueryWriteRespondToQueryComponent, MockRpxTranslatePipe],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: CaseNotifier, useValue: mockCaseNotifier },
        {
          provide: ActivatedRoute, useValue: {
            snapshot: {
              data: {
                case: CASE_VIEW
              },
              params: {
                cid: '123',
                dataid: 'id-007'
              }
            }
          }
        },
        { provide: CaseNotifier, useValue: mockCaseNotifier },
        { provide: SessionStorageService, useValue: sessionStorageService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRespondToQueryComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      body: new FormControl('', Validators.required),
      attachments: new FormControl([])
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set caseId and caseDetails in ngOnInit', fakeAsync(() => {
    component.ngOnInit();

    tick();

    expect(component.caseId).toEqual(caseId);
    expect(component.caseDetails).toEqual(CASE_VIEW);
  }));

  it('should log error if caseNotifier emits an error', fakeAsync(() => {
    const errorMessage = 'Error retrieving case details';
    spyOn(console, 'error');

    mockCaseNotifier.fetchAndRefresh.and.returnValue(throwError(() => errorMessage));

    component.ngOnInit();
    tick();

    expect(console.error).toHaveBeenCalledWith('Error retrieving case details:', errorMessage);
  }));

  it('should emit value when hasResponded is called', () => {
    spyOn(component.hasRespondedToQueryTask, 'emit');
    component.hasResponded(true);

    expect(component.hasRespondedToQuery).toBeTruthy();
    expect(component.hasRespondedToQueryTask.emit).toHaveBeenCalledWith(true);
  });

  it('should update queryListData when ngOnChanges is called', () => {
    activatedRoute.snapshot = {
      ...activatedRoute.snapshot,
      params: {
        ...activatedRoute.snapshot.params,
        qid: '3',
        dataId: 'id-007'
      }
    } as unknown as ActivatedRouteSnapshot;
    component.caseQueriesCollections = caseQueriesCollectionsMockData;
    component.ngOnInit();
    component.ngOnChanges();
    expect(component.queryListData.id).toEqual('id-007');
    expect(component.queryListData.subject).toEqual('Review attached document');
    expect(component.queryListData.name).toEqual('Piran Sam');
    expect(component.queryListData.body).toEqual('testing by olu');
    expect(component.queryListData.attachments).toEqual([]);
    expect(component.queryListData.isHearingRelated).toEqual('Yes');
    expect(component.queryListData.hearingDate).toEqual('2023-01-10');
    expect(component.queryListData.createdOn).toEqual(new Date('2024-08-27T15:44:50.700Z'));
    expect(component.queryListData.createdBy).toEqual('120b3665-0b8a-4e80-ace0-01d8d63c1005');
  });

  it('should return early if caseQueriesCollections is empty', () => {
    component.caseQueriesCollections = [];
    const consoleSpy = spyOn(console, 'error');
    component.ngOnChanges();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should log error if caseQueriesCollections[0] is undefined', () => {
    component.caseQueriesCollections = [undefined as any];
    const consoleSpy = spyOn(console, 'error');
    component.ngOnChanges();
    expect(consoleSpy).toHaveBeenCalledWith('caseQueriesCollections[0] is undefined!', component.caseQueriesCollections);
  });

  it('should warn and return if no messageId is found', () => {
    activatedRoute.snapshot.params = { cid: '123' }; // no dataid
    component.caseQueriesCollections = caseQueriesCollectionsMockData;

    const warnSpy = spyOn(console, 'warn');
    component.ngOnChanges();

    expect(warnSpy).toHaveBeenCalledWith('No messageId found in route params:', activatedRoute.snapshot.params);
  });

  it('should filter parent query when responding to a child message', () => {
    activatedRoute.snapshot.params = { dataid: 'id-007' };
    component.queryItemId = '3';
    component.caseQueriesCollections = caseQueriesCollectionsMockData;

    component.ngOnChanges();

    expect(component.queryListData.id).toEqual('id-007');
    expect(component.queryResponseStatus).toEqual('Responded');
  });

  it('should warn and return if no matching message is found for ID', () => {
    const unmatchedMessageId = 'non-existent-id';

    // Override route param to a non-matching ID
    activatedRoute.snapshot.params = { dataid: unmatchedMessageId };

    // Provide caseQueriesCollections with only unmatched messages
    component.caseQueriesCollections = [{
      caseMessages: [
        {
          id: 'some-id',
          value: {
            id: 'different-id',
            body: 'Message not matching',
            attachments: [],
            createdBy: '120b3665-0b8a-4e80-ace0-01d8d63c1005',
            createdOn: new Date('2024-08-27T15:44:50.700Z'),
            hearingDate: '2023-01-10',
            isHearingRelated: 'Yes',
            name: 'Piran Sam'
          }
        }
      ],
      partyName: '',
      roleOnCase: ''
    }];

    const warnSpy = spyOn(console, 'warn');

    component.ngOnChanges();

    expect(warnSpy).toHaveBeenCalledWith(
      'No matching message found for ID:',
      unmatchedMessageId
    );

    expect(component.queryListData).toBeUndefined();
    expect(component.queryItem).toBeUndefined();
  });

  it('should filter query by id when matchingMessage has no parentId', () => {
  // Set dataid to match the parent message directly
    activatedRoute.snapshot.params = { dataid: 'id-007' }; // ID of parent
    component.queryItemId = '3';

    component.caseQueriesCollections = caseQueriesCollectionsMockData;

    component.ngOnChanges();

    // Should filter directly by message id
    expect(component.queryListData.id).toEqual('id-007');
    expect(component.queryResponseStatus).toEqual('Responded');
  });

  it('should filter parent query when matchingMessage has parentId', () => {
    // Set dataid to match the child message
    activatedRoute.snapshot.params = { dataid: 'id-007-testt' }; // ID of child
    component.queryItemId = '3';

    component.caseQueriesCollections = caseQueriesCollectionsMockData;

    component.ngOnChanges();

    // Should match and filter by parentId ('id-007')
    expect(component.queryListData.id).toEqual('id-007');

    // Should set queryResponseStatus from the parent query
    expect(component.queryResponseStatus).toEqual('Responded');
  });

  it('should accept and preserve queryItem input', () => {
    const mockItem = { id: 'test-id', subject: 'Test Subject' } as QueryListItem;
    component.queryItem = mockItem;
    fixture.detectChanges();
    expect(component.queryItem).toEqual(mockItem);
  });

  it('should emit queryDataCreated when triggerSubmission is true and collection is set', () => {
    const emitSpy = spyOn(component.queryDataCreated, 'emit');
    const mockData = {} as any;

    component.triggerSubmission = true;
    component.caseQueriesCollections = caseQueriesCollectionsMockData;
    component.eventData = {} as any;
    component.caseDetails = {} as any;

    spyOn<any>(component['queryManagementService'], 'generateCaseQueriesCollectionData').and.returnValue(mockData);
    spyOn<any>(component['queryManagementService'], 'setCaseQueriesCollectionData').and.callThrough();

    component.ngOnChanges();

    expect(emitSpy).toHaveBeenCalledWith(mockData);
  });

  it('should return false when eventData is missing in setCaseQueriesCollectionData', () => {
    component.eventData = null;
    const result = component.setCaseQueriesCollectionData();
    expect(result).toBeFalsy();
  });

  it('should call resolveFieldId and set fieldId on queryManagementService', () => {
    const mockEventData: any = {
      case_fields: [
        {
          id: 'field1',
          field_type: { id: 'CaseQueriesCollection', type: 'Complex' },
          display_context: 'OPTIONAL',
          value: {
            caseMessages: [
              { value: { id: 'id-007' } }
            ]
          }
        }
      ],
      wizard_pages: [
        {
          wizard_page_fields: [{ case_field_id: 'field1', order: 1 }]
        }
      ]
    };

    const mockCaseDetails = {
      case_type: {
        jurisdiction: { id: 'CIVIL' }
      }
    } as CaseView;

    component.eventData = mockEventData;
    component.queryCreateContext = QueryCreateContext.NEW_QUERY;
    component.caseDetails = mockCaseDetails;

    const service = (component as any).queryManagementService;
    spyOn(service as any, 'getCollectionSelectionMethod').and.callThrough();
    spyOn(service as any, 'getCaseQueriesCollectionFieldOrderFromWizardPages').and.callThrough();

    const result = component.setCaseQueriesCollectionData();

    expect(result).toBeTruthy();
    expect(service.fieldId).toBe('field1');
  });

});
