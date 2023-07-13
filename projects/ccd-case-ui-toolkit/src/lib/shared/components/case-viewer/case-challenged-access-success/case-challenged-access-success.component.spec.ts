import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success.component';

describe('CaseChallengedAccessSuccessComponent', () => {
  let component: CaseChallengedAccessSuccessComponent;
  let fixture: ComponentFixture<CaseChallengedAccessSuccessComponent>;
  const caseId = '1234123412341234';
  const mockRoute = {
    snapshot: {
      params: {
        cid: caseId
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]) ],
      declarations: [ CaseChallengedAccessSuccessComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseChallengedAccessSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and show the correct Case Reference', () => {
    expect(component).toBeDefined();
    const confirmationMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-panel__body');
    expect(confirmationMessageElement.textContent).toContain(caseId);
  });

  it('should have the correct Case Reference in the \"View case file\" link URL', () => {
    const viewCaseFileLinkElement = fixture.debugElement.nativeElement.querySelector('p.govuk-body a');
    expect(viewCaseFileLinkElement.getAttribute('href')).toContain(`/cases/case-details/${caseId}`);
  });
});
