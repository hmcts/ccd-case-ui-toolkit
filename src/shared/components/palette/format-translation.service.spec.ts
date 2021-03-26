import { TestBed } from '@angular/core/testing';

import { FormatTranslationService } from './format-translation.service';

describe('FormatTranslationService', () => {

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormatTranslationService = TestBed.get(FormatTranslationService);
    expect(service).toBeTruthy();
  });

  it('should translate format DD/MM/YYYY to be valid date', () => {
    const service: FormatTranslationService = TestBed.get(FormatTranslationService);
    const result = service.hasDate('DD/MM/YYYY');
    expect(result).toBeTruthy();
  })
});
