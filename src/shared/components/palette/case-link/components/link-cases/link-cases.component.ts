import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { throwError } from 'rxjs';
import { CaseView, ErrorMessage, HttpError } from '../../../../../domain';
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

  errorMessages: ErrorMessage[];
  public linkCaseForm: FormGroup;
  public linkCaseReasons: LinkCaseReason[];
  public selectedCases: LinkedCase[] = [];
  public validationErrors: { id: string, message: string }[] = [];
  public caseNumberError: string;
  public caseReasonError: string;
  public noSelectedCaseError: string;

  constructor(private casesService: CasesService,
              private readonly fb: FormBuilder,
              private readonly validatorsUtils: ValidatorsUtils,
              private readonly linkedCasesService: LinkedCasesService) {}

  ngOnInit(): void {
    this.casesService.getCaseLinkResponses().toPromise()
      .then(reasons => {
        this.linkCaseReasons = reasons;
        this.initForm();
      })
      .catch((error: HttpError) => {
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
    this.validationErrors = [];
    this.caseReasonError = null;
    this.caseNumberError = null;
    if (this.linkCaseForm.valid) {
      this.casesService.getCaseViewV2(this.linkCaseForm.value.caseNumber).toPromise()
        .then((caseView: CaseView) => {
          let caseInfo: LinkedCase = {} as LinkedCase;
          caseInfo.caseLink = {
            caseReference: caseView.case_id,
            linkReason: this.getSelectedCaseReasons(),
            createdDateTime: new Date().toISOString(),
            caseType: caseView.case_type.name,
            caseState: caseView.state.name,
            caseService: '',
            caseName: '',
          }
          this.selectedCases.push(caseInfo);
        })
        .catch((error: HttpError) => {
          this.caseNumberError = LinkedCaseProposalEnum.CaseCheckAgainError;
          this.validationErrors.push({ id: 'caseNumber', message: LinkedCaseProposalEnum.CaseCheckAgainError });
          return throwError(error);
        });
    } else {
      if (this.linkCaseForm.controls.caseNumber.invalid) {
        this.caseNumberError = LinkedCaseProposalEnum.CaseNumberError;
        this.validationErrors.push({ id: 'caseNumber', message: LinkedCaseProposalEnum.CaseNumberError });
      }
      if (this.linkCaseForm.controls.reasonType.invalid) {
        this.caseReasonError = LinkedCaseProposalEnum.ReasonSelectionError;
        this.validationErrors.push({ id: 'caseReason', message: LinkedCaseProposalEnum.ReasonSelectionError });
      }
    }
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
    if (this.selectedCases.length) {
      this.linkedCasesService.linkedCases = this.selectedCases;
      // Return linked cases state and error messages to the parent
      this.linkedCasesStateEmitter.emit({ currentLinkedCasesPage: LinkedCasesPages.LINK_CASE, errorMessages: this.errorMessages });
    } else {
      this.noSelectedCaseError = LinkedCaseProposalEnum.CaseSelectionError;
      this.validationErrors.push({ id: 'caseReason', message: LinkedCaseProposalEnum.CaseSelectionError });
    }
  }
}
