export interface Journey {
    next(): void;
    previous(): void;
    hasNext(): boolean;
    hasPrevious(): boolean;
    isFinished(): boolean;
    isStart(): boolean;
    onPageChange(): void;
    journeyId: string;
    journeyPageNumber: number;
    journeyStartPageNumber: number;
    journeyEndPageNumber: number;
    journeyPreviousPageNumber: number;
    childJourney: Journey;
}
