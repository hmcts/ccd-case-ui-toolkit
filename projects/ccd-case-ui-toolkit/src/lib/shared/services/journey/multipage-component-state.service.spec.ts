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
      journeyPreviousPageNumber: 0,
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
      journeyPreviousPageNumber: 0,
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
      journeyPreviousPageNumber: 0,
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
      journeyPreviousPageNumber: 0,
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

describe('MultipageComponentStateService next and previous', () => {
  let service: MultipageComponentStateService;
  let mockJourney: any;
  let mockInstigator: any;

  beforeEach(() => {
    mockJourney = {
      journeyId: 'test',
      journeyPageNumber: 1,
      journeyStartPageNumber: 0,
      journeyPreviousPageNumber: 0,
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

    mockInstigator = {
      onFinalNext: () => { },
      onFinalPrevious: () => { }
    };

    service = new MultipageComponentStateService();
    service.setJourneyCollection([mockJourney]);
    service.setInstigator(mockInstigator);
  });

  describe('next', () => {
    it('should call onFinalNext if journeyCollection is empty', () => {
      spyOn(mockInstigator, 'onFinalNext');
      service.setJourneyCollection([]);
      service.next();
      expect(mockInstigator.onFinalNext).toHaveBeenCalled();
    });

    it('should call next on the first unfinished journey', () => {
      spyOn(mockJourney, 'next');
      mockJourney.isFinished = jasmine.createSpy().and.returnValue(false);
      service.next();
      expect(mockJourney.next).toHaveBeenCalled();
    });

    it('should call onFinalNext if all journeys are finished', () => {
      spyOn(mockInstigator, 'onFinalNext');
      mockJourney.isFinished = jasmine.createSpy().and.returnValue(true);
      service.next();
      expect(mockInstigator.onFinalNext).toHaveBeenCalled();
    });
  });

  describe('previous', () => {
    it('should call onFinalPrevious if journeyCollection is empty', () => {
      spyOn(mockInstigator, 'onFinalPrevious');
      service.setJourneyCollection([]);
      service.previous();
      expect(mockInstigator.onFinalPrevious).toHaveBeenCalled();
    });

    it('should call previous on the first journey not at start', () => {
      spyOn(mockJourney, 'previous');
      mockJourney.isStart = jasmine.createSpy().and.returnValue(false);
      service.previous();
      expect(mockJourney.previous).toHaveBeenCalled();
    });

    it('should call onFinalPrevious if all journeys are at start', () => {
      spyOn(mockInstigator, 'onFinalPrevious');
      mockJourney.isStart = jasmine.createSpy().and.returnValue(true);
      service.previous();
      expect(mockInstigator.onFinalPrevious).toHaveBeenCalled();
    });
  });
});
