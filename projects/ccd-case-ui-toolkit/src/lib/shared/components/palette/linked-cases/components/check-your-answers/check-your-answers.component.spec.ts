import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
          Reason: 'Progressed as part of this lead case'
        },
        {
          Reason: 'Linked for a hearing'
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
          Reason: 'Case consolidated Familial Guardian Linked for a hearing'
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
          Reason: 'Familial'
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
          Reason: 'This case is to be unlinked'
        },
        {
          Reason: 'Case has been marked for unlinking'
        }
      ],
      unlink: true
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
          Reason: 'Case has been marked for unlinking'
        }
      ],
      unlink: true
    }
  ];
  const linkedCasesService = {
    caseId: '1682374819203471',
    isLinkedCasesEventTrigger: true,
    linkedCases,
    casesToUnlink: []
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        PipesModule,
        HttpClientTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CheckYourAnswersComponent],
      providers: [
        JurisdictionService,
        SearchService,
        AbstractAppConfig,
        HttpService,
        HttpErrorService,
        AuthService,
        RequestOptionsBuilder,
        LoadingService,
        { provide: LinkedCasesService, useValue: linkedCasesService },
      ]
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
    expect(tableElement.textContent).toContain('Proposed case links');
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

  it('should set correct link cases table caption', () => {
    linkedCasesService.isLinkedCasesEventTrigger = true;
    expect(component.linkedCasesTableCaption).toEqual('Proposed case links');
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

  it('should emit correct state and call super.next() when next is called', () => {
    spyOn(component, 'next').and.callThrough();

    component.next();

    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalledWith({
      currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS,
      navigateToPreviousPage: false,
      navigateToNextPage: true
    });
  });

  it('should call next method', () => {
    spyOn(component, 'next');

    component.next();

    expect(component.next).toHaveBeenCalledTimes(1);
  });

  it('should set unlink to true for matching case references', () => {
    linkedCasesService.casesToUnlink = ['123', '456'];
    linkedCasesService.linkedCases = [
      {
        caseReference: '123', unlink: false,
        reasons: [],
        createdDateTime: '',
        caseType: '',
        caseTypeDescription: '',
        caseState: '',
        caseStateDescription: '',
        caseService: '',
        caseName: ''
      },
      {
        caseReference: '789', unlink: false,
        reasons: [],
        createdDateTime: '',
        caseType: '',
        caseTypeDescription: '',
        caseState: '',
        caseStateDescription: '',
        caseService: '',
        caseName: ''
      },
      {
        caseReference: '456', unlink: false,
        reasons: [],
        createdDateTime: '',
        caseType: '',
        caseTypeDescription: '',
        caseState: '',
        caseStateDescription: '',
        caseService: '',
        caseName: ''
      }
    ];

    component.ensureDataIntegrity();

    expect(linkedCasesService.linkedCases[0].unlink).toBeTruthy();
    expect(linkedCasesService.linkedCases[1].unlink).toBeFalsy();
    expect(linkedCasesService.linkedCases[2].unlink).toBeTruthy();
  });

  it('should not set unlink to true if no matching case references', () => {
    linkedCasesService.casesToUnlink = ['999'];
    linkedCasesService.linkedCases = [
      {
        caseReference: '123', unlink: false,
        reasons: [],
        createdDateTime: '',
        caseType: '',
        caseTypeDescription: '',
        caseState: '',
        caseStateDescription: '',
        caseService: '',
        caseName: ''
      },
      {
        caseReference: '789', unlink: false,
        reasons: [],
        createdDateTime: '',
        caseType: '',
        caseTypeDescription: '',
        caseState: '',
        caseStateDescription: '',
        caseService: '',
        caseName: ''
      },
      {
        caseReference: '456', unlink: false,
        reasons: [],
        createdDateTime: '',
        caseType: '',
        caseTypeDescription: '',
        caseState: '',
        caseStateDescription: '',
        caseService: '',
        caseName: ''
      }
    ];

    component.ensureDataIntegrity();

    expect(linkedCasesService.linkedCases[0].unlink).toBeFalsy();
    expect(linkedCasesService.linkedCases[1].unlink).toBeFalsy();
    expect(linkedCasesService.linkedCases[2].unlink).toBeFalsy();
  });
});
