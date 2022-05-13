import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LinkedCase, LinkedCasesState } from '../../domain';
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

  public linkedCases: LinkedCase[];

  constructor(private linkedCasesService: LinkedCasesService) {}

  public ngOnInit(): void {
    this.linkedCases = this.linkedCasesService.linkedCases;
  }

  public onChange(): void {
    this.linkedCasesStateEmitter.emit({ currentLinkedCasesPage: LinkedCasesPages.CHECK_YOUR_ANSWERS, navigateToPreviousPage: true });
  }
}
