import { Component, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValueService } from '../../../services/form/form-value.service';

@Component({
  selector: 'ccd-case-edit-form',
  templateUrl: 'case-edit-form.html'
})
export class CaseEditFormComponent implements OnDestroy, AfterViewInit {

  @Input()
  fields: CaseField[] = [];
  @Input()
  formGroup: FormGroup;
  @Input()
  eventFields: CaseField[] = [];
  @Input()
  pageChangeSubject: Subject<boolean> = new Subject();
  @Output()
  valuesChanged: EventEmitter<any> = new EventEmitter();

  initial: any;
  pageChangeSubscription: Subscription;
  formGroupChangeSubscription: Subscription;

  constructor(private formValueService: FormValueService) {}

  ngOnDestroy() {
    this.pageChangeSubscription.unsubscribe();
    this.formGroupChangeSubscription.unsubscribe();
  }

  // We need the below un/subscribe complexity as we do not have proper page component per page with its AfterViewInit hook
  // being called on each page load. This is done for "Cancel and return" modal from RDM-2302.
  ngAfterViewInit(): void {
    this.retrieveInitialFormValues();
    this.pageChangeSubscription = this.pageChangeSubject.subscribe(() => {
      this.formGroupChangeSubscription.unsubscribe();
      // Timeout is required for the form to be rendered before subscription to form changes and initial form values retrieval.
      setTimeout(() => {
        this.subscribeToFormChanges();
        this.retrieveInitialFormValues();
      });
    });
    this.subscribeToFormChanges();
  }

  subscribeToFormChanges() {
    this.formGroupChangeSubscription = this.formGroup.valueChanges.subscribe(_ => this.detectChangesAndEmit(_));
  }

  retrieveInitialFormValues() {
    this.initial = JSON.stringify(this.formValueService.sanitise(this.formGroup.value));
  }

  detectChangesAndEmit(changes) {
    const current = JSON.stringify(this.formValueService.sanitise(changes));
    this.initial !== current ? this.valuesChanged.emit(true) : this.valuesChanged.emit(false);
  }
}
