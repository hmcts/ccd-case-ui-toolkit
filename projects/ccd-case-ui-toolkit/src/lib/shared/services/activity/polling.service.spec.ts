import { TestBed } from '@angular/core/testing';
import { PollingService } from './polling.service';

describe('PollingService', () => {
  let pollingService: PollingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PollingService]
    });

    pollingService = TestBed.inject(PollingService);
  });

  it('should create the service', () => {
    expect(pollingService).toBeTruthy();
  });
});
