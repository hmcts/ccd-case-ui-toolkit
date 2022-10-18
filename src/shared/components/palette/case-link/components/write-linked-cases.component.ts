import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractAppConfig } from '../../../../../app.config';
import { CaseField, ErrorMessage } from '../../../../domain';
import { CaseView } from '../../../../domain/case-view';
import { CommonDataService } from '../../../../services/common-data-service/common-data-service';
import { CaseEditPageComponent } from '../../../case-editor/case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../../../case-editor/case-edit/case-edit.component';
import { CasesService } from '../../../case-editor/services/cases.service';
import { AbstractFieldWriteComponent } from '../../base-field';
import { CaseLink, LinkedCasesState } from '../domain';
import { LinkedCasesErrorMessages, LinkedCasesEventTriggers, LinkedCasesPages } from '../enums';
import { LinkedCasesService } from '../services';

@Component({
  selector: 'ccd-write-linked-cases',
  templateUrl: './write-linked-cases.component.html'
})
export class WriteLinkedCasesComponent extends AbstractFieldWriteComponent implements OnInit, AfterViewInit {

  @Input()
  caseFields: CaseField[];

  @Input()
  caseField: CaseField;

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  @Output()
  public onLinkedCasesSelected = new EventEmitter<any>();
  @Input()
  public isLinkedCasesJourney = false;

  @Input()
  formGroup: FormGroup;

  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public linkedCases: CaseLink[] = [];
  public errorMessages: ErrorMessage[] = [];

  constructor(private caseEdit: CaseEditComponent,
    private readonly appConfig: AbstractAppConfig,
    private commonDataService: CommonDataService,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService) {
    super();
  }

  public ngOnInit(): void {
      this.linkedCasesService.caseId = this.caseEdit.caseDetails.case_id;
      this.linkedCasesService.caseDetails = this.caseEdit.caseDetails;
      this.linkedCasesService.editMode = false;
      const reasonCodeAPIurl = this.appConfig.getRDCommonDataApiUrl() + '/lov/categories/CaseLinkingReasonCode';
      this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
        next: reasons => {
          this.linkedCasesService.linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);
        }
      })
      this.getLinkedCases();
      this.linkedCasesService.isCreateCaseLinkEventTrigger = this.isCreateCaseLinkEvent();
  }

  public isCreateCaseLinkEvent() {
    const createEventCaseFields = this.caseEditPageComponent.eventTrigger.case_fields &&
                                    this.caseEditPageComponent.eventTrigger.case_fields.filter
            (field => field.display_context_parameter &&
                    field.display_context_parameter.includes(this.linkedCasesService.createCaseLinkDisplayContext));
    return createEventCaseFields && createEventCaseFields.length ? true : false;
  }

  public ngAfterViewInit(): void {
    let labelField = document.getElementsByClassName('govuk-heading-l');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
    labelField = document.getElementsByClassName('heading-h2');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    this.errorMessages = [];
    this.caseEditPageComponent.validationErrors = [];

    if (linkedCasesState.navigateToNextPage) {
      this.linkedCasesPage = this.getNextPage(linkedCasesState);
      this.setContinueButtonValidationErrorMessage();
      this.proceedToNextPage();
    } else {
      if (linkedCasesState.errorMessages && linkedCasesState.errorMessages.length) {
        linkedCasesState.errorMessages.forEach((errorMessage, index) => {
          this.caseEditPageComponent.validationErrors.push({ id: errorMessage.fieldId, message: errorMessage.description});
        });
      }
    }
  }

  public isAtFinalState(): boolean {
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public setContinueButtonValidationErrorMessage(): void {
    const errorMessage = this.linkedCasesService.isCreateCaseLinkEventTrigger
        ? LinkedCasesErrorMessages.LinkCasesNavigationError
        : LinkedCasesErrorMessages.UnlinkCasesNavigationError;

    const buttonId = this.linkedCasesService.linkedCases.length === 0
      ? 'back-button'
      : 'next-button';

    this.caseEditPageComponent.caseLinkError = {
      componentId: buttonId,
      errorMessage: errorMessage
    };
  }

  public proceedToNextPage(): void {
    if (this.isAtFinalPage()) {
      // Continue button event must be allowed in final page
      this.caseEditPageComponent.caseLinkError = null;
      // Trigger validation to clear the "notAtFinalPage" error if now at the final state
      this.formGroup.updateValueAndValidity();
      // update form value
      this.onLinkedCasesSelected.emit();
      (this.caseEdit.form.controls['data'] as any) =  new FormGroup({caseLinks: new FormControl(this.linkedCasesService.caseFieldValue)});
    }
  }

  public isAtFinalPage(): boolean {
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getNextPage(linkedCasesState: LinkedCasesState): number {
    if ((this.linkedCasesPage === LinkedCasesPages.BEFORE_YOU_START) ||
        (linkedCasesState.currentLinkedCasesPage === LinkedCasesPages.CHECK_YOUR_ANSWERS && linkedCasesState.navigateToPreviousPage)) {
          return this.isLinkedCasesJourney
            ? LinkedCasesPages.LINK_CASE
            : LinkedCasesPages.UNLINK_CASE;
    }
    return LinkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getLinkedCases(): void {
    this.casesService.getCaseViewV2(this.linkedCasesService.caseId).subscribe((caseView: CaseView) => {
      let caseViewFiltered = caseView.tabs.filter(val => {
        let linkField = val.fields.some(({field_type}) => field_type.collection_field_type && field_type.collection_field_type.id === 'CaseLink')
        return linkField
      })
      if (caseViewFiltered) {
        const caseLinkFieldValue = caseViewFiltered.map(filtered => filtered.fields.length && filtered.fields[0].value)
        this.linkedCasesService.caseFieldValue = caseLinkFieldValue.length ? caseLinkFieldValue[0] : [];
        this.linkedCasesService.getAllLinkedCaseInformation();
      }
        // Initialise the first page to display
        this.linkedCasesPage = this.linkedCasesService.isCreateCaseLinkEventTrigger ||
                          (this.linkedCasesService.caseFieldValue && this.linkedCasesService.caseFieldValue.length > 0
                            && !this.linkedCasesService.serverLinkedApiError)
          ? LinkedCasesPages.BEFORE_YOU_START
          : LinkedCasesPages.NO_LINKED_CASES;
        // Initialise the error to be displayed when clicked on Continue button
        this.setContinueButtonValidationErrorMessage();
    });
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }
}
