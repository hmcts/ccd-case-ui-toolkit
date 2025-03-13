import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PipesModule } from '../../../../../pipes';
import { CaseEditComponent, CasesService } from '../../../../case-editor';
import { CaseLink } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';
import { UnLinkCasesComponent } from './unlink-cases.component';
import { MultipageComponentStateService } from '../../../../../services';
import createSpyObj = jasmine.createSpyObj;

describe('UnLinkCasesComponent', () => {
  let component: UnLinkCasesComponent;
  let fixture: ComponentFixture<UnLinkCasesComponent>;
  let nativeElement: any;
  let casesService: any;
  let caseEditComponentStub: any;

  const caseInfo = {
    case_id: '1682374819203471',
    case_type: {
      name: 'SSCS type',
      jurisdiction: { name: '' }
    },
    state: { name: 'With FTA' },
    tabs: [
      {
        id: 'linked_cases_sscs',
        fields: [
          {
            value: [
              {
                caseReference: '1652112127295261',
                modified_date_time: '2022-05-10',
                caseType: 'Benefit_SCSS',
                reasons: [
                  {
                    reasonCode: 'bail',
                    OtherDescription: ''
                  }
                ]
              },
              {
                caseReference: '1652111610080172',
                modified_date_time: '2022-05-10',
                caseType: 'Benefit_SCSS',
                reasons: [
                  {
                    reasonCode: 'consolidated',
                    OtherDescription: ''
                  }
                ]
              },
              {
                caseReference: '1652111179220086',
                modified_date_time: '2022-05-10',
                caseType: 'Benefit_SCSS',
                reasons: [
                  {
                    reasonCode: 'progressed',
                    OtherDescription: ''
                  },
                  {
                    reasonCode: 'familial',
                    OtherDescription: ''
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const caseInfoChallengedAccess = {
    case_id: '1682374819203471',
    case_type: {
      name: 'SSCS type',
      jurisdiction: { name: '' }
    },
    state: { name: 'With FTA' },
    tabs: []
  };

  const linkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    }
  ];

  const linkedCasesService = {
    caseId: '1682374819203471',
    linkedCases,
    getAllLinkedCaseInformation() { },
    getCaseName() { },
    caseFieldValue: [],
    casesToUnlink: []
  };

  beforeEach(waitForAsync(() => {
    const FORM_GROUP = new FormGroup({
      data: new FormGroup({ caseLinks: new FormControl('SOME_VALUE') })
    });
    caseEditComponentStub = {
      form: FORM_GROUP,
      data: '',
      eventTrigger: { case_fields: [] },
      hasPrevious: () => true,
      getPage: () => null,
      confirmation: {
        getCaseId: () => 'case1',
        getStatus: () => 'status1',
        getHeader: () => 'Header',
        getBody: () => 'A body with mark down'
      },
      caseDetails: {
        case_id: '1234567812345678', tabs: [{
          id: 'tab1', label: 'tabLabel1',
          fields: []
        }], metadataFields: [],
        state: { id: '1', name: 'Incomplete Application', title_display: '# 1234567812345678: test' }
      },
    };
    casesService = createSpyObj('CasesService', ['getCaseViewV2']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        PipesModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [UnLinkCasesComponent],
      providers: [
        { provide: CasesService, useValue: casesService },
        { provide: LinkedCasesService, useValue: linkedCasesService },
        { provide: CaseEditComponent, useValue: caseEditComponentStub },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnLinkCasesComponent);
    casesService.getCaseViewV2.and.returnValue(of(caseInfo));
    component = fixture.componentInstance;
    nativeElement = fixture.debugElement.nativeElement;
    spyOn(component.linkedCasesStateEmitter, 'emit');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should next button emit linked cases state', () => {
    component.onNext();
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalled();
  });

  it('should getLinkedCases populate linked cases', () => {
    component.getLinkedCases();
    expect(component.caseId).toEqual('1682374819203471');
    expect(component.linkedCases.length).toEqual(2);
    expect(component.linkedCases[0].caseReference).toEqual('1682374819203471');
    expect(component.linkedCases[1].caseReference).toEqual('1682897456391875');
  });

  it('should getLinkedCases populate linked cases if there is challenged access cases', () => {
    casesService.getCaseViewV2.and.returnValue(of(caseInfoChallengedAccess));
    linkedCasesService.linkedCases = [];
    component.getLinkedCases();
    expect(component.linkedCases.length).toEqual(2);
    expect(component.linkedCases[0].caseReference).toEqual('1682374819203471');
    expect(component.linkedCases[1].caseReference).toEqual('1682897456391875');
  })
  
  it('should fetch linked cases from case service when service is empty', () => {
    linkedCasesService.linkedCases = [];
    component.getLinkedCases();
    expect(casesService.getCaseViewV2).toHaveBeenCalledWith('1682374819203471');
    expect(component.linkedCases.length).toBe(3);
    expect(component.linkedCases[0].caseReference).toBe('1652112127295261');
  });

  it('should update the unlink property of linked case with correct value', () => {
    component.linkedCases = linkedCases;
    const caseSelected1 = {
      value: '1682897456391875',
      checked: false
    };
    component.onChange(caseSelected1);
    expect(component.linkedCases[0].unlink).toBeUndefined();
    expect(component.linkedCases[1].unlink).toBe(false);

    const caseSelected2 = {
      value: '1682897456391875',
      checked: true
    };
    component.onChange(caseSelected2);
    expect(component.linkedCases[0].unlink).toBeUndefined();
    expect(component.linkedCases[1].unlink).toBe(true);
  });

  it('should call onNext method when next is called', () => {
    spyOn(component, 'onNext');
    component.next();
    expect(component.onNext).toHaveBeenCalled();
  });

  it('should call super next method when errorMessages length is 0', () => {
    spyOn(component, 'next').and.callThrough();
    spyOn(component, 'onNext');
    component.errorMessages = [];
    component.next();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.next).toHaveBeenCalled();
  });

  it('should not call super next method when errorMessages length is not 0', () => {
    spyOn(component, 'next').and.callThrough();
    spyOn(component, 'onNext');
    component.errorMessages = [{ title: 'string', description: 'string' }];
    component.next();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.next).toHaveBeenCalledTimes(1);
  });

  it('should not set the journeyPageNumber if the linkedCasePage is not less than the journeyPageNumber', () => {
    let service: MultipageComponentStateService;
    const mockJourney = {
      journeyId: 'test',
      journeyPageNumber: 4,
      journeyStartPageNumber: 0,
      journeyPreviousPageNumber: 0,
      journeyEndPageNumber: 4,
      linkedCasesPage: 3,
      next: () => { },
      previous: () => { },
      hasNext: () => true,
      hasPrevious: () => true,
      isFinished: () => false,
      isStart: () => false,
      childJourney: undefined,
      onPageChange: () => { }
    };

    const mockInstigator = {
      onFinalNext: () => { },
      onFinalPrevious: () => { }
    };

    service = new MultipageComponentStateService();
    service.setJourneyCollection([mockJourney]);
    service.setInstigator(mockInstigator);

    component = new UnLinkCasesComponent(
      TestBed.inject(FormBuilder),
      TestBed.inject(CasesService),
      TestBed.inject(LinkedCasesService),
      service
    );

    component.ngOnInit();
    expect(component.getJourneyCollection().journeyPageNumber).toEqual(3);
  });

  it('should fetch and update linked case information', () => {
    component.getAllLinkedCaseInformation();

    expect(linkedCasesService.linkedCases).toEqual(component.linkedCases);
    expect(component.isServerError).toBeFalsy();
  });
});
