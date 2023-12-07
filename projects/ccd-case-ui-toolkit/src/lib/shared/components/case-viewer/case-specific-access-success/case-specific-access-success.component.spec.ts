import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CaseSpecificAccessSuccessComponent } from './case-specific-access-success.component';

describe('CaseSpecificAccessSuccessComponent', () => {
  let component: CaseSpecificAccessSuccessComponent;
  let fixture: ComponentFixture<CaseSpecificAccessSuccessComponent>;
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
      declarations: [ CaseSpecificAccessSuccessComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseSpecificAccessSuccessComponent);
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
    expect(viewCaseFileLinkElement.getAttribute('href')).toEqual(`work/my-work/my-access`);
  });
});
