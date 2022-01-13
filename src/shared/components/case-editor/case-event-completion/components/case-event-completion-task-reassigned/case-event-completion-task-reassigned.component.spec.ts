import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SessionStorageService } from '../../../../../services';
import { CaseEventCompletionTaskReassignedComponent } from './case-event-completion-task-reassigned.component';
import createSpyObj = jasmine.createSpyObj;

describe('TaskReassignedComponent', () => {
  let component: CaseEventCompletionTaskReassignedComponent;
  let fixture: ComponentFixture<CaseEventCompletionTaskReassignedComponent>;
  let mockSessionStorageService: any;
  const mockRoute: any = {
    snapshot: {
      data: {
        case: {
          case_id: '1620409659381330'
        }
      },
      params: {
        'cid': '1620409659381330'
      }
    }
  };

  beforeEach(async(() => {
    mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    mockSessionStorageService.getItem.and.returnValue(`[{"email": "testuser@mail.com", "firstName": "Test", "lastName": "User",
      "idamId": "123-123-123-123", "location": null, "roleCategory": null}]`);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CaseEventCompletionTaskReassignedComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute},
        {provide: SessionStorageService, useValue: mockSessionStorageService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventCompletionTaskReassignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task reassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task reassigned');
  });
});
