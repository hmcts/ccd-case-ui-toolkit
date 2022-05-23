import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CaseView, ErrorMessage } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesState, UnlinkedCase } from '../../domain';
import { LinkedCasesPages } from '../../enums/write-linked-cases-field.enum';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-unlink-cases',
  templateUrl: './unlink-cases.component.html'
})
export class UnLinkCasesComponent implements OnInit {

  private static readonly LINKED_CASES_TAB_ID = 'linked_cases_sscs';

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public unlinkCaseForm: FormGroup;
  public caseId: string;
  public casesToUnlink: UnlinkedCase[] = [];
  public errorMessages: ErrorMessage[] = [];

  constructor(private readonly fb: FormBuilder,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService) {
  }

  public ngOnInit(): void {
    this.getLinkedCases();
  }

  // TODO Display case name instead of case type
  public getLinkedCases(): void {
    this.caseId = this.linkedCasesService.caseId;
    this.casesService.getCaseViewV2(this.caseId).subscribe((caseView: CaseView) => {
      const linkedCasesTab = caseView.tabs.find(tab => tab.id === UnLinkCasesComponent.LINKED_CASES_TAB_ID);
      if (linkedCasesTab) {
        const linkedCases = linkedCasesTab.fields[0].value;
        linkedCases.forEach(linkedCase => {
          this.casesToUnlink.push({
            caseReference: linkedCase.caseReference,
            caseName: linkedCase.caseType,
          });
        });
        this.initForm();
      }
    });
  }

  public initForm(): void {
    this.unlinkCaseForm = this.fb.group({
      linkedCases: this.getLinkedCasesFormArray
    });
  }

  public get getLinkedCasesFormArray(): FormArray {
    return this.fb.array(this.casesToUnlink.map(val => this.fb.group({
      caseReference: val.caseReference,
      caseName: val.caseName
    })));
  }

  public onNext(): void {
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.UNLINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: true
    });
  }
}
