import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, throwError } from 'rxjs';
import { CaseView, ErrorMessage, HttpError } from '../../../../../domain';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesState } from '../../domain';
import {
  CaseLink,
  ESQueryType,
  LinkCaseReason,
  LinkReason,
} from '../../domain/linked-cases.model';
import { LinkedCasesErrorMessages, LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { ValidatorsUtils } from '../../utils/validators.utils';

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

  constructor(
    private casesService: CasesService,
    private readonly fb: FormBuilder,
    private readonly validatorsUtils: ValidatorsUtils,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getAllLinkedCaseInformation();
    this.initForm();
    if (this.linkedCasesService.editMode) {
      this.selectedCases = this.linkedCasesService.linkedCases;
    }
  }

  public initForm() {
    this.linkCaseForm = this.fb.group({
      caseNumber: ['', this.validatorsUtils.numberLengthValidator(16)],
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

  public submitCaseInfo() {
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

  isCaseSelected(linkedCases: CaseLink[]): boolean {
    if (linkedCases.length === 0) {
      return false;
    }
    const caseNumber = this.linkCaseForm.value.caseNumber;
    return !!linkedCases.find(
      (caseLink) => caseLink.caseReference === caseNumber
    );
  }

  isCaseSelectedSameAsCurrentCase(): boolean {
    return this.linkCaseForm.value.caseNumber === this.linkedCasesService.caseId
  }

  showErrorInfo() {
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
    if (this.linkCaseForm.value.caseNumber === this.linkedCasesService.caseId) {
      this.errorMessages.push({
        title: 'dummy-case-number',
        description: LinkedCasesErrorMessages.ProposedCaseWithIn,
        fieldId: 'caseNumber',
      });
    }
    window.scrollTo(0, 0);
    this.emitLinkedCasesState(false);
  }

  getCaseInfo() {
    this.casesService
      .getCaseViewV2(this.linkCaseForm.value.caseNumber)
      .subscribe(
        (caseView: CaseView) => {
          const caseLink: CaseLink = {
            caseReference: caseView.case_id,
            reasons: this.getSelectedCaseReasons(),
            createdDateTime: new Date().toISOString(),
            caseType: caseView.case_type.name,
            caseState: caseView.state.name,
            caseService: caseView.case_type.jurisdiction.name,
            caseName: caseView.metadataFields && caseView.metadataFields['caseNameHmctsInternal'] ||  'Case name missing',
          };
          const ccdApiCaseLinkData = {
            CaseReference: caseView.case_id,
            CaseType: caseView.case_type.name,
            CreatedDateTime: new Date().toISOString(),
            ReasonForLink: this.getSelectedCCDTypeCaseReason()
          }
          this.linkedCasesService.caseFieldValue.push({id: '', value: ccdApiCaseLinkData});
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

  public groupByCaseType = (arrObj, key) => {
    if (!arrObj) {
      return
    }
    return arrObj.reduce((rv, x) => {
      (rv[x.value[key]] = rv[x.value[key]] || []).push(x.value['CaseReference']);
      return rv;
    }, {});
  };

  public mapResponse(esSearchCasesResponse, selectedCase) {
    const mappedValue = {...selectedCase,
      caseName: esSearchCasesResponse.case_fields && esSearchCasesResponse.case_fields.caseNameHmctsInternal ||  'Case name missing',
      caseReference : esSearchCasesResponse.case_id,
      caseType : esSearchCasesResponse.case_fields['[CASE_TYPE]'],
      caseService : esSearchCasesResponse.case_fields['[JURISDICTION]'],
      caseState : esSearchCasesResponse.case_fields['[STATE]'],
      reasons: this.mapReason(selectedCase)
    }
    return mappedValue;
  }

  public mapReason(selectedCase) {
    const reasons = selectedCase.value && selectedCase.value.ReasonForLink &&
    selectedCase.value.ReasonForLink.map(reason => reason.value && {
      reasonCode: reason.value.Reason
    } as LinkReason)
    return reasons;
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }
  /**
   * TODO: Get all Linked cases information
   * Gets all case information
   */
  public getAllLinkedCaseInformation() {
    const linkedCaseIds = this.groupByCaseType(this.selectedCases, 'CaseType');
    const searchCasesResponse = [];
    Object.keys(linkedCaseIds).forEach((id) => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[id], 100);
      const query = this.searchService.searchCasesByIds(
        id,
        esQuery,
        SearchService.VIEW_WORKBASKET
      );
      searchCasesResponse.push(query);
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe(
        (searchCases: any) => {
          let updatedSelectedCases = [];
          this.linkedCasesService.preLinkedCases = [];
          searchCases.forEach((response) => {
            response.results.forEach((result: any) => {
              let caseInfo = this.selectedCases.find(element => element.caseReference = result.case_id);
              if (caseInfo) {
                updatedSelectedCases.push(this.mapResponse(result, caseInfo));
              }
            });
          });
          this.selectedCases = updatedSelectedCases;
        }
      );
    }
  }

  public constructElasticSearchQuery(
    caseIds: any[],
    size: number
  ): ESQueryType {
    return {
      query: {
        terms: {
          reference: caseIds,
        },
      },
      size,
    };
  }

  // Return linked cases state and error messages to the parent
  emitLinkedCasesState(isNavigateToNextPage: boolean) {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: isNavigateToNextPage,
    });
  }

  getSelectedCaseReasons(): LinkReason[] {
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

  getSelectedCCDTypeCaseReason(): LinkReason[] {
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
