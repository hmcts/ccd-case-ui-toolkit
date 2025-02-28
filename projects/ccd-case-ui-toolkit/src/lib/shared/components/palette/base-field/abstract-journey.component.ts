import { Directive, Input, ViewChild } from '@angular/core';
import { Journey } from '../../../domain';
import { MultipageComponentStateService } from '../../../services';

@Directive()
export abstract class AbstractJourneyComponent implements Journey {
  public journeyStartPageNumber: number = 0;
  public journeyEndPageNumber: number = 0;
  public journeyPageNumber: number = 0;
  public journeyPreviousPageNumber: number;

    @Input()
  public journeyId: string = 'journey';

    @ViewChild('journeyChild')
    public childJourney!: Journey;

    public constructor(protected readonly multipageComponentStateService: MultipageComponentStateService) {
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
      this.previousPage();
    }

    protected previousPage(): void {
      if (this.hasPrevious()) {
        this.journeyPageNumber--;
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

    public hasNext(): boolean {
      return this.journeyPageNumber < this.journeyEndPageNumber;
    }

    public hasPrevious(): boolean {
      return this.journeyPageNumber > this.journeyStartPageNumber;
    }

    public isFinished(): boolean {
      return this.journeyPageNumber === this.journeyEndPageNumber;
    }

    public isStart(): boolean {
      return this.journeyPageNumber === this.journeyStartPageNumber;
    }

    public getId(): string {
      return this.journeyId;
    }

    public onPageChange(): void { /* To be implemented by some child classes. */ }
}
