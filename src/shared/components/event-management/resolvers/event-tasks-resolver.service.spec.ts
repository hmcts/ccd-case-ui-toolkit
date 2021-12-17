import { TestBed } from '@angular/core/testing';

import { EventTasksResolverService } from './event-tasks-resolver.service';

describe('EventTaskResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventTasksResolverService = TestBed.get(EventTasksResolverService);
    expect(service).toBeTruthy();
  });
});
