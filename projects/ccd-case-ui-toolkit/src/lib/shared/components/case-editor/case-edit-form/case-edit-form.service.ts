import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CaseEditFormService {
  public formGroup = new FormGroup({});
  public cache: any;
  public cachedValues = [];
  constructor() {
  }
}
