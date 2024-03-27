import { TestBed } from '@angular/core/testing';

import { MultipageComponentStateService } from './multipage-component-state.service';
import { Journey, JourneyInstigator } from '../../domain';

describe('PageStateService', () => {
  let service: MultipageComponentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultipageComponentStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get journey collection', () => {
    const journeys: Journey[] = [];
    service.setJourneyCollection(journeys);
    expect(service.getJourneyCollection()).toEqual(journeys);
  });

  it('should set and get instigator', () => {
    const instigator: JourneyInstigator = {
      onFinalNext: () => { },
      onFinalPrevious: () => { }
    };

    service.setInstigator(instigator);
    expect(service.getInstigator()).toEqual(instigator);
  });

  it('should get and set the journey state', () => {
    const journey: Journey = {
      journeyId: 'test',
      journeyPageNumber: 1,
      journeyStartPageNumber: 0,
      journeyEndPageNumber: 5,
      next: () => { },
      previous: () => { },
      hasNext: () => true,
      hasPrevious: () => true,
      isFinished: () => false,
      isStart: () => false,
      childJourney: undefined,
      onPageChange: () => { }
    };

    service.setJourneyState(journey);
    expect(service.getJourneyState(journey)).toEqual(journey);
  });

  it('should reset journey state', () => {
    const journey: Journey = {
      journeyId: 'test',
      journeyPageNumber: 1,
      journeyStartPageNumber: 0,
      journeyEndPageNumber: 5,
      next: () => { },
      previous: () => { },
      hasNext: () => true,
      hasPrevious: () => true,
      isFinished: () => false,
      isStart: () => false,
      childJourney: undefined,
      onPageChange: () => { }
    };

    service.setJourneyState(journey);
    service.resetJourneyState();
    expect(service.getJourneyState(journey)).toBeNull();
  });

  it('should invoke next method of journey', () => {
    const journey: Journey = {
      journeyId: 'test',
      journeyPageNumber: 1,
      journeyStartPageNumber: 0,
      journeyEndPageNumber: 5,
      next: () => { },
      previous: () => { },
      hasNext: () => true,
      hasPrevious: () => true,
      isFinished: () => false,
      isStart: () => false,
      childJourney: undefined,
      onPageChange: () => { }
    };

    service.setJourneyCollection([journey]);
    spyOn(journey, 'next');
    service.next();
    expect(journey.next).toHaveBeenCalled();
  });

  it('should invoke previous method of journey', () => {
    const journey: Journey = {
      journeyId: 'test',
      journeyPageNumber: 1,
      journeyStartPageNumber: 0,
      journeyEndPageNumber: 5,
      next: () => { },
      previous: () => { },
      hasNext: () => true,
      hasPrevious: () => true,
      isFinished: () => false,
      isStart: () => false,
      childJourney: undefined,
      onPageChange: () => { }
    };

    service.setJourneyCollection([journey]);
    spyOn(journey, 'previous');
    service.previous();
    expect(journey.previous).toHaveBeenCalled();
  });
});
