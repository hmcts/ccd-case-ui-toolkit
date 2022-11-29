import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CaseView, ErrorMessage } from '../../../../../domain';
import { CaseEditComponent } from '../../../../case-editor/case-edit';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink, LinkedCasesState } from '../../domain';
import { LinkedCasesErrorMessages, LinkedCasesPages } from '../../enums/write-linked-cases-field.enum';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-unlink-cases',
  templateUrl: './unlink-cases.component.html'
})
export class UnLinkCasesComponent implements OnInit {

  private static readonly LINKED_CASES_TAB_ID = 'linked_cases_sscs';
  private static readonly CASE_NAME_MISSING_TEXT = 'Case name missing';

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public unlinkCaseForm: FormGroup;
  public caseId: string;
  public linkedCases: CaseLink[] = [];
  public errorMessages: ErrorMessage[] = [];
  public unlinkErrorMessage: string;

  constructor(private caseEdit: CaseEditComponent,
    private readonly fb: FormBuilder,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService) {
  }

  public ngOnInit(): void {
    this.getLinkedCases();
  }

  public getLinkedCases(): void {
    this.caseId = this.linkedCasesService.caseId;
    if (this.linkedCasesService.linkedCases.length > 0) {
      this.linkedCases = this.linkedCasesService.linkedCases;
      this.initForm();
    } else {
      this.casesService.getCaseViewV2(this.caseId).subscribe((caseView: CaseView) => {
        const linkedCasesTab = caseView.tabs.find(tab => tab.id === UnLinkCasesComponent.LINKED_CASES_TAB_ID);
        if (linkedCasesTab) {
          const linkedCases: CaseLink[] = linkedCasesTab.fields[0].value;
          this.linkedCases = linkedCases;
          this.linkedCasesService.linkedCases = linkedCases;
          this.initForm();
        }
      });
    }
  }

  public initForm(): void {
    this.unlinkCaseForm = this.fb.group({
      linkedCases: this.getLinkedCasesFormArray
    });
  }

  public get getLinkedCasesFormArray(): FormArray   {
    const formFieldArray = this.linkedCases.map(val => this.fb.group({
      caseReference: val.caseReference,
      reasons: val.reasons,
      createdDateTime: val.createdDateTime,
      caseType: val.caseType,
      caseState: val.caseState,
      caseService: val.caseService,
      caseName: val.caseName || UnLinkCasesComponent.CASE_NAME_MISSING_TEXT,
      unlink: val.unlink
    }));
    return this.fb.array(formFieldArray);
  }

  public onChange(caseSelected: any): void {
    this.resetErrorMessages();
    const selectedCase = this.linkedCases.find(linkedCase => linkedCase.caseReference === caseSelected.value);
    if (selectedCase) {
      selectedCase.unlink = caseSelected.checked ? true : false;
    }
  }

  public onNext(): void {
    this.resetErrorMessages();
    let navigateToNextPage = true;
    const casesMarkedToUnlink = this.linkedCases.find(linkedCase => linkedCase.unlink && linkedCase.unlink === true);
    if (!casesMarkedToUnlink) {
      this.errorMessages.push({
        title: 'case-selection',
        description: LinkedCasesErrorMessages.UnlinkCaseSelectionError,
        fieldId: `case-reference-${this.linkedCases[0].caseReference}`
      });
      this.unlinkErrorMessage = LinkedCasesErrorMessages.UnlinkCaseSelectionError;
      navigateToNextPage = false;
    }
    const unlinkedCaseRefereneIds = this.linkedCasesService.linkedCases.filter(item => item.unlink).map(item => item.caseReference);
    const updatedLinkedCases = this.linkedCasesService.caseFieldValue.filter
                              (item => unlinkedCaseRefereneIds.indexOf(item.value.CaseReference) === -1);
    (this.caseEdit.form.controls['data'] as any) =  new FormGroup({caseLinks: new FormControl(updatedLinkedCases || [])});
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.UNLINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: navigateToNextPage
    });
  }

  public resetErrorMessages(): void {
    this.errorMessages = [];
    this.unlinkErrorMessage = null;
  }
}
