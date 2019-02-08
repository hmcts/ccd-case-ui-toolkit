import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { CREATE_ACCESS } from '../../../domain/case-view/access-types.model';
import { DefinitionsService } from '../../../services/definitions/definitions.service';
import { Jurisdiction } from '../../../domain/definition/jurisdiction.model';
import { CaseTypeLite } from '../../../domain/definition/case-type-lite.model';
import { CaseEvent } from '../../../domain/definition/case-event.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { OrderService } from '../../../services/order/order.service';
import { AlertService } from '../../../services/alert/alert.service';
import { CallbackErrorsContext } from '../../error/domain/error-context';

@Component({
  selector: 'ccd-create-case-filters',
  templateUrl: './create-case-filters.html'
})
export class CreateCaseFiltersComponent implements OnInit {
  static readonly TRIGGER_TEXT_START = 'Start';
  static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Start';

  @Input()
  formGroup: FormGroup = new FormGroup({});

  jurisdictions: Jurisdiction[];
  callbackErrorsSubject: Subject<any> = new Subject();

  selected: {
    jurisdiction?: Jurisdiction,
    caseType?: CaseTypeLite,
    event?: CaseEvent,
    formGroup?: FormGroup
  };

  selectedJurisdictionCaseTypes?: CaseTypeLite[];
  selectedCaseTypeEvents?: CaseEvent[];

  filterJurisdictionControl: FormControl;
  filterCaseTypeControl: FormControl;
  filterEventControl: FormControl;

  triggerTextStart = CreateCaseFiltersComponent.TRIGGER_TEXT_START;
  triggerTextIgnoreWarnings = CreateCaseFiltersComponent.TRIGGER_TEXT_CONTINUE;
  triggerText = CreateCaseFiltersComponent.TRIGGER_TEXT_START;
  ignoreWarning = false;
  error: HttpError;

  constructor(private router: Router,
              private definitionsService: DefinitionsService,
              private orderService: OrderService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.selected = {};
    this.initControls();
    this.definitionsService.getJurisdictions(CREATE_ACCESS)
      .subscribe(jurisdictions => {
        this.jurisdictions = jurisdictions;
        this.selectJurisdiction(this.jurisdictions, this.filterJurisdictionControl);
      });
    if (document.getElementById('cc-jurisdiction')) {
      document.getElementById('cc-jurisdiction').focus();
    }
  }

  onJurisdictionIdChange(): void {
    this.resetCaseType();
    this.resetEvent();
    if (this.filterJurisdictionControl.value !== '') {
      this.formGroup.controls['caseType'].enable();
      this.selected.jurisdiction = this.findJurisdiction(this.jurisdictions, this.filterJurisdictionControl.value);
      this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes;
      this.selectCaseType(this.selectedJurisdictionCaseTypes, this.filterCaseTypeControl);
    }
  }

  onCaseTypeIdChange(): void {
    this.resetEvent();
    if (this.filterCaseTypeControl.value !== '') {
      this.selected.caseType = this.findCaseType(this.selectedJurisdictionCaseTypes, this.filterCaseTypeControl.value);
      this.formGroup.controls['event'].enable();
      this.selectedCaseTypeEvents = this.sortEvents(this.selected.caseType.events);
      this.selectEvent(this.selectedCaseTypeEvents, this.filterEventControl);
    }
  }

  onEventIdChange(): void {
    this.resetErrors();
    if (this.filterEventControl.value !== '') {
      this.selected.event = this.findEvent(this.selectedCaseTypeEvents, this.filterEventControl.value);
    } else {
      this.selected.event = null;
    }
  }

  isCreatable(): boolean {
    return !this.isEmpty(this.selected) &&
      !this.isEmpty(this.selected.jurisdiction) &&
      !this.isEmpty(this.selected.caseType) &&
      !this.isEmpty(this.selected.event) &&
      !this.hasCallbackErrors() &&
      !this.hasInvalidData();
  }

  apply(): Promise<boolean | void> {
    let queryParams = {};
    if (this.ignoreWarning) {
      queryParams['ignoreWarning'] = this.ignoreWarning;
    }
    return this.router.navigate(['/create/case', this.selected.jurisdiction.id, this.selected.caseType.id, this.selected.event.id], {
      queryParams
    }).catch(error => {
      this.error = error;
      this.callbackErrorsSubject.next(error);
    });
  }

  callbackErrorsNotify(errorContext: CallbackErrorsContext) {
    this.ignoreWarning = errorContext.ignore_warning;
    this.triggerText = errorContext.trigger_text;
  }

  private sortEvents(events: CaseEvent[]) {
    return this.orderService.sort(this.retainEventsWithNoPreStates(events));
  }

  private retainEventsWithNoPreStates(events: CaseEvent[]) {
    return events.filter(event => event.pre_states.length === 0);
  }

  private selectJurisdiction(jurisdictions: Jurisdiction[], filterJurisdictionControl: FormControl) {
    if (jurisdictions.length === 1) {
      filterJurisdictionControl.setValue(jurisdictions[0].id);
      this.onJurisdictionIdChange();
    }
  }

  private selectCaseType(caseTypes: CaseTypeLite[], filterCaseTypeControl: FormControl) {
    if (caseTypes.length === 1) {
      filterCaseTypeControl.setValue(caseTypes[0].id);
      this.onCaseTypeIdChange();
    }
  }

  private selectEvent(events: CaseEvent[], filterEventControl: FormControl) {
    if (events.length === 1) {
      filterEventControl.setValue(events[0].id);
      this.onEventIdChange();
    }
  }

  private findJurisdiction(jurisdictions: Jurisdiction[], id: string): Jurisdiction {
    return jurisdictions.find(j => j.id === id);
  }

  private findCaseType(caseTypes: CaseTypeLite[], id: string): CaseTypeLite {
    return caseTypes.find(caseType => caseType.id === id);
  }

  private findEvent(events: CaseEvent[], id: string): CaseEvent {
    return events.find(event => event.id === id);
  }

  private initControls(): void {
    this.filterJurisdictionControl = new FormControl('');
    this.formGroup.addControl('jurisdiction', this.filterJurisdictionControl);
    this.filterCaseTypeControl = new FormControl({ value: '', disabled: true });
    this.formGroup.addControl('caseType', this.filterCaseTypeControl);
    this.filterEventControl = new FormControl({ value: '', disabled: true });
    this.formGroup.addControl('event', this.filterEventControl);
  }

  private resetCaseType(): void {
    this.resetErrors();
    this.filterCaseTypeControl.setValue('');
    this.selected.caseType = null;
    this.selectedJurisdictionCaseTypes = [];
    this.formGroup.controls['caseType'].disable();
  }

  private resetEvent(): void {
    this.resetErrors();
    this.filterEventControl.setValue('');
    this.selected.event = null;
    this.selectedCaseTypeEvents = [];
    this.formGroup.controls['event'].disable();
  }

  resetErrors(): void {
    this.error = null;
    this.ignoreWarning = false;
    this.callbackErrorsSubject.next(null);
    this.alertService.clear();
  }

  private hasCallbackErrors(): boolean {
    return this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length;
  }

  private hasInvalidData(): boolean {
    return this.error
      && this.error.details
      && this.error.details.field_errors
      && this.error.details.field_errors.length;
  }

  private isEmpty(value: any): boolean {
    return value === null || value === undefined;
  }
}
