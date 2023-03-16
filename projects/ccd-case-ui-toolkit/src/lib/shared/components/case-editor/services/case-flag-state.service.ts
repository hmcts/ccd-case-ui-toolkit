import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FlagDetailDisplayWithFormGroupPath } from '../../palette/case-flag/domain/case-flag.model';

@Injectable()
export class CaseFlagStateService {
  public formGroup: FormGroup = new FormGroup({});
  public pageLocation: string;
  public selectedFlag: FlagDetailDisplayWithFormGroupPath;

  public resetCache(pageLocation: string): void {
    this.formGroup = new FormGroup({});
    this.pageLocation = pageLocation;
  }
}
