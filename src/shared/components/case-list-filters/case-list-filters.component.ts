import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { FormGroup } from '@angular/forms';
import 'rxjs/add/operator/do';
import { Jurisdiction, CaseState, CaseTypeLite, WorkbasketInputModel } from '../../domain';
import { READ_ACCESS } from '../../domain/case-view/access-types.model';
import { JurisdictionService, AlertService, WindowService, OrderService, WorkbasketInputFilterService,
  DefinitionsService } from '../../services';

const FORM_GROUP_VAL_LOC_STORAGE = 'case-list-filters-form-group-value';
const SAVED_QUERY_PARAM_LOC_STORAGE = 'savedQueryParams';
@Component({
  selector: 'ccd-case-list-filters',
  templateUrl: './case-list-filters.component.html',
  styleUrls: ['./case-list-filters.component.scss']
})
export class CaseListFiltersComponent implements OnInit {

  public static readonly PARAM_JURISDICTION = 'jurisdiction';
  public static readonly PARAM_CASE_TYPE = 'case-type';
  public static readonly PARAM_CASE_STATE = 'case-state';

  @Input()
  defaults;

  @Output()
  onApply: EventEmitter<any> = new EventEmitter();

  @Output()
  onReset: EventEmitter<any> = new EventEmitter();

  workbasketInputs: WorkbasketInputModel[];
  workbasketInputsReady: boolean;

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

  jurisdictions: Jurisdiction[];
  selectedJurisdictionCaseTypes?: CaseTypeLite[];
  selectedCaseTypeStates?: CaseState[];

  initialised = false;

  constructor(
    private route: ActivatedRoute,
    private workbasketInputFilterService: WorkbasketInputFilterService,
    private orderService: OrderService,
    private jurisdictionService: JurisdictionService,
    private alertService: AlertService,
    private windowService: WindowService,
    private definitionsService: DefinitionsService,
  ) {
  }

  ngOnInit(): void {
    this.selected = {};

    this.definitionsService.getJurisdictions(READ_ACCESS)
      .subscribe(jurisdictions => {
        this.jurisdictions = jurisdictions;
        this.route.queryParams.subscribe(params => {
          if (!this.initialised || !params || !Object.keys(params).length) {
            this.initFilters();
            this.initialised = true;
          }
        });
    });
  }

  apply(init): void {
    // Save filters as query parameters for current route
    let queryParams = {};
    if (this.selected.jurisdiction) {
      queryParams[CaseListFiltersComponent.PARAM_JURISDICTION] = this.selected.jurisdiction.id;
    }
    if (this.selected.caseType) {
      queryParams[CaseListFiltersComponent.PARAM_CASE_TYPE] = this.selected.caseType.id;
    }
    if (this.selected.caseState) {
      queryParams[CaseListFiltersComponent.PARAM_CASE_STATE] = this.selected.caseState.id;
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
    this.jurisdictionService.announceSelectedJurisdiction(this.selected.jurisdiction);
    this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes.length > 0 ? this.selected.jurisdiction.caseTypes : null;
    this.selected.caseType = this.selectedJurisdictionCaseTypes ? this.selectedJurisdictionCaseTypes[0] : null;
    this.selected.caseState = this.selected.caseType ? this.selected.caseType.states[0] : null;
    this.clearWorkbasketInputs();
    if (!this.isApplyButtonDisabled()) {
      this.onCaseTypeIdChange();
    }
  }

  onCaseTypeIdChange(): void {

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
    let selectedJurisdictionId = routeSnapshot.queryParams[CaseListFiltersComponent.PARAM_JURISDICTION] || this.defaults.jurisdiction_id;
    this.selected.jurisdiction = this.jurisdictions.find(j => selectedJurisdictionId === j.id);
    if (this.selected.jurisdiction && this.selected.jurisdiction.caseTypes.length > 0) {
      this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes;
      this.selected.caseType = this.selectCaseType(this.selected, this.selectedJurisdictionCaseTypes, routeSnapshot);
      if (this.selected.caseType) {
        this.onCaseTypeIdChange();
        this.selected.caseState = this.selectCaseState(this.selected.caseType, routeSnapshot);
      }
    }

    this.apply(false);
  }

  private selectCaseState(caseType: CaseTypeLite, routeSnapshot: ActivatedRouteSnapshot): CaseState {
    let caseState;
    if (caseType) {
      let selectedCaseStateId = this.selectCaseStateIdFromQueryOrDefaults(routeSnapshot, this.defaults.state_id);
      caseState = caseType.states.find(ct => selectedCaseStateId === ct.id);
    }
    return caseState ? caseState : caseType.states[0];
  }

  private selectCaseStateIdFromQueryOrDefaults(routeSnapshot: ActivatedRouteSnapshot, defaultCaseStateId: string): string {
    return routeSnapshot.queryParams[CaseListFiltersComponent.PARAM_CASE_STATE] || defaultCaseStateId;
  }

  private selectCaseType(selected: any, caseTypes: CaseTypeLite[], routeSnapshot: ActivatedRouteSnapshot): CaseTypeLite {
    let caseType;
    if (selected.jurisdiction) {
      let selectedCaseTypeId = this.selectCaseTypeIdFromQueryOrDefaults(routeSnapshot, this.defaults.case_type_id);
      caseType = caseTypes.find(ct => selectedCaseTypeId === ct.id);
    }
    return caseType ? caseType : caseTypes[0];
  }

  private selectCaseTypeIdFromQueryOrDefaults(routeSnapshot: ActivatedRouteSnapshot, defaultCaseTypeId: string): string {
    return routeSnapshot.queryParams[CaseListFiltersComponent.PARAM_CASE_TYPE] || defaultCaseTypeId;
  }

  isSearchableAndWorkbasketInputsReady(): boolean {
    return this.selected.jurisdiction && this.selected.caseType && this.workbasketInputsReady;
  }

  private clearWorkbasketInputs() {
    this.workbasketInputsReady = false;
    this.workbasketInputs = [];
  }
}
