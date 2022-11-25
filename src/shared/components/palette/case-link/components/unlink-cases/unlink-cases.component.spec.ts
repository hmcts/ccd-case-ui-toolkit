import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PipesModule } from '../../../../../pipes';
import { CaseEditComponent, CasesService } from '../../../../case-editor';
import { CaseLink } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';
import { UnLinkCasesComponent } from './unlink-cases.component';
import createSpyObj = jasmine.createSpyObj;

describe('UnLinkCasesComponent', () => {
  let component: UnLinkCasesComponent;
  let fixture: ComponentFixture<UnLinkCasesComponent>;
  let casesService: any;
  let linkedCasesService: any;
  let nativeElement: any;
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

  const linkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    }
  ];

  linkedCasesService = {
    caseId: '1682374819203471',
    linkedCases: linkedCases,
    getAllLinkedCaseInformation() {},
    caseFieldValue: [],
  };

  beforeEach(async(() => {
    const FORM_GROUP = new FormGroup({
      'data': new FormGroup({'caseLinks': new FormControl('SOME_VALUE')})
    });
    caseEditComponentStub = {
      'form': FORM_GROUP,
      'data': '',
      'eventTrigger': {'case_fields': []},
      'hasPrevious': () => true,
      'getPage': () => null,
      'confirmation': {
        'getCaseId': () => 'case1',
        'getStatus': () => 'status1',
        'getHeader': () => 'Header',
        'getBody': () => 'A body with mark down'
      },
      'caseDetails': {'case_id': '1234567812345678', 'tabs': [{id: 'tab1', label: 'tabLabel1',
        fields: []}], 'metadataFields': [],
        'state': {'id': '1', 'name': 'Incomplete Application', 'title_display': '# 1234567812345678: test'}},
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
    expect(component.linkedCases.length).toEqual(2);
    expect(component.linkedCases[0].caseReference).toEqual('1682374819203471');
    expect(component.linkedCases[1].caseReference).toEqual('1682897456391875');
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
})
