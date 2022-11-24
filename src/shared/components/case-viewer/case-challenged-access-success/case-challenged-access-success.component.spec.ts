import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success.component';

describe('CaseChallengedAccessSuccessComponent', () => {
  let component: CaseChallengedAccessSuccessComponent;
  let fixture: ComponentFixture<CaseChallengedAccessSuccessComponent>;
  const case_id = '1234123412341234';
  const mockRoute = {
    snapshot: {
      params: {
        cid: case_id
      }
    }
  };

  beforeEach(async(() => {
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
    expect(confirmationMessageElement.textContent).toContain(case_id);
  });

  it('should have the correct Case Reference in the \"View case file\" link URL', () => {
    const viewCaseFileLinkElement = fixture.debugElement.nativeElement.querySelector('p.govuk-body a');
    expect(viewCaseFileLinkElement.getAttribute('href')).toEqual(`/cases/case-details/${case_id}`);
  });
});
