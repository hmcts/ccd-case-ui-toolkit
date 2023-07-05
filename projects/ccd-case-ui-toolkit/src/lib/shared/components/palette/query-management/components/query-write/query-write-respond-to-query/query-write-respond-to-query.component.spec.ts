import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
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
});
