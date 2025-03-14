import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CaseLink, LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { AbstractJourneyComponent } from '../../../base-field';
import { MultipageComponentStateService } from '../../../../../services';
import { Journey } from '../../../../../domain';

@Component({
  selector: 'ccd-linked-cases-check-your-answers',
  templateUrl: './check-your-answers.component.html',
  styleUrls: ['./check-your-answers.component.scss']
})
export class CheckYourAnswersComponent extends AbstractJourneyComponent implements OnInit, Journey {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public linkedCases: CaseLink[];
  public casesToUnlink: CaseLink[];
  public isLinkCasesJourney: boolean;
  public linkedCasesTableCaption: string;

  constructor(private readonly linkedCasesService: LinkedCasesService, multipageComponentStateService: MultipageComponentStateService) {
    super(multipageComponentStateService);
  }

  public ngOnInit(): void {
    this.ensureDataIntegrity();
    this.isLinkCasesJourney = this.linkedCasesService.isLinkedCasesEventTrigger;
    this.linkedCasesTableCaption = this.linkedCasesService.isLinkedCasesEventTrigger ? 'Proposed case links' : 'Linked cases';
    this.linkedCases = this.linkedCasesService.linkedCases.filter(linkedCase => !linkedCase.unlink);
    this.casesToUnlink = this.linkedCasesService.linkedCases.filter(linkedCase => linkedCase.unlink && linkedCase.unlink === true);
  }

  public ensureDataIntegrity(){
    for (const link in this.linkedCasesService.casesToUnlink){
      this.linkedCasesService.linkedCases?.forEach((linkedCase) => {
        if (linkedCase?.caseReference === this.linkedCasesService.casesToUnlink[link]){
          linkedCase.unlink = true;
        }
      });
    }
  }

  public onChange(): void {
    this.linkedCasesService.editMode = true;
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS,
      navigateToPreviousPage: true,
      navigateToNextPage: true
    });
  }

  public next() {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS,
      navigateToPreviousPage: false,
      navigateToNextPage: true
    });

    super.next();
  }
}
