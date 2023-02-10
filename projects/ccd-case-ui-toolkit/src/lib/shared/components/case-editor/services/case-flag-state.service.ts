import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class CaseFlagStateService {
  public formGroup: FormGroup = new FormGroup({});

  public resetCache() {
    this.formGroup = new FormGroup({});
  }
}
