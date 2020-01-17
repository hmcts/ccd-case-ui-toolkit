import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import 'rxjs/add/operator/do';
import { Jurisdiction, CaseState, CaseTypeLite, WorkbasketInputModel, JurisdictionUIConfig } from '../../domain';
import { JurisdictionService, AlertService, WindowService, OrderService, WorkbasketInputFilterService } from '../../services';

const FORM_GROUP_VAL_LOC_STORAGE = 'workbasket-filter-form-group-value';
const SAVED_QUERY_PARAM_LOC_STORAGE = 'savedQueryParams';
@Component({
  selector: 'ccd-workbasket-filters',
  templateUrl: './workbasket-filters.component.html',
  styleUrls: ['./workbasket-filters.component.scss']
})
export class WorkbasketFiltersComponent implements OnInit {

  public static readonly PARAM_JURISDICTION = 'jurisdiction';
  public static readonly PARAM_CASE_TYPE = 'case-type';
  public static readonly PARAM_CASE_STATE = 'case-state';

  @Input()
  jurisdictions: Jurisdiction[];

  jurisdcitionUIConfigs: JurisdictionUIConfig[] = [];

  @Input()
  defaults;

  @Output()
  onApply: EventEmitter<any> = new EventEmitter();

  @Output()
  onReset: EventEmitter<any> = new EventEmitter();

  workbasketInputs: WorkbasketInputModel[];
  workbasketInputsReady: boolean;

  workbasketDefaults: boolean;

  selected: {
    init?: boolean,
    jurisdiction?: Jurisdiction,
    caseType?: CaseTypeLite,
    caseState?: CaseState,
    formGroup?: FormGroup,
    page?: number,
    metadataFields?: string[]
  };

  formGroup: FormGroup = new FormGroup({});

  selectedJurisdictionCaseTypes?: CaseTypeLite[];
  selectedCaseTypeStates?: CaseState[];

  initialised = false;

  constructor(
    private route: ActivatedRoute,
    private workbasketInputFilterService: WorkbasketInputFilterService,
    private orderService: OrderService,
    private jurisdictionService: JurisdictionService,
    private alertService: AlertService,
    private windowService: WindowService) {
  }

  ngOnInit(): void {
    this.selected = {};
    this.jurisdictionService.getJurisdictionUIConfigs
    (this.jurisdictions.map(j => j.id))
    .subscribe(value => {
      if (value) {
        this.jurisdcitionUIConfigs = value;
        this.route.queryParams.subscribe(params => {
          if (!this.initialised || !params || !Object.keys(params).length) {
            this.initFilters();
            this.initialised = true;
          }
        });
      }
    });
  }

  apply(init): void {
    // Save filters as query parameters for current route
    let queryParams = {};
    if (this.selected.jurisdiction) {
      queryParams[WorkbasketFiltersComponent.PARAM_JURISDICTION] = this.selected.jurisdiction.id;
    }
    if (this.selected.caseType) {
      queryParams[WorkbasketFiltersComponent.PARAM_CASE_TYPE] = this.selected.caseType.id;
    }
    if (this.selected.caseState) {
      queryParams[WorkbasketFiltersComponent.PARAM_CASE_STATE] = this.selected.caseState.id;
    }
    if (init) {
      this.windowService.setLocalStorage('savedQueryParams', JSON.stringify(queryParams));
    }
    // without explicitly preserving alerts any message on the page
    // would be cleared out because of this initial navigation.
    // The above is only true if no alerts were set prior to loading case list page.
    if (!this.alertService.isPreserveAlerts()) {
      this.alertService.setPreserveAlerts(!this.initialised);
    }
    this.selected.formGroup = this.formGroup;
    this.selected.init = init;
    this.selected.page = 1;
    this.selected.metadataFields = this.getMetadataFields();
    if (init) {
      this.windowService.setLocalStorage(FORM_GROUP_VAL_LOC_STORAGE, JSON.stringify(this.formGroup.value));
    }
    // Apply filters
    this.onApply.emit({selected: this.selected, queryParams: queryParams});
  }

  reset(): void {
    this.windowService.removeLocalStorage(FORM_GROUP_VAL_LOC_STORAGE);
    this.windowService.removeLocalStorage(SAVED_QUERY_PARAM_LOC_STORAGE);
    this.resetFieldsWhenNoDefaults();
    this.onReset.emit(true);
  }

  getMetadataFields(): string[] {
    if (this.workbasketInputs) {
      return this.workbasketInputs
        .filter(workbasketInput => workbasketInput.field.metadata === true)
        .map(workbasketInput => workbasketInput.field.id);
    }
  }

  onJurisdictionIdChange() {
    if (this.selected.jurisdiction) {
      this.jurisdictionService.announceSelectedJurisdiction(this.selected.jurisdiction);
      this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes.length > 0 ? this.selected.jurisdiction.caseTypes : null;
      this.selected.caseType = this.workbasketDefaults ?
        (this.selectedJurisdictionCaseTypes ? this.selectedJurisdictionCaseTypes[0] : null) : null;
      this.selected.caseState = this.selected.caseType ? this.selected.caseType.states[0] : null;
      this.clearWorkbasketInputs();
      if (!this.isApplyButtonDisabled()) {
        this.onCaseTypeIdChange();
      }
    } else {
      this.resetCaseType();
      this.resetCaseState();
    }
  }

  onCaseTypeIdChange(): void {
    if (this.selected.caseType) {
      this.selectedCaseTypeStates = this.sortStates(this.selected.caseType.states);
      this.selected.caseState = this.selectedCaseTypeStates[0];
      this.formGroup = new FormGroup({});
      this.clearWorkbasketInputs();
      if (!this.isApplyButtonDisabled()) {
        this.workbasketInputFilterService.getWorkbasketInputs(this.selected.jurisdiction.id, this.selected.caseType.id)
          .subscribe(workbasketInputs => {
            this.workbasketInputsReady = true;
            this.workbasketInputs = workbasketInputs
              .sort(this.orderService.sortAsc);
            const formValue = this.windowService.getLocalStorage(FORM_GROUP_VAL_LOC_STORAGE);

            workbasketInputs.forEach(item => {
              if (item.field.elementPath) {
                item.field.id = item.field.id + '.' + item.field.elementPath;
              }
              item.field.label = item.label;
              if (formValue) {
                const searchFormValueObject = JSON.parse(formValue);
                item.field.value = searchFormValueObject[item.field.id];
              }
            });

          }, error => {
            console.log('Workbasket input fields request will be discarded reason: ', error.message);
          });
      }
    } else {
      this.resetCaseState();
    }
  }

  isCaseTypesDropdownDisabled(): boolean {
    return !this.selectedJurisdictionCaseTypes;
  }

  isCaseStatesDropdownDisabled(): boolean {
    return !this.selected.caseType || !(this.selected.caseType.states && this.selected.caseType.states.length > 0);
  }

  isApplyButtonDisabled(): boolean {
    return !(this.selected.jurisdiction && this.selected.caseType);
  }

  private sortStates(states: CaseState[]) {
    return states.sort(this.orderService.sortAsc);
  }

  /**
   * Try to initialise filters based on query parameters or workbasket defaults.
   * Query parameters, when available, take precedence over workbasket defaults.
   */
  private initFilters() {
    const savedQueryParams = this.windowService.getLocalStorage(SAVED_QUERY_PARAM_LOC_STORAGE);
    let routeSnapshot: ActivatedRouteSnapshot = this.route.snapshot;
    if (savedQueryParams) {
      routeSnapshot.queryParams = JSON.parse(savedQueryParams);
    }
    let selectedJurisdictionId = routeSnapshot.queryParams[WorkbasketFiltersComponent.PARAM_JURISDICTION] ||
      (this.defaults && this.defaults.jurisdiction_id);
    if (selectedJurisdictionId) {
      var tmpJurisdiction = this.jurisdictions.find(j => j.id === selectedJurisdictionId);
      if (!this.isJurisdictionShuttered(tmpJurisdiction)) {
        this.selected.jurisdiction = tmpJurisdiction;
      } else {
        this.selected.jurisdiction = this.getNonShutteredJurisdcitionId();
      }
      
      if (this.selected.jurisdiction && this.selected.jurisdiction.caseTypes.length > 0) {
        this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes;
        this.selected.caseType = this.selectCaseType(this.selected, this.selectedJurisdictionCaseTypes, routeSnapshot);
        if (this.selected.caseType) {
          this.onCaseTypeIdChange();
          this.selected.caseState = this.selectCaseState(this.selected.caseType, routeSnapshot);
        }
        this.workbasketDefaults = true;
      }
    } else {
      this.selected.jurisdiction = null;
    }
    this.apply(false);
  }

  private getNonShutteredJurisdcitionId() {
    for(var i = 0; i < this.jurisdictions.length; i++) {
      var jurisdiction = this.jurisdictions[i];
      if(!this.isJurisdictionShuttered(jurisdiction)) {
        return jurisdiction;
      }
    }
  }

  private selectCaseState(caseType: CaseTypeLite, routeSnapshot: ActivatedRouteSnapshot): CaseState {
    let caseState;
    if (caseType) {
      let selectedCaseStateId = this.selectCaseStateIdFromQueryOrDefaults(routeSnapshot, (this.defaults && this.defaults.state_id));
      caseState = caseType.states.find(ct => selectedCaseStateId === ct.id);
    }
    return caseState ? caseState : caseType.states[0];
  }

  private selectCaseStateIdFromQueryOrDefaults(routeSnapshot: ActivatedRouteSnapshot, defaultCaseStateId: string): string {
    return routeSnapshot.queryParams[WorkbasketFiltersComponent.PARAM_CASE_STATE] || defaultCaseStateId;
  }

  private selectCaseType(selected: any, caseTypes: CaseTypeLite[], routeSnapshot: ActivatedRouteSnapshot): CaseTypeLite {
    let caseType;
    if (selected.jurisdiction) {
      let selectedCaseTypeId = this.selectCaseTypeIdFromQueryOrDefaults(routeSnapshot, (this.defaults && this.defaults.case_type_id));
      caseType = caseTypes.find(ct => selectedCaseTypeId === ct.id);
    }
    return caseType ? caseType : caseTypes[0];
  }

  private selectCaseTypeIdFromQueryOrDefaults(routeSnapshot: ActivatedRouteSnapshot, defaultCaseTypeId: string): string {
    return routeSnapshot.queryParams[WorkbasketFiltersComponent.PARAM_CASE_TYPE] || defaultCaseTypeId;
  }

  isSearchableAndWorkbasketInputsReady(): boolean {
    return this.selected.jurisdiction && this.selected.caseType && this.workbasketInputsReady;
  }

  private resetFieldsWhenNoDefaults() {
    if (!(this.defaults && this.defaults.jurisdiction_id)) {
      this.workbasketDefaults = false;
      this.selected.jurisdiction = null;
      this.selected.caseType = undefined; // option should be blank rather than "Select a value" in case of reset.
      this.selectedJurisdictionCaseTypes = null;
      this.resetCaseState();
      this.clearWorkbasketInputs();
    }
  }

  private clearWorkbasketInputs() {
    this.workbasketInputsReady = false;
    this.workbasketInputs = [];
  }

  private resetCaseState() {
    this.selected.caseState = null;
    this.selectedCaseTypeStates = null;
  }

  private resetCaseType() {
    this.selected.caseType = null;
    this.selectedJurisdictionCaseTypes = null;
  }

  isJurisdictionShuttered(j: Jurisdiction) {
    var config = j && this.jurisdcitionUIConfigs.find(jc => jc.id === j.id);
    return config && config.shuttered;
  }
}
