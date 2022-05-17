import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkCaseReason } from '../../domain';
import { LinkedCaseProposalEnum } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { LinkCasesComponent } from './link-cases.component';
import createSpyObj = jasmine.createSpyObj;

describe('LinkCasesComponent', () => {
  let component: LinkCasesComponent;
  let fixture: ComponentFixture<LinkCasesComponent>;
  let nextButton: any;
  let casesService: any;
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
      selected: true,
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
  beforeEach(async(() => {
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        LinkedCasesService,
        { provide: CasesService, useValue: casesService },
      ],
      declarations: [LinkCasesComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkCasesComponent);
    component = fixture.componentInstance;
    casesService.getCaseLinkResponses.and.returnValue(of(linkCaseReasons));
    spyOn(component.linkedCasesStateEmitter, 'emit');
    nextButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should check getCaseLinkResponses error', () => {
    casesService.getCaseLinkResponses.and.returnValue(throwError({}));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.linkCaseReasons).toEqual([]);
  });

  it('should check submitCaseInfo', () => {
    casesService.getCaseViewV2.and.returnValue(throwError({}));
    component.submitCaseInfo();
    expect(component.caseNumberError).toBe(LinkedCaseProposalEnum.CaseNumberError);
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalled();
    component.linkCaseForm.get('caseNumber').setValue('1682374819203471');
    component.submitCaseInfo();
    expect(casesService.getCaseViewV2).toHaveBeenCalled();
  });

  it('should check getCaseInfo', () => {
    const caseInfo = {
      case_id: '1682374819203471',
      case_type: {
        name: 'SSCS type',
        jurisdiction: { name: '' }
      }, state: { name: 'With FTA' }
    }
    casesService.getCaseViewV2.and.returnValue(of(caseInfo));
    component.getCaseInfo();
    expect(component.caseNumberError).toBe(undefined);
    expect(component.linkedCasesStateEmitter.emit).toHaveBeenCalled();
    component.onNext();
    expect(component.noSelectedCaseError).toBe(null);
  });

  it('should check getCaseInfo error', () => {
    casesService.getCaseViewV2.and.returnValue(throwError({}));
    component.getCaseInfo();
    expect(casesService.getCaseViewV2).toHaveBeenCalled();
    expect(component.caseNumberError).toBe(LinkedCaseProposalEnum.CaseCheckAgainError);
  });

  it('should check getSelectedCaseReasons', () => {
    expect(component.getSelectedCaseReasons().length).toBe(1);
  });

  it('should check onNext', () => {
    component.onNext();
    expect(component.noSelectedCaseError).toBe(LinkedCaseProposalEnum.CaseSelectionError);
  });
});
