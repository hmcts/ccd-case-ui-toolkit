import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  constructor(private readonly router: Router,
    private readonly linkedCasesService: LinkedCasesService) {
  }

  public onNext(): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    });
  }
}
