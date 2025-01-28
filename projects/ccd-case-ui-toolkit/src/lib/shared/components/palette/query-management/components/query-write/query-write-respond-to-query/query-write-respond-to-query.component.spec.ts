import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { CaseView } from '../../../../../../domain';
import { CaseNotifier } from '../../../../../case-editor';
import { QueryWriteRespondToQueryComponent } from './query-write-respond-to-query.component';

@Pipe({ name: 'rpxTranslate' })
class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, ...args: any[]) {
    return value;
  }
}

describe('QueryWriteRespondToQueryComponent', () => {
  let component: QueryWriteRespondToQueryComponent;
  let fixture: ComponentFixture<QueryWriteRespondToQueryComponent>;

  const caseId = '1234';
  const CASE_VIEW: CaseView = {
    case_id: '1234',
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
  const casesService = jasmine.createSpyObj('casesService', ['caseView']);
  const mockCaseNotifier = new CaseNotifier(casesService);
  mockCaseNotifier.caseView = new BehaviorSubject(CASE_VIEW).asObservable();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QueryWriteRespondToQueryComponent, MockRpxTranslatePipe],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: CaseNotifier, useValue: mockCaseNotifier },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteRespondToQueryComponent);
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
    // const errorNotifier = new BehaviorSubject<CaseView | null>(null);

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
});
