import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkedCase } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { CheckYourAnswersComponent } from './check-your-answers.component';

describe('CheckYourAnswersComponent', () => {
  let component: CheckYourAnswersComponent;
  let fixture: ComponentFixture<CheckYourAnswersComponent>;
  const linkedCases: LinkedCase[] = [
    {
      caseLink: {
        caseReference: '5283-8196-7254-2864',
        caseName: '',
        caseService: '',
        caseState: '',
        caseType: '',
        createdDateTime: '11/05/2022',
        linkReason: [
          {
            reason: 'Progressed as part of this lead case'
          },
          {
            reason: 'Linked for a hearing'
          }
        ]
      }
    },
    {
      caseLink: {
        caseReference: '8254-9025-7233-6147',
        caseName: '',
        caseService: '',
        caseState: '',
        caseType: '',
        createdDateTime: '11/05/2022',
        linkReason: [
          {
            reason: 'Case consolidated Familial Guardian Linked for a hearing'
          }
        ]
      }
    },
    {
      caseLink: {
        caseReference: '4652-7249-0269-6213',
        caseName: '',
        caseService: '',
        caseState: '',
        caseType: '',
        createdDateTime: '11/05/2022',
        linkReason: [
          {
            reason: 'Familial'
          }
        ]
      }
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CheckYourAnswersComponent],
      providers: [LinkedCasesService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckYourAnswersComponent);
    component = fixture.componentInstance;
    spyOn(component.linkedCasesStateEmitter, 'emit');
    component.linkedCases = linkedCases;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display table if any data available', () => {
    const tableElement = fixture.debugElement.nativeElement.querySelector('.govuk-table');
    expect(tableElement.textContent).toContain('Proposed case links');
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should emit linked cases state when change clicked', () => {
    component.linkedCases = linkedCases;
    fixture.detectChanges();
    const changeLinkElement = fixture.debugElement.nativeElement.querySelector('.govuk-link');
    changeLinkElement.click();
    fixture.detectChanges();
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalledWith(
      { currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS, navigateToPreviousPage: true });
  });
});
