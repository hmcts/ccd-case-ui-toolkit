import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AbstractAppConfig } from '../../../../../../app.config';
import { PipesModule } from '../../../../../pipes';
import { AuthService, HttpErrorService, HttpService, JurisdictionService, LoadingService, RequestOptionsBuilder, SearchService } from '../../../../../services';
import { CaseLink } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { CheckYourAnswersComponent } from './check-your-answers.component';

describe('CheckYourAnswersComponent', () => {
  let component: CheckYourAnswersComponent;
  let fixture: ComponentFixture<CheckYourAnswersComponent>;
  let nativeElement: any;
  const linkedCases: CaseLink[] = [
    {
      caseReference: '5283-8196-7254-2864',
      caseName: '',
      caseService: '',
      caseState: '',
      caseStateDescription: '',
      caseType: '',
      caseTypeDescription: '',
      createdDateTime: '11/05/2022',
      reasons: [
        {
          reasonCode: 'Progressed as part of this lead case'
        },
        {
          reasonCode: 'Linked for a hearing'
        }
      ]
    },
    {
      caseReference: '8254-9025-7233-6147',
      caseName: '',
      caseService: '',
      caseState: '',
      caseStateDescription: '',
      caseType: '',
      caseTypeDescription: '',
      createdDateTime: '11/05/2022',
      reasons: [
        {
          reasonCode: 'Case consolidated Familial Guardian Linked for a hearing'
        }
      ]
    },
    {
      caseReference: '4652-7249-0269-6213',
      caseName: '',
      caseService: '',
      caseState: '',
      caseStateDescription: '',
      caseType: '',
      caseTypeDescription: '',
      createdDateTime: '11/05/2022',
      reasons: [
        {
          reasonCode: 'Familial'
        }
      ]
    }
  ];
  const casesToUnlink: CaseLink[] = [
    {
      caseReference: '5238-8916-7452-6482',
      caseName: '',
      caseService: '',
      caseState: '',
      caseStateDescription: '',
      caseType: '',
      caseTypeDescription: '',
      createdDateTime: '10/03/2022',
      reasons: [
        {
          reasonCode: 'This case is to be unlinked'
        },
        {
          reasonCode: 'Case has been marked for unlinking'
        }
      ]
    },
    {
      caseReference: '8245-9520-7332-4716',
      caseName: '',
      caseService: '',
      caseState: '',
      caseStateDescription: '',
      caseType: '',
      caseTypeDescription: '',
      createdDateTime: '10/03/2022',
      reasons: [
        {
          reasonCode: 'Case has been marked for unlinking'
        }
      ]
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        PipesModule,
        HttpClientTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CheckYourAnswersComponent],
      providers: [LinkedCasesService, JurisdictionService, SearchService, AbstractAppConfig,
                  HttpService, HttpErrorService, AuthService, RequestOptionsBuilder, LoadingService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckYourAnswersComponent);
    component = fixture.componentInstance;
    spyOn(component.linkedCasesStateEmitter, 'emit');
    component.linkedCases = linkedCases;
    nativeElement = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display table if any data available for link cases', () => {
    component.linkedCases = linkedCases;
    component.isLinkCasesJourney = true;
    fixture.detectChanges();
    const tableElement = nativeElement.querySelector('.govuk-table');
    expect(tableElement.textContent).toContain('Linked cases');
    const errorMessageElement = nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should emit linked cases state when change clicked', () => {
    component.linkedCases = linkedCases;
    component.casesToUnlink = casesToUnlink;
    fixture.detectChanges();
    const changeLinkElement = nativeElement.querySelector('.govuk-link');
    changeLinkElement.click();
    fixture.detectChanges();
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalledWith(
      { currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS, navigateToPreviousPage: true, navigateToNextPage: true });
  });

  it('should display change link for link cases', () => {
    component.linkedCases = linkedCases;
    component.isLinkCasesJourney = true;
    fixture.detectChanges();
    const changeLinkElement = nativeElement.querySelector('.govuk-link');
    expect(changeLinkElement).toBeDefined();
  });

  it('should change link not be visible for manage case links', () => {
    component.linkedCases = linkedCases;
    component.isLinkCasesJourney = false;
    fixture.detectChanges();
    const linkedCasesTableElement = nativeElement.querySelector('#linked-cases-table');
    const changeLinkElement = linkedCasesTableElement.querySelector('.govuk-link');
    expect(changeLinkElement).toBeNull();
  });
});
