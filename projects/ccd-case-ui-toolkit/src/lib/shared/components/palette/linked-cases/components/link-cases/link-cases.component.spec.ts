import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { SearchService } from '../../../../../services';
import { LovRefDataModel } from '../../../../../services/common-data-service/common-data-service';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink } from '../../domain';
import { LinkedCasesErrorMessages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { LinkCasesComponent } from './link-cases.component';
import createSpyObj = jasmine.createSpyObj;

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
  const linkCaseReasons: LovRefDataModel[] = [
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

  beforeEach(waitForAsync(() => {
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
    fixture = TestBed.createComponent(LinkCasesComponent);
    component = fixture.componentInstance;
    component.caseId = '1682374819203471';
    component.caseName = 'SSCS 2.1';
    component.linkCaseReasons = linkCaseReasons;
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

  it('should get case info on error', () => {
    spyOn(window, 'scrollTo');
    casesService.getCaseViewV2.and.returnValue(throwError('error check'));
    component.getCaseInfo();
    expect(component.caseNumberError).toEqual(LinkedCasesErrorMessages.CaseCheckAgainError);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('should check onNext', () => {
    component.onNext();
    expect(component.noSelectedCaseError).toBe(LinkedCasesErrorMessages.CaseSelectionError);
    component.selectedCases = selectedCasesInfo;
    component.onNext();
    expect(component.noSelectedCaseError).toEqual(null);
  });

  it('should check isCaseSelected', () => {
    expect(component.isCaseSelected(selectedCasesInfo)).toBe(false);
    component.linkCaseForm.get('caseNumber').setValue('1682374819203471');
    expect(component.isCaseSelected(selectedCasesInfo)).toBe(true);
  });

  it('should check showErrorInfo', () => {
    component.selectedCases = selectedCasesInfo;
    component.linkCaseForm.get('caseNumber').setValue('1682374819203471');
    component.showErrorInfo();
    expect(component.caseSelectionError).toBe(LinkedCasesErrorMessages.CasesLinkedError);
    component.showErrorInfo();
    expect(component.caseSelectionError).toBe(LinkedCasesErrorMessages.CasesLinkedError);
  });
});
