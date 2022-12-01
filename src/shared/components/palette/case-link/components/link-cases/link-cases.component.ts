import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';
import { CaseView, ErrorMessage, HttpError } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesState } from '../../domain';
import {
  CaseLink,
  CCDCaseLinkType,
  LinkCaseReason,
  LinkReason,
} from '../../domain/linked-cases.model';
import { LinkedCasesErrorMessages, LinkedCasesPages, Patterns } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { ValidatorsUtils } from '../../utils/validators.utils';
import moment = require('moment');

@Component({
  selector: 'ccd-link-cases',
  styleUrls: ['./link-cases.component.scss'],
  templateUrl: './link-cases.component.html',
})
export class LinkCasesComponent implements OnInit {
  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public errorMessages: ErrorMessage[] = [];
  public linkCaseForm: FormGroup;
  public selectedCases: CaseLink[] = [];
  public caseNumberError: string;
  public caseReasonError: string;
  public caseSelectionError: string;
  public noSelectedCaseError: string;
  private ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS';

  constructor(
    private casesService: CasesService,
    private readonly fb: FormBuilder,
    private readonly validatorsUtils: ValidatorsUtils,
    public readonly linkedCasesService: LinkedCasesService) { }

  public ngOnInit(): void {
    this.initForm();
    if (this.linkedCasesService.editMode) {
      // this may have includes the currently added one but yet to be submitted.
      this.selectedCases = this.linkedCasesService.linkedCases;
    } else if (this.linkedCasesService.initialCaseLinks.length !== this.linkedCasesService.caseFieldValue.length) {
      this.linkedCasesService.linkedCases = this.linkedCasesService.initialCaseLinks;
    }
  }

  public initForm(): void {
    this.linkCaseForm = this.fb.group({
      caseNumber: ['', [Validators.minLength(16), this.validatorsUtils.regexPattern(Patterns.CASE_REF)]],
      reasonType: this.getReasonTypeFormArray,
    });
  }

  public get getReasonTypeFormArray(): FormArray {
    return this.fb.array(
      this.linkedCasesService.linkCaseReasons.map((val) =>
        this.fb.group({
          key: [val.key],
          value_en: [val.value_en],
          value_cy: [val.value_cy],
          hint_text_en: [val.hint_text_en],
          hint_text_cy: [val.hint_text_cy],
          lov_order: [val.lov_order],
          parent_key: [val.parent_key],
          selected: [!!val.selected],
        })
      ),
      this.validatorsUtils.formArraySelectedValidator()
    );
  }

  public submitCaseInfo(): void {
    this.errorMessages = [];
    this.caseReasonError = null;
    this.caseNumberError = null;
    this.caseSelectionError = null;
    this.noSelectedCaseError = null;
    if (
      this.linkCaseForm.valid &&
      !this.isCaseSelected(this.selectedCases) &&
      !this.isCaseSelected(this.linkedCasesService.linkedCases) &&
      !this.isCaseSelectedSameAsCurrentCase()
    ) {
      this.getCaseInfo();
    } else {
      this.showErrorInfo();
    }
  }

  public isCaseSelected(linkedCases: CaseLink[]): boolean {
    if (linkedCases.length === 0) {
      return false;
    }
    const caseNumber = this.linkCaseForm.value.caseNumber;
    return !!linkedCases.find(
      (caseLink) => caseLink.caseReference === caseNumber
    );
  }

  private isCaseSelectedSameAsCurrentCase(): boolean {
    return this.linkCaseForm.value.caseNumber.split('-').join('') === this.linkedCasesService.caseId.split('-').join('');
  }

  public showErrorInfo(): void {
    if (this.linkCaseForm.controls.caseNumber.invalid) {
      this.caseNumberError = LinkedCasesErrorMessages.CaseNumberError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.CaseNumberError,
        fieldId: 'caseNumber',
      });
    }
    if (this.linkCaseForm.controls.reasonType.invalid) {
      this.caseReasonError = LinkedCasesErrorMessages.ReasonSelectionError;
      this.errorMessages.push({
        title: 'dummy-case-reason',
        description: LinkedCasesErrorMessages.ReasonSelectionError,
        fieldId: 'caseReason',
      });
    }
    if (this.isCaseSelected(this.selectedCases)) {
      this.caseSelectionError = LinkedCasesErrorMessages.CaseProposedError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.CaseProposedError,
        fieldId: 'caseNumber',
      });
    }
    if (this.isCaseSelected(this.linkedCasesService.linkedCases)) {
      this.caseSelectionError = LinkedCasesErrorMessages.CasesLinkedError;
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.CasesLinkedError,
        fieldId: 'caseNumber',
      });
    }
    if (this.isCaseSelectedSameAsCurrentCase()) {
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.ProposedCaseWithIn,
        fieldId: 'caseNumber',
      });
    }
    window.scrollTo(0, 0);
    this.emitLinkedCasesState(false);
  }

  public getCaseInfo(): void {
    const caseNumberData = this.linkCaseForm.value.caseNumber.replace(/[- ]/g, '');
    this.casesService
      .getCaseViewV2(caseNumberData)
      .subscribe(
        (caseView: CaseView) => {
          this.linkedCasesService.caseDetails = caseView;
          const caseLink: CaseLink = {
            caseReference: caseView.case_id,
            reasons: this.getSelectedCaseReasons(),
            createdDateTime: moment(new Date()).format(this.ISO_FORMAT),
            caseType: this.linkedCasesService.mapLookupIDToValueFromJurisdictions('CASE_TYPE', caseView.case_type.id),
            caseState: this.linkedCasesService.mapLookupIDToValueFromJurisdictions('STATE', caseView.state.name),
            caseService: this.linkedCasesService.mapLookupIDToValueFromJurisdictions('JURISDICTION', caseView.case_type.jurisdiction.name),
            caseName: this.linkedCasesService.getCaseName(caseView),
          };
          const ccdApiCaseLinkData: CCDCaseLinkType = {
            CaseReference: caseView.case_id,
            CaseType: caseView.case_type.id,
            CreatedDateTime: moment(new Date()).format(this.ISO_FORMAT),
            ReasonForLink: this.getSelectedCCDTypeCaseReason()
          }
          if (!this.linkedCasesService.caseFieldValue) {
            this.linkedCasesService.caseFieldValue = [];
          }
          this.linkedCasesService.caseFieldValue.push({ id: caseView.case_id.toString(), value: ccdApiCaseLinkData });
          this.selectedCases.push(caseLink);
          this.initForm();
          this.emitLinkedCasesState(false);
        },
        (error: HttpError) => {
          this.caseNumberError = LinkedCasesErrorMessages.CaseCheckAgainError;
          this.errorMessages.push({
            title: 'dummy-case-number',
            description: LinkedCasesErrorMessages.CaseCheckAgainError,
            fieldId: 'caseNumber',
          });
          this.emitLinkedCasesState(false);
          window.scrollTo(0, 0);
          return throwError(error);
        }
      );
  }

  // Return linked cases state and error messages to the parent
  public emitLinkedCasesState(isNavigateToNextPage: boolean): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: isNavigateToNextPage,
    });
  }

  public getSelectedCaseReasons(): LinkReason[] {
    let selectedReasons = [];
    this.linkCaseForm.controls.reasonType.value.forEach(
      (selectedReason: LinkCaseReason) => {
        if (selectedReason.selected) {
          selectedReasons.push({
            reasonCode: selectedReason.key
          } as LinkReason);
        }
      }
    );
    return selectedReasons;
  }

  public getSelectedCCDTypeCaseReason(): LinkReason[] {
    let selectedReasons = [];
    this.linkCaseForm.controls.reasonType.value.forEach(
      (selectedReason: LinkCaseReason) => {
        if (selectedReason.selected) {
          selectedReasons.push({
            value: {
              Reason: selectedReason.key,
            }
          });
        }
      }
    );
    return selectedReasons;
  }

  public onSelectedLinkedCaseRemove(pos, selectedCaseReference): void {
    const caseFieldValue = this.linkedCasesService.caseFieldValue || [];
    const updatedItems = caseFieldValue.filter(item => item.value && item.value.CaseReference !== selectedCaseReference);
    if (updatedItems) {
      this.linkedCasesService.caseFieldValue = updatedItems;
    }
    this.selectedCases.splice(pos, 1);
  }

  public onNext(): void {
    this.errorMessages = [];
    this.caseReasonError = null;
    this.caseNumberError = null;
    this.caseSelectionError = null;
    this.noSelectedCaseError = null;
    let navigateToNextPage = true;
    if (this.selectedCases.length) {
      this.linkedCasesService.linkedCases = this.selectedCases;
    } else {
      this.noSelectedCaseError = LinkedCasesErrorMessages.CaseSelectionError;
      this.errorMessages.push({
        title: 'dummy-case-selection',
        description: LinkedCasesErrorMessages.CaseSelectionError,
        fieldId: 'caseReason',
      });
      navigateToNextPage = false;
    }
    this.emitLinkedCasesState(navigateToNextPage);
  }
}
