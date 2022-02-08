import { Component, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { FlagType } from "../../domain";

@Component({
  selector: 'ccd-select-flag-type',
  templateUrl: './select-flag-type.component.html',
  styleUrls: ['./select-flag-type.component.scss']
})
export class SelectFlagTypeComponent implements OnInit { 

  public selectFlagTypeForm: FormGroup;
  public flagTypes: FlagType[];
  public flagTypeSelected: string;
  public validationErrors: { id: string, message: string }[] = [];

  constructor(private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute) {
  }

  public ngOnInit(): void {
    this.selectFlagTypeForm = this.fb.group({
      flagTypes: [''],
      'otherFlagTypeDescription': ['']
    });

    this.flagTypes = this.getFlagTypes();
  }

  public onFlagTypeChanged(event: any): void {
    this.flagTypeSelected = event.target.value;
    console.log(this.flagTypeSelected);
  }

  public onSubmit(): void {
    this.validationErrors = [];
    if (this.validateForm()) {
      // TODO: Navigate if the form validation succeeds
      // this.router.navigate([''], { relativeTo: this.route });
    }
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }

  private validateForm(): boolean {
    console.log('Select flag type form', this.selectFlagTypeForm.value);
    if (!this.flagTypeSelected) {
      // TODO: Validation error message if none of the radio buttons are selected
      this.validationErrors.push({id: '', message: 'Please select a flag type '})
      return false;
    }

    if (this.flagTypeSelected === 'other') {
      const otherFlagTypeDescription = this.selectFlagTypeForm.controls['otherFlagTypeDescription'].value;
      if (!otherFlagTypeDescription) {
        this.validationErrors.push({id: 'conditional-flag-type-other', message: 'Please enter a flag type'});
        return false;
      }

      if (otherFlagTypeDescription.length > 80) {
        this.validationErrors.push({id: 'conditional-flag-type-other', message: 'You can enter up to 80 characters only'});
        return false;
      }
    }

    return true;
  }

  private getFlagTypes(): FlagType[] {
    return [
      {id: 'urgent-case', name: 'Urgent case'},
      {id: 'vulnerable-user', name: 'Vulnerable user'},
      {id: 'other', name: 'Other'}
    ];
  }
}
