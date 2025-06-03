import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { CaseView } from '../../../../../../domain';
import { CaseNotifier } from '../../../../../case-editor';
import { QueryWriteRespondToQueryComponent } from './query-write-respond-to-query.component';
import { CaseQueriesCollection } from '../../../models';
import { getMockCaseNotifier } from '../../../../../case-editor/services/case.notifier.spec';

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

  const caseId = '1234';
  const CASE_VIEW: CaseView = {
    case_id: '1234',
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

  const mockCaseNotifier = getMockCaseNotifier(CASE_VIEW);

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
        }
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

  it('should set caseId and caseDetails in ngOnInit', (done) => {
    component.ngOnInit();

    // Allow observable to emit
    fixture.whenStable().then(() => {
      expect(component.caseId).toEqual(caseId);
      expect(component.caseDetails).toEqual(CASE_VIEW);
      done();
    });
  });

  it('should log error if caseNotifier emits an error', () => {
    spyOn(console, 'error'); // Spy on the console.error to verify the log output

    // Spy on the mockCaseNotifier's caseView to simulate an error
    spyOn(mockCaseNotifier.caseView, 'subscribe').and.callFake((observer: any) => {
      observer.error('Error retrieving case details');
    });

    // Trigger the component's ngOnInit
    component.ngOnInit();

    // Verify that console.error was called with the expected error message
    expect(console.error).toHaveBeenCalledWith('Error retrieving case details:', 'Error retrieving case details');
  });

  it('should emit value when hasResponded is called', () => {
    spyOn(component.hasRespondedToQueryTask, 'emit');
    component.hasResponded(true);

    expect(component.hasRespondedToQuery).toBeTruthy();
    expect(component.hasRespondedToQueryTask.emit).toHaveBeenCalledWith(true);
  });

  it('should update queryItemDisplay when ngOnChanges is called', () => {
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
    expect(component.queryItemDisplay.id).toEqual('id-007');
    expect(component.queryItemDisplay.subject).toEqual('Review attached document');
    expect(component.queryItemDisplay.name).toEqual('Piran Sam');
    expect(component.queryItemDisplay.body).toEqual('testing by olu');
    expect(component.queryItemDisplay.attachments).toEqual([]);
    expect(component.queryItemDisplay.isHearingRelated).toEqual('Yes');
    expect(component.queryItemDisplay.hearingDate).toEqual('2023-01-10');
    expect(component.queryItemDisplay.createdOn).toEqual(new Date('2024-08-27T15:44:50.700Z'));
    expect(component.queryItemDisplay.createdBy).toEqual('120b3665-0b8a-4e80-ace0-01d8d63c1005');
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

    expect(component.queryItemDisplay.id).toEqual('id-007');
    expect(component.queryItem.id).toEqual('id-007');
    expect(component.queryResponseStatus).toEqual('Responded');
  });
});
