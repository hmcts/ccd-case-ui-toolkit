import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, throwError } from 'rxjs';
import { CaseView, ErrorMessage, HttpError } from '../../../../../domain';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesState } from '../../domain';
import { LinkCaseReason, LinkedCase, LinkReason } from '../../domain/linked-cases.model';
import { LinkedCaseProposalEnum, LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { ValidatorsUtils } from '../../utils/validators.utils';

@Component({
  selector: 'ccd-link-cases',
  styleUrls: ['./link-cases.component.scss'],
  templateUrl: './link-cases.component.html'
})
export class LinkCasesComponent implements OnInit {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public errorMessages: ErrorMessage[] = [];
  public linkCaseForm: FormGroup;
  public linkCaseReasons: LinkCaseReason[];
  public selectedCases: LinkedCase[] = [];
  public caseNumberError: string;
  public caseReasonError: string;
  public caseSelectionError: string;
  public noSelectedCaseError: string;

  constructor(private casesService: CasesService,
    private readonly fb: FormBuilder,
    private readonly validatorsUtils: ValidatorsUtils,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly searchService: SearchService) { }

  ngOnInit(): void {
    this.selectedCases = this.linkedCasesService.linkedCases;
    this.getCaseReasons();
    this.getAllLinkedCaseInformation();
  }

  getCaseReasons() {
    this.casesService.getCaseLinkResponses().subscribe(reasons => {
      this.linkCaseReasons = reasons;
      this.initForm();
    }, (error: HttpError) => {
      this.linkCaseReasons = [];
      this.initForm();
    });
  }

  public initForm() {
    this.linkCaseForm = this.fb.group({
      caseNumber: ['', this.validatorsUtils.numberLengthValidator(16)],
      reasonType: this.getReasonTypeFormArray,
    });
  }

  public get getReasonTypeFormArray(): FormArray {
    return this.fb.array(this.linkCaseReasons.map(val => this.fb.group({
      key: [val.key],
      value_en: [val.value_en],
      value_cy: [val.value_cy],
      hint_text_en: [val.hint_text_en],
      hint_text_cy: [val.hint_text_cy],
      lov_order: [val.lov_order],
      parent_key: [val.parent_key],
      selected: [!!val.selected]
    })), this.validatorsUtils.formArraySelectedValidator());
  }

  public submitCaseInfo() {
    this.errorMessages = [];
    this.caseReasonError = null;
    this.caseNumberError = null;
    this.caseSelectionError = null;
    if (this.linkCaseForm.valid && !this.isCaseSelected(this.selectedCases)
      && !this.isCaseSelected(this.linkedCasesService.preLinkedCases)) {
      this.getCaseInfo();
    } else {
      this.showErrorInfo();
    }
  }

  isCaseSelected(linkedCases: LinkedCase[]): boolean {
    if (linkedCases.length === 0) {
      return false;
    }
    const caseNumber = this.linkCaseForm.value.caseNumber;
    return !!linkedCases.find(caseInfo => caseInfo.caseLink && caseInfo.caseLink.caseReference === caseNumber);
  }

  showErrorInfo() {
    if (this.linkCaseForm.controls.caseNumber.invalid) {
      this.caseNumberError = LinkedCaseProposalEnum.CaseNumberError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCaseProposalEnum.CaseNumberError,
        fieldId: 'caseNumber'
      });
    }
    if (this.linkCaseForm.controls.reasonType.invalid) {
      this.caseReasonError = LinkedCaseProposalEnum.ReasonSelectionError;
      this.errorMessages.push({
        title: 'dummy-case-reason',
        description: LinkedCaseProposalEnum.ReasonSelectionError,
        fieldId: 'caseReason'
      });
    }
    if (this.isCaseSelected(this.selectedCases)) {
      this.caseSelectionError = LinkedCaseProposalEnum.CaseProposedError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCaseProposalEnum.CaseProposedError,
        fieldId: 'caseNumber'
      });
    }
    if (this.isCaseSelected(this.linkedCasesService.preLinkedCases)) {
      this.caseSelectionError = LinkedCaseProposalEnum.CasesLinkedError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCaseProposalEnum.CasesLinkedError,
        fieldId: 'caseNumber'
      });

    }
    this.emitLinkedCasesState(false);
  }

  getCaseInfo() {
    this.casesService.getCaseViewV2(this.linkCaseForm.value.caseNumber).subscribe((caseView: CaseView) => {
      let caseInfo: LinkedCase = {} as LinkedCase;
      caseInfo.caseLink = {
        caseReference: caseView.case_id,
        linkReason: this.getSelectedCaseReasons(),
        createdDateTime: new Date().toISOString(),
        caseType: caseView.case_type.name,
        caseState: caseView.state.name,
        caseService: caseView.case_type.jurisdiction.name,
        caseName: caseView.case_type.name,
      }
      this.selectedCases.push(caseInfo);
      this.initForm();
      this.emitLinkedCasesState(false);
    }, (error: HttpError) => {
      this.caseNumberError = LinkedCaseProposalEnum.CaseCheckAgainError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCaseProposalEnum.CaseCheckAgainError,
        fieldId: 'caseNumber'
      });
      this.emitLinkedCasesState(false);
      return throwError(error);
    });
  }

  /**
   * TODO: Get all Linked cases information
   * Gets all case information
   */
  public getAllLinkedCaseInformation() {
    const linkedCaseIds: string[] = [''];
    const hearingServices = [];
    linkedCaseIds.forEach(id => {
      const query = this.searchService.searchCases('Benefit_SCSS', {}, {}, SearchService.VIEW_WORKBASKET);
      hearingServices.push(query);
    });
    forkJoin(hearingServices).subscribe((hearingsList: any) => {
      hearingsList.forEach(response => response.results.map((caseResult: any) => {
        let caseInfo: LinkedCase = {} as LinkedCase;
        caseInfo.caseLink = {
          caseReference: caseResult.case_id,
          linkReason: [],
          createdDateTime: caseResult['[CREATED_DATE]'],
          caseType: caseResult['[CASE_TYPE]'],
          caseState: caseResult['[STATE]'],
          caseService: caseResult['[JURISDICTION]'],
          caseName: caseResult['[CASE_TYPE]'],
        }
        this.linkedCasesService.preLinkedCases.push(caseInfo);
      }));
    });
  }

  // Return linked cases state and error messages to the parent
  emitLinkedCasesState(isNavigateToNextPage: boolean) {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: isNavigateToNextPage
    });
  }

  getSelectedCaseReasons(): LinkReason[] {
    let selectedReasons: LinkReason[] = [];
    this.linkCaseForm.controls.reasonType.value.forEach((selectedReason: LinkCaseReason) => {
      if (selectedReason.selected) {
        selectedReasons.push({ reason: selectedReason.value_en });
      }
    })
    return selectedReasons;
  }

  public onNext(): void {
    this.noSelectedCaseError = null;
    let navigateToNextPage = true;
    if (this.selectedCases.length) {
      this.linkedCasesService.linkedCases = this.selectedCases;
    } else {
      this.noSelectedCaseError = LinkedCaseProposalEnum.CaseSelectionError;
      this.errorMessages.push({
        title: 'dummy-case-selection',
        description: LinkedCaseProposalEnum.CaseSelectionError,
        fieldId: 'caseReason'
      });
      navigateToNextPage = false;
    }
    this.emitLinkedCasesState(navigateToNextPage);
  }
}
