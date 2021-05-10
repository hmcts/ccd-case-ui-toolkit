import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractAppConfig } from '../../../app.config';
import { PlaceholderService } from '../../directives';
import { CaseField, CaseState, CaseType, CaseView, DisplayMode,
  DRAFT_PREFIX, Jurisdiction, PaginationMetadata, SearchResultView, SearchResultViewColumn,
  SearchResultViewItem, SearchResultViewItemComparator, SortOrder, SortParameters } from '../../domain';
import { CaseReferencePipe } from '../../pipes';
import { ActivityService, SearchResultViewItemComparatorFactory, BrowserService } from '../../services';

@Component({
  selector: 'ccd-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnChanges, OnInit {

  public static readonly PARAM_JURISDICTION = 'jurisdiction';
  public static readonly PARAM_CASE_TYPE = 'case-type';
  public static readonly PARAM_CASE_STATE = 'case-state';

  ICON = DisplayMode.ICON;

  @Input()
  caseLinkUrlTemplate: string;

  @Input()
  jurisdiction: Jurisdiction;

  @Input()
  caseType: CaseType;

  @Input()
  caseState: CaseState;

  @Input()
  caseFilterFG: FormGroup;

  @Input()
  resultView: SearchResultView;

  @Input()
  page: number;

  @Input()
  paginationMetadata: PaginationMetadata;

  @Input()
  metadataFields: string[];

  @Input()
  public selectionEnabled = false;

  @Input()
  public showOnlySelected = false;

  @Input()
  public preSelectedCases: SearchResultViewItem[] = [];

  @Input()
  public consumerSortingEnabled = false;

  @Output()
  public selection = new EventEmitter<SearchResultViewItem[]>();

  @Output()
  changePage: EventEmitter<any> = new EventEmitter();

  @Output()
  clickCase: EventEmitter<any> = new EventEmitter();

  @Output()
  sortHandler: EventEmitter<any> = new EventEmitter();

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

  consumerSortParameters: { column: string, order: SortOrder, type: string } = { column: null, order: null, type: null };

  public selectedCases: SearchResultViewItem[] = [];

  constructor(
    searchResultViewItemComparatorFactory: SearchResultViewItemComparatorFactory,
    appConfig: AbstractAppConfig,
    private activityService: ActivityService,
    private caseReferencePipe: CaseReferencePipe,
    private placeholderService: PlaceholderService,
    private browserService: BrowserService
  ) {
    this.searchResultViewItemComparatorFactory = searchResultViewItemComparatorFactory;
    this.paginationPageSize = appConfig.getPaginationPageSize();
    this.hideRows = false;
  }

  ngOnInit(): void {
    if (this.preSelectedCases) {
      for (const preSelectedCase of this.preSelectedCases) {
        if (this.selectedCases && !this.selectedCases.some(aCase => aCase.case_id === preSelectedCase.case_id)) {
          this.selectedCases.push(preSelectedCase);
        }
      }
    }
    this.selection.emit(this.selectedCases);
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

  public clearSelection(): void {
    this.selectedCases = [];
    this.selection.emit(this.selectedCases);
  }

  public canBeShared(caseView: SearchResultViewItem): boolean {
    return caseView.supplementary_data && caseView.supplementary_data.hasOwnProperty('orgs_assigned_users');
  }

  public canAnyBeShared(): boolean {
    for (let i = 0, l = this.resultView.results.length; i < l; i++) {
      if (this.canBeShared(this.resultView.results[i])) {
        return true;
      }
    }
    return false;
  }

  public selectAll(): void {
    if (this.allOnPageSelected()) {
      // all cases already selected, so unselect all on this page
      this.resultView.results.forEach(c => {
        this.selectedCases.forEach((s, i) => {
          if (c.case_id === s.case_id) {
            this.selectedCases.splice(i, 1);
          }
        });
      });
    } else {
      this.resultView.results.forEach(c => {
        if (!this.isSelected(c) && this.canBeShared(c)) {
          this.selectedCases.push(c);
        }
      });
    }
    this.selection.emit(this.selectedCases);
  }

  public changeSelection(c: SearchResultViewItem): void {
    if (this.isSelected(c)) {
      this.selectedCases.forEach((s, i) => {
        if (c.case_id === s.case_id) {
          this.selectedCases.splice(i, 1);
        }
      });
    } else {
      if (this.canBeShared(c)) {
        this.selectedCases.push(c);
      }
    }
    this.selection.emit(this.selectedCases);
  }

  public isSelected(c: SearchResultViewItem): boolean {
    for (let i = 0, l = this.selectedCases.length; i < l; i++) {
      if (c.case_id === this.selectedCases[i].case_id) {
        return true;
      }
    }
    return false;
  }

  public allOnPageSelected(): boolean {
    let canBeSharedCount = 0;
    for (let i = 0, l = this.resultView.results.length; i < l; i++) {
      let r = this.resultView.results[i];
      if (this.canBeShared(r)) {
        canBeSharedCount ++;
      }
      if (!this.isSelected(r) && this.canBeShared(r)) {
        return false;
      }
    }
    if (canBeSharedCount === 0) {
      return false;
    }
    return true;
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

        caseFields.push(Object.assign(new CaseField(), {
          id: fieldId,
          label: null,
          field_type: {},
          value: field,
          display_context: null,
        }));
      });

      result.hydrated_case_fields = caseFields;
      result.columns = {};

      this.resultView.columns.forEach(col => {
        result.columns[col.case_field_id] = this.buildCaseField(col, result);
      });
    });

  }

  goToPage(page): void {
    this.hideRows = true;
    this.selected.init = false;
    this.selected.jurisdiction = this.jurisdiction;
    this.selected.caseType = this.caseType;
    this.selected.caseState = this.caseState;
    this.selected.formGroup = this.caseFilterFG;
    this.selected.metadataFields = this.metadataFields;
    this.selected.page = page;
    // Apply filters
    let queryParams = {};
    queryParams[SearchResultComponent.PARAM_JURISDICTION] = this.selected.jurisdiction ? this.selected.jurisdiction.id : null;
    queryParams[SearchResultComponent.PARAM_CASE_TYPE] = this.selected.caseType ? this.selected.caseType.id : null;
    queryParams[SearchResultComponent.PARAM_CASE_STATE] = this.selected.caseState ? this.selected.caseState.id : null;
    this.changePage.emit({
      selected: this.selected,
      queryParams: queryParams
    });

    const topContainer = document.getElementById('top');
    if (topContainer) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      topContainer.focus();
    }
  }

  buildCaseField(col: SearchResultViewColumn, result: SearchResultViewItem): CaseField {
    return Object.assign(new CaseField(), {
      id: col.case_field_id,
      label: col.label,
      field_type: col.case_field_type,
      value: result.case_fields[col.case_field_id],
      display_context: null,
    });
  }

  getColumnsWithPrefix(col: CaseField, result: SearchResultViewItem): CaseField {
    col.value = this.draftPrefixOrGet(col, result);
    col.value = this.placeholderService.resolvePlaceholders(result.case_fields, col.value);
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
    if (this.consumerSortingEnabled) {
      if (column.case_field_id !== this.consumerSortParameters.column) {
        this.consumerSortParameters.order = SortOrder.DESCENDING;
      } else {
        this.consumerSortParameters.order = this.consumerSortParameters.order === SortOrder.DESCENDING ?
                                            SortOrder.ASCENDING :
                                            SortOrder.DESCENDING;
      }
      this.consumerSortParameters.column = column.case_field_id;
      this.consumerSortParameters.type = column.case_field_type.type;
      this.sortHandler.emit(this.consumerSortParameters);
    } else {
      if (this.comparator(column) === undefined) {
        return;
      } else if (this.isSortAscending(column)) {
        this.sortParameters = new SortParameters(this.comparator(column), SortOrder.ASCENDING);
      } else {
        this.sortParameters = new SortParameters(this.comparator(column), SortOrder.DESCENDING);
      }
    }
  }

  sortWidget(column: SearchResultViewColumn) {
    let condition = false;
    if (this.consumerSortingEnabled) {
      const isColumn = column.case_field_id === this.consumerSortParameters.column;
      const isAscending = this.consumerSortParameters.order === SortOrder.ASCENDING;
      condition = !isColumn || (isColumn && isAscending);
    } else {
      condition = this.isSortAscending(column);
    }

    return condition ? '&#9660;' : '&#9650;';
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

  prepareCaseLinkUrl(caseId: string): string {
    let url = this.caseLinkUrlTemplate;
    url = url.replace('jurisdiction_id', this.jurisdiction.id);
    url = url.replace('caseType_id', this.caseType.id);
    url = url.replace('case_id', caseId);

    return url;
  }

  private getDraftsCountIfNotPageOne(currentPage): number {
    return currentPage > 1 ? this.draftsCount : 0;
  }

  private numberOfDrafts(): number {
    return this.resultView.results.filter(_ => _.case_id.startsWith(DRAFT_PREFIX)).length;
  }

  goToCase(caseId: string) {
    this.clickCase.emit({
      caseId: caseId
    });
  }

  onKeyUp($event: KeyboardEvent, c: SearchResultViewItem): void {
    if ($event.key === 'Space') {
      if (this.browserService.isFirefox || this.browserService.isSafari || this.browserService.isIEOrEdge) {
        this.changeSelection(c);
      }
    }
  }
}
