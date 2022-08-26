import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { CaseSpecificAccessSuccessComponent } from './case-specific-access-success.component';

describe('CaseSpecificAccessSuccessComponent', () => {
  let component: CaseSpecificAccessSuccessComponent;
  let fixture: ComponentFixture<CaseSpecificAccessSuccessComponent>;
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
      imports: [
        RpxTranslationModule.forRoot({ baseUrl: '', debounceTimeMs: 300, testMode: true, validity: { days: 1 }})
      ],
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
    expect(confirmationMessageElement.textContent).toContain(case_id);
  });

  it('should have the correct Case Reference in the \"View case file\" link URL', () => {
    const viewCaseFileLinkElement = fixture.debugElement.nativeElement.querySelector('p.govuk-body a');
    expect(viewCaseFileLinkElement.getAttribute('href')).toEqual(`work/my-work/my-access`);
  });
});
