import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class CaseFlagStateService {
  public formGroup: FormGroup = new FormGroup({});
  public pageLocation: string;
  public fieldStateToNavigate: number;
  public lastPageFieldState: number;
  public initialCaseFlags: any;

  public resetCache(pageLocation: string): void {
    this.formGroup = new FormGroup({});
    this.fieldStateToNavigate = undefined;
    this.pageLocation = pageLocation;
    this.lastPageFieldState = 0;
  }

  public resetInitialCaseFlags(): void {
    this.initialCaseFlags = undefined;
  }
}
