import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CaseView, ErrorMessage } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCase, LinkedCasesState } from '../../domain';
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
  public linkedCases: string[] = [];
  public casesToUnlink: string[] = [];
  public errorMessages: ErrorMessage[] = [];

  constructor(private readonly fb: FormBuilder,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService) {
  }

  public ngOnInit(): void {
    this.getLinkedCases();
  }

  public getLinkedCases(): void {
    this.caseId = this.linkedCasesService.caseId;
    this.casesService.getCaseViewV2(this.caseId).subscribe((caseView: CaseView) => {
      const linkedCasesTab = caseView.tabs.find(tab => tab.id === UnLinkCasesComponent.LINKED_CASES_TAB_ID);
      if (linkedCasesTab) {
				console.log('LINKED CASES TAB', linkedCasesTab);
        const linkedCases: LinkedCase[] = linkedCasesTab.fields[0].value;
				console.log('LINKED CASES', linkedCases);
        linkedCases.forEach(linkedCase => {
          this.linkedCases.push(linkedCase.caseReference);
        });
				this.linkedCasesService.linkedCases = linkedCases;
				console.log('LINKED CASES FROM SERVICE', this.linkedCasesService.linkedCases);
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
    return this.fb.array(this.linkedCases.map(val => this.fb.group({
      caseReference: val
    })));
  }

  public onChange(caseSelected: any): void {
		if (caseSelected.checked) {
			this.casesToUnlink.push(caseSelected.value);
		} else {
			const caseToRemove = this.casesToUnlink.indexOf(caseSelected.value);
			if (caseToRemove > -1) {
				this.casesToUnlink.splice(caseToRemove, 1);
			}
		}
		this.linkedCasesService.casesToUnlink = this.casesToUnlink;
  }

  public onNext(): void {
		console.log('LINKED CASES SERVICE LINKED CASES', this.linkedCasesService.linkedCases);
		console.log('LINKED CASES SERVICE CASES TO UNLINK', this.linkedCasesService.casesToUnlink);
		const linkedCases: LinkedCase[] = this.linkedCasesService.linkedCases;
		this.casesToUnlink.forEach(caseReference => {
			const caseToRemove = linkedCases.findIndex(linkedCase => linkedCase.caseLink && linkedCase.caseLink.caseReference === caseReference);
			if (caseToRemove > -1) {
				linkedCases.splice(caseToRemove, 1);
			}
		});
		this.linkedCasesService.linkedCases = linkedCases;
		console.log('LINKED CASES SERVICE CASES TO UNLINK', this.linkedCasesService.linkedCases);
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.UNLINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: true
    });
  }
}
