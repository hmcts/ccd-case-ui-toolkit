import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink, LinkCaseReason } from '../../domain';
import { LinkedCasesErrorMessages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { LinkCasesComponent } from './link-cases.component';
import { PipesModule } from '../../../../../pipes/pipes.module';

import createSpyObj = jasmine.createSpyObj;
import { By } from '@angular/platform-browser';

describe('LinkCasesComponent', () => {
  let component: LinkCasesComponent;
  let fixture: ComponentFixture<LinkCasesComponent>;
  let casesService: any;
  let searchService: any;

  const selectedCasesInfo: CaseLink[] = [{
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
  }];
  const linkCaseReasons: LinkCaseReason[] = [
    {
      key: 'progressed',
      value_en: 'Progressed as part of this lead case',
      value_cy: '',
      hint_text_en: 'Progressed as part of this lead case',
      hint_text_cy: '',
      lov_order: 1,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
    {
      key: 'bail',
      value_en: 'Bail',
      value_cy: '',
      hint_text_en: 'Bail',
      hint_text_cy: '',
      lov_order: 2,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
    {
      key: 'other',
      value_en: 'Other',
      value_cy: '',
      hint_text_en: 'Other',
      hint_text_cy: '',
      lov_order: 3,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
  ];
  const linkedCasesService = {
    editMode: true,
    caseId: '1682374819203471',
    linkedCases: [],
    linkCaseReasons,
    caseFieldValue: [],
    mapLookupIDToValueFromJurisdictions() {},
    getCaseName() {}
  };

  beforeEach(async(() => {
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses']);
    searchService = createSpyObj('searchService', ['searchCases']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PipesModule,
        ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: LinkedCasesService, useValue: linkedCasesService },
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService }
      ],
      declarations: [LinkCasesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const caseInfo = {
      case_id: '1682374819203471',
      case_type: {
        name: 'SSCS type',
        jurisdiction: { name: '' }
      }, state: { name: 'With FTA' },
      metadataFields: {
        caseNameHmctsInternal: ''
      }
    }
    fixture = TestBed.createComponent(LinkCasesComponent);
    component = fixture.componentInstance;
    spyOn(linkedCasesService, 'linkCaseReasons').and.returnValue(of(linkCaseReasons));
    spyOn(component.linkedCasesStateEmitter, 'emit');
    fixture.detectChanges();
  });

  it('should create component', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should create UI with the case number error message ', () => {
    casesService.getCaseViewV2.and.returnValue(throwError({}));
    component.submitCaseInfo();
    expect(component.caseNumberError).toBe(LinkedCasesErrorMessages.CaseNumberError);
  });

  it('should check submitCaseInfo', () => {
    const caseInfo = {
      case_id: '1231231231231231',
      case_type: {
        name: 'SSCS type',
        jurisdiction: { name: '' }
      }, state: { name: 'With FTA' }
    }
    casesService.getCaseViewV2.and.returnValue(of(caseInfo));
    spyOn(linkedCasesService, 'getCaseName').and.returnValue(of('Case name missing'));
    component.linkCaseForm.get('caseNumber').setValue('1231231231231231');
    const reasonOption = fixture.debugElement.query(By.css('input[value="Progressed as part of this lead case"]')).nativeElement;
    reasonOption.click();
    fixture.detectChanges();
    component.submitCaseInfo();
    expect(component.caseNumberError).toBeNull();
    expect(component.selectedCases.length).toEqual(1);
    component.onSelectedLinkedCaseRemove(0, '1231231231231231');
    expect(component.selectedCases.length).toEqual(0);
    component.onNext();
  });

  it('should check various error use cases', () => {
    component.linkCaseForm.get('caseNumber').setValue('16934389402343');
    component.submitCaseInfo();
    expect(component.caseNumberError).not.toBeNull();
    expect(component.selectedCases.length).toBe(0);
  });

  it('should check onNext', () => {
    component.onNext();
    expect(component.noSelectedCaseError).toBe(LinkedCasesErrorMessages.CaseSelectionError);
  });

  it('should check isCaseSelected', () => {
    component.linkedCasesService.caseFieldValue = [];
    expect(component.isCaseSelected(selectedCasesInfo)).toBe(false);
    component.linkCaseForm.get('caseNumber').setValue('1682374819203471');
    expect(component.isCaseSelected(selectedCasesInfo)).toBe(true);
  });

  it('should check showErrorInfo', () => {
    component.selectedCases = selectedCasesInfo;
    component.linkCaseForm.get('caseNumber').setValue('1682374819203471');
    component.showErrorInfo();
    expect(component.caseSelectionError).toBe(LinkedCasesErrorMessages.CaseProposedError);
    component.showErrorInfo();
    expect(component.caseSelectionError).toBe(LinkedCasesErrorMessages.CaseProposedError);
  });
});
