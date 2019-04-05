import { Component, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DisplayMode, Jurisdiction, CaseType, CaseState, SearchResultView, SearchResultViewColumn,
  SearchResultViewItem, CaseField, DRAFT_PREFIX, PaginationMetadata, SortParameters,
  SearchResultViewItemComparator, SortOrder } from '../../domain';
import { FormGroup } from '@angular/forms';
import { ActivityService, SearchResultViewItemComparatorFactory } from '../../services';
import { CaseReferencePipe } from '../../pipes';
import { AbstractAppConfig } from '../../../app.config';

@Component({
  selector: 'ccd-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnChanges {

  public static readonly PARAM_JURISDICTION = 'jurisdiction';
  public static readonly PARAM_CASE_TYPE = 'case-type';
  public static readonly PARAM_CASE_STATE = 'case-state';

  ICON = DisplayMode.ICON;

  @Input()
  jurisdiction: Jurisdiction;

  @Input()
  caseType: CaseType;

  @Input()
  caseState: CaseState;

  @Input()
  resultView: SearchResultView;

  @Input()
  page: number;

  @Input()
  paginationMetadata: PaginationMetadata;

  @Input()
  metadataFields: string[];

  @Output()
  changePage: EventEmitter<any> = new EventEmitter();

  paginationPageSize: number;

  hideRows: boolean;

  selected: {
    init?: boolean,
    jurisdiction?: Jurisdiction,
    caseType?: CaseType,
    caseState?: CaseState,
    formGroup?: FormGroup,
    metadataFields?: string[],
    page?: number
  } = {};

  sortParameters: SortParameters;
  searchResultViewItemComparatorFactory: SearchResultViewItemComparatorFactory;
  draftsCount: number;

  constructor(
    searchResultViewItemComparatorFactory: SearchResultViewItemComparatorFactory,
    appConfig: AbstractAppConfig,
    private activityService: ActivityService,
    private caseReferencePipe: CaseReferencePipe
  ) {
    this.searchResultViewItemComparatorFactory = searchResultViewItemComparatorFactory;
    this.paginationPageSize = appConfig.getPaginationPageSize();
    this.hideRows = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resultView']) {
      this.hideRows = false;

      this.sortParameters = undefined;
      // Clone `resultView` to prevent sorting the external variable
      this.resultView = {
        columns: this.resultView.columns.slice(0),
        results: this.resultView.results.slice(0),
        hasDrafts: this.resultView.hasDrafts
      };

      this.resultView.columns = this.resultView.columns.sort((a: SearchResultViewColumn, b: SearchResultViewColumn) => {
        return a.order - b.order;
      });

      this.hydrateResultView();
      this.draftsCount = this.draftsCount ? this.draftsCount : this.numberOfDrafts();
    }
    if (changes['page']) {
      this.selected.page = (changes['page']).currentValue;
    }
  }

  /**
   * Hydrates result view with case field definitions.
   */
  // A longer term resolution is to move this piece of logic to the backend
  hydrateResultView(): void {
    this.resultView.results.forEach(result => {
      const caseFields = [];

      Object.keys(result.case_fields).forEach(fieldId => {

        const field = result.case_fields[fieldId];

        caseFields.push({
          id: fieldId,
          label: null,
          field_type: {},
          value: field,
          display_context: null,
        });
      });

      result.hydrated_case_fields = caseFields;
      result.columns = {};

      this.resultView.columns.forEach(col => {
        result.columns[col.case_field_id] = this.buildCaseField(col, result);
      });
    });

  }

  goToPage(page): void {
    this.selected.init = false;
    this.selected.jurisdiction = this.jurisdiction;
    this.selected.caseType = this.caseType;
    this.selected.caseState = this.caseState;
    this.selected.metadataFields = this.metadataFields;
    this.selected.page = page;
    // Apply filters
    this.changePage.emit(this.selected);
  }

  buildCaseField(col: SearchResultViewColumn, result: SearchResultViewItem): CaseField {
    return {
      id: col.case_field_id,
      label: col.label,
      field_type: col.case_field_type,
      value: result.case_fields[col.case_field_id],
      display_context: null,
    };
  }

  getColumnsWithPrefix(col: CaseField, result: SearchResultViewItem): CaseField {
    col.value = this.draftPrefixOrGet(col, result);
    return col;
  }

  hasResults(): any {
    return this.resultView.results.length && this.paginationMetadata.total_pages_count;
  }

  hasDrafts(): boolean {
    return this.resultView.hasDrafts();
  }

  comparator(column: SearchResultViewColumn): SearchResultViewItemComparator {
    return this.searchResultViewItemComparatorFactory.createSearchResultViewItemComparator(column);
  }

  sort(column: SearchResultViewColumn) {
    if (this.comparator(column) === undefined) {
      return;
    } else if (this.isSortAscending(column)) {
      this.sortParameters = new SortParameters(this.comparator(column), SortOrder.ASCENDING);
    } else {
      this.sortParameters = new SortParameters(this.comparator(column), SortOrder.DESCENDING);
    }
  }

  sortWidget(column: SearchResultViewColumn) {
    return this.isSortAscending(column) ? '&#9660;' : '&#9650;';
  }

  activityEnabled(): boolean {
    return this.activityService.isEnabled;
  }

  hyphenateIfCaseReferenceOrGet(col, result): any {
    if (col.case_field_id === '[CASE_REFERENCE]') {
      return this.caseReferencePipe.transform(result.case_fields[col.case_field_id])
    } else {
      if (col.id) {
        if (col.id === '[CASE_REFERENCE]') {
          return this.caseReferencePipe.transform(result.case_fields[col.id]);
        } else {
          return result.case_fields[col.id];
        }
      } else {
        return result.case_fields[col.case_field_id];
      }
    }
  }

  draftPrefixOrGet(col, result): any {
    return result.case_id.startsWith(DRAFT_PREFIX) ? DRAFT_PREFIX : this.hyphenateIfCaseReferenceOrGet(col, result);
  }

  private isSortAscending(column: SearchResultViewColumn): boolean {
    let currentSortOrder = this.currentSortOrder(column);

    return currentSortOrder === SortOrder.UNSORTED || currentSortOrder === SortOrder.DESCENDING;
  }

  private currentSortOrder(column: SearchResultViewColumn): SortOrder {

    let isAscending = true;
    let isDescending = true;

    if (this.comparator(column) === undefined) {
      console.warn('Cannot sort: unknown sort comparator for ' + column.case_field_type.type);
      return SortOrder.UNSORTED;
    }
    for (let i = 0; i < this.resultView.results.length - 1; i++) {
      let comparison = this.comparator(column).compare(this.resultView.results[i], this.resultView.results[i + 1]);
      isDescending = isDescending && comparison <= 0;
      isAscending = isAscending && comparison >= 0;
      if (!isAscending && !isDescending) {
        break;
      }
    }
    return isAscending ? SortOrder.ASCENDING : isDescending ? SortOrder.DESCENDING : SortOrder.UNSORTED;
  }

  getFirstResult(): number {
    const currentPage = (this.selected.page ? this.selected.page : 1);
    return ((currentPage - 1) * this.paginationPageSize) + 1 + this.getDraftsCountIfNotPageOne(currentPage);
  }

  getLastResult(): number {
    const currentPage = (this.selected.page ? this.selected.page : 1);
    return ((currentPage - 1) * this.paginationPageSize) + this.resultView.results.length + this.getDraftsCountIfNotPageOne(currentPage);
  }

  getTotalResults(): number {
    return this.paginationMetadata.total_results_count + this.draftsCount;
  }

  private getDraftsCountIfNotPageOne(currentPage): number {
    return currentPage > 1 ? this.draftsCount : 0;
  }
  private numberOfDrafts(): number {
    return this.resultView.results.filter(_ => _.case_id.startsWith(DRAFT_PREFIX)).length;
  }
}
