import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormValueService } from '../../../services/form/form-value.service';

@Component({
  selector: 'ccd-case-edit-form',
  templateUrl: 'case-edit-form.html'
})
export class CaseEditFormComponent implements OnDestroy, AfterViewInit {

  @Input()
  public fields: CaseField[] = [];
  @Input()
  public formGroup: FormGroup;
  @Input()
  public caseFields: CaseField[] = [];
  @Input()
  public pageChangeSubject: Subject<boolean> = new Subject();
  @Output()
  public valuesChanged: EventEmitter<any> = new EventEmitter();

  public initial: any;
  public pageChangeSubscription: Subscription;
  public formGroupChangeSubscription: Subscription;

  constructor(private readonly formValueService: FormValueService) {}

  public ngOnDestroy(): void {
    if (this.pageChangeSubscription) {
      this.pageChangeSubscription.unsubscribe();
    }
    if (this.formGroupChangeSubscription) {
      this.formGroupChangeSubscription.unsubscribe();
    }
  }

  // We need the below un/subscribe complexity as we do not have proper page component per page with its AfterViewInit hook
  // being called on each page load. This is done for "Cancel and return" modal from RDM-2302.
  public ngAfterViewInit(): void {
    this.retrieveInitialFormValues();
    this.pageChangeSubscription = this.pageChangeSubject.subscribe(() => {
      if (this.formGroupChangeSubscription) {
        this.formGroupChangeSubscription.unsubscribe();
      }
      // Timeout is required for the form to be rendered before subscription to form changes and initial form values retrieval.
      setTimeout(() => {
        this.subscribeToFormChanges();
        this.retrieveInitialFormValues();
      });
    });
    this.subscribeToFormChanges();
  }

  public subscribeToFormChanges() {
    this.formGroupChangeSubscription = this.formGroup.valueChanges
      .pipe(
        debounceTime(200)
      )
      .subscribe(_ => this.detectChangesAndEmit(_));
  }

  public retrieveInitialFormValues() {
    this.initial = JSON.stringify(this.formValueService.sanitise(this.formGroup.value));
  }

  public detectChangesAndEmit(changes) {
    const current = JSON.stringify(this.formValueService.sanitise(changes));
    this.initial !== current ? this.valuesChanged.emit(true) : this.valuesChanged.emit(false);
  }
}
