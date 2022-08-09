import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CREATE_ACCESS } from '../../domain/case-view/access-types.model';
import { CaseEvent } from '../../domain/definition/case-event.model';
import { CaseTypeLite } from '../../domain/definition/case-type-lite.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { DefinitionsService, OrderService, SessionStorageService } from '../../services';
import { CreateCaseFiltersSelection } from './create-case-filters-selection.model';

@Component({
  selector: 'ccd-create-case-filters',
  templateUrl: './create-case-filters.component.html'
})
export class CreateCaseFiltersComponent implements OnInit {

  @Input()
  public isDisabled: boolean;
  @Input()
  public startButtonText: string;
  @Output()
  public selectionSubmitted: EventEmitter<CreateCaseFiltersSelection> = new EventEmitter();
  @Output()
  public selectionChanged: EventEmitter<any> = new EventEmitter();

  public formGroup: FormGroup = new FormGroup({});

  public selected: {
    jurisdiction?: Jurisdiction,
    caseType?: CaseTypeLite,
    event?: CaseEvent,
    formGroup?: FormGroup
  };

  public jurisdictions: Jurisdiction[];
  public selectedJurisdictionCaseTypes?: CaseTypeLite[];
  public selectedCaseTypeEvents?: CaseEvent[];

  public filterJurisdictionControl: FormControl;
  public filterCaseTypeControl: FormControl;
  public filterEventControl: FormControl;

  constructor(
    private readonly orderService: OrderService,
    private readonly definitionsService: DefinitionsService,
    private readonly sessionStorageService: SessionStorageService
  ) { }

  public ngOnInit() {
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

  public onJurisdictionIdChange(): void {
    this.resetCaseType();
    this.resetEvent();
    if (this.filterJurisdictionControl.value !== '') {
      this.formGroup.controls['caseType'].enable();
      this.selected.jurisdiction = this.findJurisdiction(this.jurisdictions, this.filterJurisdictionControl.value);
      this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes;
      this.selectCaseType(this.selectedJurisdictionCaseTypes, this.filterCaseTypeControl);
    }
  }

  public onCaseTypeIdChange(): void {
    this.resetEvent();
    if (this.filterCaseTypeControl.value !== '') {
      this.selected.caseType = this.findCaseType(this.selectedJurisdictionCaseTypes, this.filterCaseTypeControl.value);
      this.formGroup.controls['event'].enable();
      this.selectedCaseTypeEvents = this.sortEvents(this.selected.caseType.events);
      this.selectEvent(this.selectedCaseTypeEvents, this.filterEventControl);
    }
  }

  public onEventIdChange(): void {
    this.emitChange();
    if (this.filterEventControl.value !== '') {
      this.selected.event = this.findEvent(this.selectedCaseTypeEvents, this.filterEventControl.value);
    } else {
      this.selected.event = null;
    }
  }

  public isCreatable(): boolean {
    return !this.isEmpty(this.selected) &&
      !this.isEmpty(this.selected.jurisdiction) &&
      !this.isEmpty(this.selected.caseType) &&
      !this.isEmpty(this.selected.event) &&
      !this.isDisabled;
  }

  public apply() {
    this.selectionSubmitted.emit({
      jurisdictionId: this.selected.jurisdiction.id,
      caseTypeId: this.selected.caseType.id,
      eventId: this.selected.event.id
    });
  }

  public initControls(): void {
    this.filterJurisdictionControl = new FormControl('');
    this.formGroup.addControl('jurisdiction', this.filterJurisdictionControl);
    this.filterCaseTypeControl = new FormControl({ value: '', disabled: true });
    this.formGroup.addControl('caseType', this.filterCaseTypeControl);
    this.filterEventControl = new FormControl({ value: '', disabled: true });
    this.formGroup.addControl('event', this.filterEventControl);
  }

  public emitChange(): void {
    setTimeout(() => { // workaround to prevent 'ExpressionChangedAfterItHasBeenCheckedError'
      if (this.selectionChanged) {
        this.selectionChanged.emit();
      }
    }, 0);
  }

  private sortEvents(events: CaseEvent[]): CaseEvent[] {
    return this.orderService.sort(this.retainEventsWithCreateRights(this.retainEventsWithNoPreStates(events)));
  }

  private retainEventsWithNoPreStates(events: CaseEvent[]): CaseEvent[] {
    return events.filter(event => event.pre_states.length === 0);
  }

  private retainEventsWithCreateRights(events: CaseEvent[]): CaseEvent[] {
    const userProfile = JSON.parse(this.sessionStorageService.getItem('userDetails'));
    return events.filter(event => userProfile && userProfile.roles &&
      !!userProfile.roles.find(role => this.hasCreateAccess(event, role)));
  }

  private hasCreateAccess(caseEvent: CaseEvent, role: any): boolean {
    return !!caseEvent.acls.find(acl => acl.role === role && acl.create === true);
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

  private resetCaseType(): void {
    this.emitChange();
    this.filterCaseTypeControl.setValue('');
    this.selected.caseType = null;
    this.selectedJurisdictionCaseTypes = [];
    this.formGroup.controls['caseType'].disable();
  }

  private resetEvent(): void {
    this.emitChange();
    this.filterEventControl.setValue('');
    this.selected.event = null;
    this.selectedCaseTypeEvents = [];
    this.formGroup.controls['event'].disable();
  }

  private isEmpty(value: any): boolean {
    return value === null || value === undefined;
  }
}
