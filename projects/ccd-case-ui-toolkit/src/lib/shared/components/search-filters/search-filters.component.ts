import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';

import { CaseField } from '../../domain/definition/case-field.model';
import { CaseState } from '../../domain/definition/case-state.model';
import { CaseTypeLite } from '../../domain/definition/case-type-lite.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { OrderService } from '../../services/order/order.service';
import { SearchService } from '../../services/search/search.service';
import { WindowService } from '../../services/window/window.service';


import { SearchInput } from './domain/search-input.model';

const JURISDICTION_LOC_STORAGE = 'search-jurisdiction';
const META_FIELDS_LOC_STORAGE = 'search-metadata-fields';
const FORM_GROUP_VALUE_LOC_STORAGE = 'search-form-group-value';
const CASE_TYPE_LOC_STORAGE = 'search-caseType';
@Component({
  selector: 'ccd-search-filters',
  templateUrl: './search-filters.component.html',
})

export class SearchFiltersComponent implements OnInit {
  public readonly PARAM_JURISDICTION = 'jurisdiction';
  public readonly PARAM_CASE_TYPE = 'case-type';
  public readonly PARAM_CASE_STATE = 'case-state';
  public caseFields: CaseField[];

  @Input()
  public jurisdictions: Jurisdiction[];

  @Input()
  public autoApply: boolean;

  @Output()
  public onApply: EventEmitter<any> = new EventEmitter();

  @Output()
  public onReset: EventEmitter<any> = new EventEmitter();

  @Output()
  public onJurisdiction: EventEmitter<any> = new EventEmitter();

  public searchInputs: SearchInput[];
  public searchInputsReady: boolean;

  public selected: {
    jurisdiction?: Jurisdiction,
    caseType?: CaseTypeLite,
    formGroup?: FormGroup,
    caseState?: CaseState,
    page?: number,
    metadataFields?: string[]
  };

  public selectedJurisdictionCaseTypes?: CaseTypeLite[];

  public formGroup: FormGroup = new FormGroup({});

  constructor(private readonly searchService: SearchService,
    private readonly orderService: OrderService,
    private readonly jurisdictionService: JurisdictionService,
    private readonly windowService: WindowService) {
  }

  public ngOnInit(): void {
    this.selected = {};
    const jurisdiction = this.windowService.getLocalStorage(JURISDICTION_LOC_STORAGE);
    if (this.jurisdictions.length === 1 || jurisdiction) {
      this.selected.jurisdiction = this.jurisdictions[0];
      if (jurisdiction) {
        const localStorageJurisdiction = JSON.parse(jurisdiction);
        this.selected.jurisdiction = this.jurisdictions.filter(j => j.id === localStorageJurisdiction.id)[0];
      }
      this.onJurisdictionIdChange();
    }

    this.selected.formGroup = this.formGroup;
    this.selected.page = 1;
    this.selected.metadataFields = this.getMetadataFields();
    this.onApply.emit({
      selected: this.selected,
      queryParams: this.getQueryParams()
    });

  }

  public reset(): void {
    this.windowService.removeLocalStorage(FORM_GROUP_VALUE_LOC_STORAGE);
    this.windowService.removeLocalStorage(CASE_TYPE_LOC_STORAGE);
    this.windowService.removeLocalStorage(JURISDICTION_LOC_STORAGE);
    this.windowService.removeLocalStorage(META_FIELDS_LOC_STORAGE);
    this.selected = {};
    if (this.jurisdictions.length === 1) {
      this.selected.jurisdiction = this.jurisdictions[0];
      this.onJurisdictionIdChange();
    }
    this.onReset.emit();
  }

  public apply(): void {
    this.selected.formGroup = this.formGroup;
    this.selected.page = 1;
    this.selected.metadataFields = this.getMetadataFields();
    this.populateValuesInLocalStorage();
    this.onApply.emit({
      selected: this.selected,
      queryParams: this.getQueryParams()
    });
    this.setFocusToTop();
  }

  public populateValuesInLocalStorage(): void {
    this.windowService.setLocalStorage(FORM_GROUP_VALUE_LOC_STORAGE,
      JSON.stringify(this.selected.formGroup.value));
    this.windowService.setLocalStorage(META_FIELDS_LOC_STORAGE, JSON.stringify(this.selected.metadataFields));
    this.windowService.setLocalStorage(JURISDICTION_LOC_STORAGE, JSON.stringify(this.selected.jurisdiction));
    if (this.selected.caseType) {
      this.windowService.setLocalStorage(CASE_TYPE_LOC_STORAGE, JSON.stringify(this.selected.caseType));
    }
  }

  public getMetadataFields(): string[] {
    if (this.searchInputs) {
      return this.searchInputs
        .filter(searchInput => searchInput.field.metadata === true)
        .map(searchInput => searchInput.field.id);
    }
  }

  public isSearchable(): boolean {
    let result: boolean;
    result = this.selected.jurisdiction !== undefined && this.selected.jurisdiction !== null;
    result = result && this.selected.caseType !== undefined && this.selected.caseType !== null;
    return result;
  }

  public isSearchableAndSearchInputsReady(): boolean {
    return this.isSearchable() && this.searchInputsReady;
  }

  public onJurisdictionIdChange(): void {
    this.selected.caseType = null;
    this.jurisdictionService.announceSelectedJurisdiction(this.selected.jurisdiction);
    this.selectedJurisdictionCaseTypes = this.selected.jurisdiction.caseTypes;
    this.selectCaseType(this.selectedJurisdictionCaseTypes);
    this.onJurisdiction.emit(this.selected.jurisdiction);
  }

  public onCaseTypeIdChange(): void {
    this.formGroup = new FormGroup({});
    this.searchInputsReady = false;
    this.searchInputs = [];
    this.searchService.getSearchInputs(
      this.selected.jurisdiction.id,
      this.selected.caseType.id
    ).pipe(
      tap(() => this.searchInputsReady = true)
    ).subscribe(searchInputs => {
        this.searchInputs = searchInputs.sort(this.orderService.sortAsc);

        const formValue = this.windowService.getLocalStorage(FORM_GROUP_VALUE_LOC_STORAGE);
        let formValueObject = null;
        if (formValue) {
          formValueObject = JSON.parse(formValue);
        }
        searchInputs.forEach(item => {
          if (item.field.elementPath) {
            item.field.id = item.field.id + '.' + item.field.elementPath;
          }
          item.field.label = item.label;
          if (formValueObject) {
            item.field.value = formValueObject[item.field.id];
          }
        });
        this.getCaseFields();
      }, error => {
        console.log('Search input fields request will be discarded reason: ', error.message);
      });
  }

  public isJurisdictionSelected(): boolean {
    return this.selected.jurisdiction === null ||
      this.selected.jurisdiction === undefined;
  }

  private getQueryParams() {
    // Save filters as query parameters for current route
    const queryParams = {};
    if (this.selected.jurisdiction) {
      queryParams[this.PARAM_JURISDICTION] = this.selected.jurisdiction.id;
    }
    if (this.selected.caseType) {
      queryParams[this.PARAM_CASE_TYPE] = this.selected.caseType.id;
    }
    if (this.selected.caseState) {
      queryParams[this.PARAM_CASE_STATE] = this.selected.caseState.id;
    }
    return queryParams;
  }

  private selectCaseType(caseTypes: CaseTypeLite[]) {
    if (caseTypes && caseTypes.length > 0) {
      this.selected.caseType = caseTypes[0];
      const caseType = this.windowService.getLocalStorage(CASE_TYPE_LOC_STORAGE);
      if (caseType) {
        const caseTypeObject = JSON.parse(caseType);
        const result = caseTypes.filter(c => c.id === caseTypeObject.id);
        if (result !== undefined && result.length > 0) {
          this.selected.caseType = result[0];
        } else {
          this.selected.caseType = caseTypes[0];
        }
      } else {
        this.selected.caseType = caseTypes[0];
      }
      this.onCaseTypeIdChange();
    }
  }

  private setFocusToTop() {
    window.scrollTo(0, 0);

    const topContainer = document.getElementById('search-result-heading__text');
    if (topContainer) {
      topContainer.focus();
    }
  }

  private getCaseFields(): void {
    if (this.searchInputs) {
      this.caseFields = this.searchInputs.map(item => FieldsUtils.convertToCaseField(item.field));
    }
  }
}
