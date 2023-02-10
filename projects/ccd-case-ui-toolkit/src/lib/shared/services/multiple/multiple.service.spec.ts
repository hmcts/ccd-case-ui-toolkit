import { TestBed } from '@angular/core/testing';

import { MultipleService } from './multiple.service';

describe('MultipleServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MultipleService = TestBed.get(MultipleService);
    expect(service).toBeTruthy();
  });
});
