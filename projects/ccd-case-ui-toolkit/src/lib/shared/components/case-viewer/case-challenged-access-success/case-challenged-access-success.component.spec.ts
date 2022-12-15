import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success.component';

describe('CaseChallengedAccessSuccessComponent', () => {
  let component: CaseChallengedAccessSuccessComponent;
  let fixture: ComponentFixture<CaseChallengedAccessSuccessComponent>;
  const case_id = '1234123412341234';
  const mockRoute = {
    snapshot: {
      data: {
        case: {
          case_id
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseChallengedAccessSuccessComponent, MockRpxTranslatePipe ],
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
    expect(viewCaseFileLinkElement.getAttribute('href')).toEqual(`cases/case-details/${case_id}`);
  });
});
