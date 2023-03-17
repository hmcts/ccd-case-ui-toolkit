import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class CaseFlagStateService {
  public formGroup: FormGroup = new FormGroup({});
  public pageLocation: string;
  public fieldStateToNavigate: number;

  public resetCache(pageLocation: string): void {
    this.formGroup = new FormGroup({});
    this.pageLocation = pageLocation;
  }
}
