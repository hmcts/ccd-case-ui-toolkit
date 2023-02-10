import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { CaseFlagStateService } from './case-flag-state.service';

describe('CaseFlagStateService', () => {
  let caseFlagStateService: CaseFlagStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaseFlagStateService]
    });
    caseFlagStateService = TestBed.inject(CaseFlagStateService);
  });

  it('should be created', () => {
    expect(caseFlagStateService).toBeTruthy();
  });

  it('calling resetCache should reset the form group', () => {
    const formControlName = 'test' ;
    caseFlagStateService.formGroup.addControl(formControlName, new FormControl());
    expect(caseFlagStateService.formGroup.get(formControlName)).toBeTruthy();
    caseFlagStateService.resetCache();
    expect(caseFlagStateService.formGroup.get(formControlName)).toBeNull();
  });
});
