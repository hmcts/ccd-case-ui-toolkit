import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CaseLink, LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-linked-cases-check-your-answers',
  templateUrl: './check-your-answers.component.html',
  styleUrls: ['./check-your-answers.component.scss']
})
export class CheckYourAnswersComponent implements OnInit {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public linkedCases: CaseLink[];
  public casesToUnlink: CaseLink[];
  public isLinkCasesJourney: boolean;
  public linkedCasesTableCaption: string;

  constructor(private linkedCasesService: LinkedCasesService) {
  }

  public ngOnInit(): void {
    this.isLinkCasesJourney = this.linkedCasesService.isLinkedCasesEventTrigger;
    this.linkedCasesTableCaption = this.linkedCasesService.isLinkedCasesEventTrigger ? 'Proposed case links' : 'Linked cases';
    this.linkedCases = this.linkedCasesService.linkedCases.filter(linkedCase => !linkedCase.unlink);
    this.casesToUnlink = this.linkedCasesService.linkedCases.filter(linkedCase => linkedCase.unlink && linkedCase.unlink === true);

		console.log('CASES TO UNLINK', this.casesToUnlink);
		console.log('LINKED CASES', this.linkedCases);
  }

  public onChange(): void {
    this.linkedCasesService.editMode = true;
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS,
      navigateToPreviousPage: true,
      navigateToNextPage: true
    });
  }
}
