import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { CaseView, ErrorMessage, Journey } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink, LinkedCasesState } from '../../domain';
import { LinkedCasesErrorMessages, LinkedCasesPages } from '../../enums/write-linked-cases-field.enum';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { AbstractFieldWriteJourneyComponent } from '../../../base-field';
import { MultipageComponentStateService } from '../../../../../services';

@Component({
  selector: 'ccd-unlink-cases',
  templateUrl: './unlink-cases.component.html'
})
export class UnLinkCasesComponent extends AbstractFieldWriteJourneyComponent implements OnInit, Journey {

  private static readonly LINKED_CASES_TAB_ID = 'linked_cases_sscs';
  private static readonly CASE_NAME_MISSING_TEXT = 'Case name missing';
  private static readonly LINKED_CASES_TAB_ID_2 = 'caseLinksTab';

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);

  public unlinkCaseForm: FormGroup;
  public caseId: string;
  public linkedCases: CaseLink[] = [];
  public errorMessages: ErrorMessage[] = [];
  public unlinkErrorMessage: string;
  public isLoaded: boolean;
  public isServerError = false;

  constructor(private readonly fb: FormBuilder,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService,
    multipageComponentStateService: MultipageComponentStateService) {
      super(multipageComponentStateService);
  }

  public ngOnInit(): void {
    this.getLinkedCases();
    // the journey can become broken in some  situations as the journeyPageNumber is not correct, account for this and set to the correct value
    const journeyPageNumber = this.getJourneyCollection()['journeyPageNumber'];
    const linkedCasesPageNumber = this.getJourneyCollection()['linkedCasesPage'];
    if (linkedCasesPageNumber < journeyPageNumber) {
      this.getJourneyCollection()['journeyPageNumber'] = linkedCasesPageNumber;
    }
  }

  public getJourneyCollection(): Journey {
    return this.multipageComponentStateService.getJourneyCollection()[0];
  }

  public getLinkedCases(): void {
    this.caseId = this.linkedCasesService.caseId;
    if (this.linkedCasesService.cachedFieldValues && this.linkedCasesService.linkedCases) {
      this.linkedCasesService.caseFieldValue = this.linkedCasesService.cachedFieldValues;
    }
    if (this.linkedCasesService.linkedCases.length > 0) {
      this.linkedCases = this.linkedCasesService.linkedCases;
      this.getAllLinkedCaseInformation();
    } else {
      this.casesService.getCaseViewV2(this.caseId).subscribe((caseView: CaseView) => {
        const linkedCasesTab = caseView.tabs.find((tab) => {
          return tab.id === UnLinkCasesComponent.LINKED_CASES_TAB_ID || tab.id === UnLinkCasesComponent.LINKED_CASES_TAB_ID_2;
        });
        if (linkedCasesTab) {
          const linkedCases: CaseLink[] = linkedCasesTab.fields[0].value;
          this.linkedCases = linkedCases;
          this.linkedCasesService.linkedCases = linkedCases;
          this.getAllLinkedCaseInformation();
        }
      });
    }
  }

  public getLinkedCaseId(linkedCase): string {
    // challenged access doesnt return props in the same format, account for this
    return linkedCase.caseReference ? linkedCase.caseReference : linkedCase['id'];
  }

  public getAllLinkedCaseInformation(): void {
    const searchCasesResponse = [];
    this.linkedCases.forEach((linkedCase) => {
      const caseRefToSearch = this.getLinkedCaseId(linkedCase);
      searchCasesResponse.push(this.casesService.getCaseViewV2(caseRefToSearch));
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
        searchCases.forEach((response: CaseView) => {
          const linkedCaseFromList = this.linkedCases.find((linkedCase) => {
            const caseRefToUse = this.getLinkedCaseId(linkedCase);
            if (this.linkedCasesService.casesToUnlink.indexOf(caseRefToUse) > -1) {
              linkedCase.unlink = true;
            }
            return caseRefToUse === response.case_id;
          });
          if (linkedCaseFromList) {
            const caseName = this.linkedCasesService.getCaseName(response);
            const linkedCase = this.linkedCases.find((linkedCase) => {
              const caseRefToUse = this.getLinkedCaseId(linkedCase);
              return caseRefToUse === response.case_id;
            });
            if (linkedCase) {
              linkedCase.caseName = caseName;
              linkedCase.caseReference = response.case_id;
            }
          }
        });
        this.initForm();
        this.linkedCasesService.linkedCases = this.linkedCases;
        this.isServerError = false;
      },
      err => {
        this.isServerError = true;
        this.notifyAPIFailure.emit(true);
      });
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]): Observable<unknown[]> {
    return forkJoin(searchCasesResponse);
  }

  public initForm(): void {
    this.unlinkCaseForm = this.fb.group({
      linkedCases: this.getLinkedCasesFormArray
    });
  }

  public get getLinkedCasesFormArray(): FormArray {
    const formFieldArray = this.linkedCases.map((val) => this.fb.group({
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
    const selectedCase = this.linkedCases.find((linkedCase) => linkedCase.caseReference === caseSelected.value);
    if (selectedCase) {
      selectedCase.unlink = caseSelected.checked ? true : false;
      caseSelected.checked ? this.linkedCasesService.casesToUnlink.push(selectedCase.caseReference) : this.linkedCasesService.casesToUnlink = this.linkedCasesService.casesToUnlink.filter((caseRef) => caseRef !== selectedCase.caseReference);
    }
  }

  public onNext(): void {
    this.resetErrorMessages();
    let navigateToNextPage = true;
    const casesMarkedToUnlink = this.linkedCases.find((linkedCase) => linkedCase.unlink && linkedCase.unlink === true);
    if (!casesMarkedToUnlink) {
      this.errorMessages.push({
        title: 'case-selection',
        description: LinkedCasesErrorMessages.UnlinkCaseSelectionError,
        fieldId: `case-reference-${this.linkedCases[0].caseReference}`
      });
      this.unlinkErrorMessage = LinkedCasesErrorMessages.UnlinkCaseSelectionError;
      navigateToNextPage = false;
    }
    // Return linked cases state and error messages to the parent
    this.emitLinkedCasesState(navigateToNextPage);
  }

  public next() {
    this.onNext();

    if (this.errorMessages.length === 0) {
      super.next();
    }
  }

  // Return linked cases state and error messages to the parent
  public emitLinkedCasesState(isNavigateToNextPage: boolean): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.UNLINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: isNavigateToNextPage
    });
  }

  public resetErrorMessages(): void {
    this.errorMessages = [];
    this.unlinkErrorMessage = null;
  }
}
