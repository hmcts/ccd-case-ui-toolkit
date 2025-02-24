import { Directive, Input, OnChanges, ViewChild } from '@angular/core';
import { AbstractFieldWriteComponent } from './abstract-field-write.component';
import { Journey } from '../../../domain';
import { MultipageComponentStateService } from '../../../services';

@Directive()
export abstract class AbstractFieldWriteJourneyComponent extends AbstractFieldWriteComponent implements OnChanges, Journey {
  public journeyStartPageNumber: number = 0;
  public journeyEndPageNumber: number = 0;
  public journeyPageNumber: number = 0;
  public journeyPreviousPageNumber: number = 0;

    @Input()
  public journeyId: string = 'journey';

    @ViewChild('journeyChild')
    public childJourney!: Journey;

    public constructor(protected readonly multipageComponentStateService: MultipageComponentStateService) {
      super();
      this.multipageComponentStateService.addTojourneyCollection(this);
      this.journeyPageNumber = this.journeyStartPageNumber;
    }

    public next(): void {
      if (!this.hasNext()) {
        return;
      }
      this.childJourney.next();
    }

    public previous(): void {
      if (!this.hasPrevious()) {
        return;
      }
      if (this.childJourney['cachedFlagType'] && this.childJourney['subJourneyIndex'] !== 0) {
        this.childJourney.previous();
      } else {
        this.previousPage();
      }
    }

    protected previousPage(): void {
      if (this.hasPrevious()) {
        if (!this.childJourney?.searchLanguageInterpreterHint) {
          this.journeyPageNumber--;
        }
        this.onPageChange();
      }
    }

    protected nextPage(): void {
      if (this.hasNext()) {
        if (!this.childJourney?.searchLanguageInterpreterHint) {
          this.journeyPageNumber++;
        }
        this.onPageChange();
      }
    }

    public ngOnInit(): void {
      this.journeyPageNumber = this.journeyStartPageNumber;
      const state = this.multipageComponentStateService.getJourneyState(this);
      if (state) {
        const { journeyPageNumber, journeyStartPageNumber, journeyEndPageNumber } = state;

        this.journeyPageNumber = journeyPageNumber;
        this.journeyStartPageNumber = journeyStartPageNumber;
        this.journeyEndPageNumber = journeyEndPageNumber;
      }
    }

    public ngOnDestroy(): void {
      this.multipageComponentStateService.setJourneyState(this);
    }

    public hasNext(): boolean { return this.journeyPageNumber < this.journeyEndPageNumber };

    public hasPrevious(): boolean { return this.journeyPageNumber > this.journeyStartPageNumber };

    public isFinished(): boolean { return this.journeyPageNumber === this.journeyEndPageNumber };

    public isStart(): boolean { return this.journeyPageNumber === this.journeyStartPageNumber };

    public getId(): string { return this.journeyId };

    public onPageChange(): void { /* To be implemented by some child classes. */ };
}
