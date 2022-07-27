import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { take } from 'rxjs/operators';
import { CaseField, CaseState, CaseTypeLite, Jurisdiction, WorkbasketInputModel } from '../../domain';
import { AlertService, FieldsUtils, JurisdictionService, OrderService, WindowService, WorkbasketInputFilterService } from '../../services';

const FORM_GROUP_VAL_LOC_STORAGE = 'workbasket-filter-form-group-value';
const SAVED_QUERY_PARAM_LOC_STORAGE = 'savedQueryParams';
const REGION_LIST_AND_FRC_FILTER = 'regionList';

@Component({
  selector: 'ccd-workbasket-filters',
  templateUrl: './workbasket-filters.component.html',
  styleUrls: ['./workbasket-filters.component.scss']
})
export class WorkbasketFiltersComponent implements OnInit {

  public static readonly PARAM_JURISDICTION = 'jurisdiction';
  public static readonly PARAM_CASE_TYPE = 'case-type';
  public static readonly PARAM_CASE_STATE = 'case-state';
  public caseFields: CaseField[];

  @Input()
  public jurisdictions: Jurisdiction[];

  @Input()
  public defaults;

  @Output()
  public onApply: EventEmitter<any> = new EventEmitter();

  @Output()
  public onReset: EventEmitter<any> = new EventEmitter();

  public workbasketInputs: WorkbasketInputModel[];
  public workbasketInputsReady: boolean;

  public workbasketDefaults: boolean;

  public selected: {
    init?: boolean,
    jurisdiction?: Jurisdiction,
    caseType?: CaseTypeLite,
    caseState?: CaseState,
    formGroup?: FormGroup,
    page?: number,
    metadataFields?: string[]
  };

  public formGroup: FormGroup = new FormGroup({});

  public selectedJurisdictionCaseTypes?: CaseTypeLite[];
  public selectedCaseTypeStates?: CaseState[];

  public initialised = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly workbasketInputFilterService: WorkbasketInputFilterService,
    private readonly orderService: OrderService,
    private readonly jurisdictionService: JurisdictionService,
    private readonly alertService: AlertService,
    private readonly windowService: WindowService) {
  }

  public ngOnInit(): void {
    this.selected = {};
    this.route.queryParams.subscribe(params => {
      if (!this.initialised || !params || !Object.keys(params).length) {
        this.initFilters(false);
        this.initialised = true;
      }
    });
  }

  public apply(init): void {
    // Save filters as query parameters for current route
    const queryParams = {};
    if (this.selected.jurisdiction) {
      queryParams[WorkbasketFiltersComponent.PARAM_JURISDICTION] = this.selected.jurisdiction.id;
    }
    if (this.selected.caseType) {
      queryParams[WorkbasketFiltersComponent.PARAM_CASE_TYPE] = this.selected.caseType.id;
    }
    if (this.selected.caseState) {
      queryParams[WorkbasketFiltersComponent.PARAM_CASE_STATE] = this.selected.caseState.id;
    }
    // without explicitly preserving alerts any message on the page
    // would be cleared out because of this initial navigation.
    // The above is only true if no alerts were set prior to loading case list page.
    if (!this.alertService.isPreserveAlerts()) {
      this.alertService.setPreserveAlerts(!this.initialised);
    }
    if (Object.keys(this.formGroup.controls).length === 0) {
      this.selected.formGroup = JSON.parse(localStorage.getItem(FORM_GROUP_VAL_LOC_STORAGE));
    } else {
      // Update form group filters
      this.updateFormGroupFilters();

      this.selected.formGroup = this.formGroup;
    }
    this.selected.init = init;
    this.selected.page = 1;
    this.selected.metadataFields = this.getMetadataFields();
    if (init) {
      this.windowService.setLocalStorage(SAVED_QUERY_PARAM_LOC_STORAGE, JSON.stringify(queryParams));
      if (Object.keys(this.formGroup.controls).length > 0) {
        this.windowService.setLocalStorage(FORM_GROUP_VAL_LOC_STORAGE, JSON.stringify(this.formGroup.value));
      }
    }
    // Apply filters
    this.onApply.emit({selected: this.selected, queryParams});
    this.setFocusToTop();
  }

  public reset(): void {
    this.windowService.removeLocalStorage(FORM_GROUP_VAL_LOC_STORAGE);
    this.windowService.removeLocalStorage(SAVED_QUERY_PARAM_LOC_STORAGE);
    setTimeout (() => {
      this.resetFieldsWhenNoDefaults();
      this.onReset.emit(true);
    }, 500);
  }

  public getMetadataFields(): string[] {
    if (this.workbasketInputs) {
      return this.workbasketInputs
        .filter(workbasketInput => workbasketInput.field.metadata === true)
        .map(workbasketInput => workbasketInput.field.id);
    }
  }

  public onJurisdictionIdChange() {
    if (this.selected.jurisdiction) {
      this.jurisdictionService.announceSelectedJurisdiction(this.selected.jurisdiction);
      this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes.length > 0 ? this.selected.jurisdiction.caseTypes : null;
      // Line was too long for linting so refactored it.
      if (this.workbasketDefaults && this.selectedJurisdictionCaseTypes) {
        this.selected.caseType = this.selectedJurisdictionCaseTypes[0];
      } else {
        this.selected.caseType = null;
      }
      this.selected.caseState = null;
      this.clearWorkbasketInputs();
      if (!this.isApplyButtonDisabled()) {
        this.onCaseTypeIdChange();
      }
    } else {
      this.resetCaseType();
      this.resetCaseState();
    }
  }

  public onCaseTypeIdChange(): void {
    if (this.selected.caseType) {
      this.selectedCaseTypeStates = this.sortStates(this.selected.caseType.states);
      this.selected.caseState = null;
      this.formGroup = new FormGroup({});
      this.clearWorkbasketInputs();
      if (!this.isApplyButtonDisabled()) {
        this.workbasketInputFilterService.getWorkbasketInputs(this.selected.jurisdiction.id, this.selected.caseType.id).pipe(
          take(1)
        ).subscribe(workbasketInputs => {
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
            this.getCaseFields();
          }, error => {
            console.log('Workbasket input fields request will be discarded reason: ', error.message);
          });
      }
    } else {
      this.resetCaseState();
    }
  }

  public isCaseTypesDropdownDisabled(): boolean {
    return !this.selectedJurisdictionCaseTypes;
  }

  public isCaseStatesDropdownDisabled(): boolean {
    return !this.selected.caseType || !(this.selected.caseType.states && this.selected.caseType.states.length > 0);
  }

  public isApplyButtonDisabled(): boolean {
    return !(this.selected.jurisdiction && this.selected.caseType);
  }

  public isSearchableAndWorkbasketInputsReady(): boolean {
    return this.selected.jurisdiction && this.selected.caseType && this.workbasketInputsReady;
  }

  /**
   * This method is used to clear the previously used
   * form group control filter values to make sure only the
   * currently selected form group control filter values are present.
   *
   * Has been implemented for 'Region and FRC filters' and can be extended
   * in future to incorporate other dynamic filters.
   *
   * @private
   * @memberof WorkbasketFiltersComponent
   */
   public updateFormGroupFilters(): void {
    // Read the form group local storage
    const formGroupLS = JSON.parse(this.windowService.getLocalStorage(FORM_GROUP_VAL_LOC_STORAGE));

    // Form group local storage is available and contains regionList property
    if (!!formGroupLS && formGroupLS.hasOwnProperty(REGION_LIST_AND_FRC_FILTER)) {
      if (this.formGroup.get(REGION_LIST_AND_FRC_FILTER)) {
        // If regionList value does not match between local storage and form group
        // then the filter value has been changed and we need to clear the old filter values
        if (formGroupLS[REGION_LIST_AND_FRC_FILTER] !== this.formGroup.get(REGION_LIST_AND_FRC_FILTER).value) {
          for (const key in formGroupLS) {
            if (formGroupLS.hasOwnProperty(key)) {
              const value = formGroupLS[key];
              // Clear the filter form group control values if it has a value in local storage
              // The regionList form group control value should be ignored as it always contain the latest value
              if (key !== REGION_LIST_AND_FRC_FILTER && value != null) {
                this.formGroup.get(key).setValue(null);
              }
            }
          }
        }
      }
    }
  }

  private sortStates(states: CaseState[]) {
    return states.sort(this.orderService.sortAsc);
  }

  /**
   * Try to initialise filters based on query parameters or workbasket defaults.
   * Query parameters, when available, take precedence over workbasket defaults.
   */
  private initFilters(init: boolean) {
    const savedQueryParams = this.windowService.getLocalStorage(SAVED_QUERY_PARAM_LOC_STORAGE);
    const routeSnapshot: ActivatedRouteSnapshot = this.route.snapshot;
    if (savedQueryParams) {
      routeSnapshot.queryParams = JSON.parse(savedQueryParams);
    }
    const selectedJurisdictionId = routeSnapshot.queryParams[WorkbasketFiltersComponent.PARAM_JURISDICTION] ||
      (this.defaults && this.defaults.jurisdiction_id);
    if (selectedJurisdictionId) {
      this.selected.jurisdiction = this.jurisdictions.find(j => selectedJurisdictionId === j.id);
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
    this.apply(init);
  }

  private selectCaseState(caseType: CaseTypeLite, routeSnapshot: ActivatedRouteSnapshot): CaseState {
    let caseState;
    if (caseType) {
      const selectedCaseStateId = this.selectCaseStateIdFromQueryOrDefaults(routeSnapshot, (this.defaults && this.defaults.state_id));
      caseState = caseType.states.find(ct => selectedCaseStateId === ct.id);
    }
    return caseState ? caseState : null;
  }

  private selectCaseStateIdFromQueryOrDefaults(routeSnapshot: ActivatedRouteSnapshot, defaultCaseStateId: string): string {
    return routeSnapshot.queryParams[WorkbasketFiltersComponent.PARAM_CASE_STATE] || defaultCaseStateId;
  }

  private selectCaseType(selected: any, caseTypes: CaseTypeLite[], routeSnapshot: ActivatedRouteSnapshot): CaseTypeLite {
    let caseType;
    if (selected.jurisdiction) {
      const selectedCaseTypeId = this.selectCaseTypeIdFromQueryOrDefaults(routeSnapshot, (this.defaults && this.defaults.case_type_id));
      caseType = caseTypes.find(ct => selectedCaseTypeId === ct.id);
    }
    return caseType ? caseType : caseTypes[0];
  }

  private selectCaseTypeIdFromQueryOrDefaults(routeSnapshot: ActivatedRouteSnapshot, defaultCaseTypeId: string): string {
    return routeSnapshot.queryParams[WorkbasketFiltersComponent.PARAM_CASE_TYPE] || defaultCaseTypeId;
  }

  private resetFieldsWhenNoDefaults() {
    this.resetCaseState();
    this.resetCaseType();
    this.clearWorkbasketInputs();
    this.workbasketDefaults = false;
    this.selected.jurisdiction = null;
    this.initialised = false;
    this.initFilters(true);
  }

  private clearWorkbasketInputs() {
    this.workbasketInputsReady = false;
    this.workbasketInputs = [];
  }

  private resetCaseState() {
    this.defaults.state_id = null;
    this.selected.caseState = null;
    this.selectedCaseTypeStates = null;
  }

  private resetCaseType() {
    this.selected.caseType = undefined; // option should be blank rather than "Select a value" in case of reset.
    this.selectedJurisdictionCaseTypes = null;
  }

  private setFocusToTop() {
    window.scrollTo(0, 0);

    const topContainer = document.getElementById('search-result-heading__text');
    if (topContainer) {
      topContainer.focus();
    }
  }

  private getCaseFields(): void {
    if (this.workbasketInputs) {
      this.caseFields = this.workbasketInputs.map(item => FieldsUtils.convertToCaseField(item.field));
    }
  }
}
