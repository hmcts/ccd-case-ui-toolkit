import { TestBed } from '@angular/core/testing';

import { FormatTranslationService } from './format-translation.service';

describe('FormatTranslationService', () => {

  const service: FormatTranslationService = TestBed.get(FormatTranslationService);
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {

    expect(service).toBeTruthy();
  });

  it('should translate format DD/MM/YYYY to be valid date', () => {
    const result = service.hasDate('DD/MM/YYYY');
    expect(result).toBeTruthy();
  })
});
