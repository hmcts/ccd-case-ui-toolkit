export interface Journey {
    next(): void;
    previous(): void;
    hasNext(): boolean;
    hasPrevious(): boolean;
    isFinished(): boolean;
    isStart(): boolean;
    journeyId: string;
    journeyPageNumber: number;
    journeyStartPageNumber: number;
    journeyEndPageNumber: number;
    childJourney: Journey;
}
