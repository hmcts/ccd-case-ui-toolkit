import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultComponent } from './search-result.component';
import { Component, DebugElement, Input, NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { PaginatePipe, PaginationService } from 'ngx-pagination';
import { FormGroup } from '@angular/forms';
import {
  CaseState,
  CaseType,
  CaseView,
  DRAFT_PREFIX,
  Jurisdiction,
  PaginationMetadata,
  SearchResultView,
  SearchResultViewItem
} from '../../domain';
import { CaseReferencePipe, SortSearchResultPipe } from '../../pipes';
import { ActivityService, FieldsUtils, SearchResultViewItemComparatorFactory } from '../../services';
import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { PlaceholderService } from '../../directives';
import createSpyObj = jasmine.createSpyObj;

@Component({
  selector: 'ccd-field-read',
  template: `{{caseField.value}}`
})
class FieldReadComponent {
  @Input()
  caseField: string;
}

describe('SearchResultComponent', () => {

  describe('with results', () => {

    const JURISDICTION: Jurisdiction = {
      id: 'TEST',
      name: 'Test',
      description: 'Test Jurisdiction',
      caseTypes: []
    };
    const CASE_TYPE: CaseType = {
      id: 'TEST_CASE_TYPE',
      name: 'Test Case Type',
      description: 'A test Case Type',
      states: [],
      events: [],
      case_fields: [],
      jurisdiction: JURISDICTION
    };
    const CASE_STATE: CaseState = {
      id: 'TEST_STATE',
      name: 'Test Case State',
      description: 'A test Case State'
    };
    const PAGINATION_METADATA: PaginationMetadata = {
      total_results_count: 3,
      total_pages_count: 1
    };
    const METADATA_FIELDS: string[] = ['state'];
    const RESULT_VIEW: SearchResultView = {
      columns: [
        {
          case_field_id: 'PersonFirstName',
          case_field_type: {
            id: 'Text',
            type: 'Text'
          },
          label: 'First name',
          order: 2
        },
        {
          case_field_id: 'PersonLastName',
          case_field_type: {
            id: 'Text',
            type: 'Text'
          },
          label: 'Last name',
          order: 1
        },
        {
          case_field_id: 'PersonAddress',
          case_field_type: {
            id: 'Text',
            type: 'Complex'
          },
          label: 'Address',
          order: 1
        }
      ],
      results: [
        {
          case_id: 'DRAFT190',
          case_fields: {
            PersonFirstName: 'Jason',
            PersonLastName: 'Smith',
            PersonAddress: 'Blackheath, Granville Park, Lewisham, England, SE13 7DW'
          }
        },
        {
          case_id: '0000000000000000',
          case_fields: {
            PersonFirstName: 'Janet',
            PersonLastName: 'Parker',
            PersonAddress: '123, Fake Street, Hexton, England, HX08 UTG'
          }
        },
        {
          case_id: '0000000000000001',
          case_fields: {
            PersonFirstName: 'Steve',
            PersonLastName: 'Jobs',
            PersonAddress: '1 Infinite Loop, Cupertino, California, USA, CA 95014'
          }
        },
        {
          case_id: '0000000000000002',
          case_fields: {
            PersonFirstName: 'Bill',
            PersonAddress: 'Thames Valley Park, Sonning, Reading, England, RG6 1WA'
          }
        }
      ],
      hasDrafts: () => false
    };

    const switchMap = {
      switchMap: () => ({
        retryWhen: () => ({
          subscribe: () => ({})
        })
      })
    };

    let fixture: ComponentFixture<SearchResultComponent>;
    let component: SearchResultComponent;
    let de: DebugElement;
    let CaseActivityComponent: any = MockComponent({
      selector: 'ccd-activity',
      inputs: ['caseId', 'displayMode']
    });
    let activityService: any;
    let searchHandler;
    let appConfig: any;
    let caseReferencePipe = new CaseReferencePipe();

    beforeEach(async(() => {
      activityService = createSpyObj<ActivityService>('activityService', ['postActivity']);
      activityService.postActivity.and.returnValue(switchMap);
      activityService.isEnabled = true;

      searchHandler = createSpyObj('searchHandler', ['applyFilters', 'navigateToCase']);

      appConfig = createSpyObj('appConfig', ['getPaginationPageSize']);
      appConfig.getPaginationPageSize.and.returnValue(25);

      TestBed
        .configureTestingModule({
          imports: [
            RouterTestingModule
          ],
          declarations: [
            FieldReadComponent,
            SearchResultComponent,
            SortSearchResultPipe,
            CaseReferencePipe,
            // Mocks
            CaseActivityComponent,
            PaginatePipe
          ],
          schemas: [NO_ERRORS_SCHEMA],
          providers: [
            PlaceholderService,
            FieldsUtils,
            SearchResultViewItemComparatorFactory,
            { provide: ActivityService, useValue: activityService },
            PaginationService,
            { provide: AppConfig, useValue: appConfig },
            { provide: CaseReferencePipe, useValue: caseReferencePipe }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(SearchResultComponent);
      component = fixture.componentInstance;

      component.changePage.subscribe(searchHandler.applyFilters);
      component.caseLinkUrlTemplate = '/case/jurisdiction_id/caseType_id/case_id';
      component.jurisdiction = JURISDICTION;
      component.caseType = CASE_TYPE;
      component.resultView = RESULT_VIEW;
      component.caseState = CASE_STATE;
      component.paginationMetadata = PAGINATION_METADATA;
      component.caseFilterFG = new FormGroup({});
      component.metadataFields = METADATA_FIELDS;
      component.ngOnChanges({ resultView: new SimpleChange(null, RESULT_VIEW, true) });

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render pagination header', () => {
      let pagination = de.query(By.css('div.pagination-top'));
      expect(pagination).toBeTruthy();
      expect(pagination.nativeElement.textContent.trim()).toBe('Displaying 1 - 4 out of 4 results');
    });

    it('should render a table <thead> and <tbody>', () => {
      let table = de.query(By.css('div>table'));
      expect(table.nativeElement.tagName).toBe('TABLE');
      expect(table.children.length).toBe(3);
      let thead = de.query(By.css('div>table>thead'));
      expect(thead.nativeElement.tagName).toBe('THEAD');
      expect(thead.children.length).toBe(1);
      let tbody = de.query(By.css('div>table>tbody'));
      expect(tbody.nativeElement.tagName).toBe('TBODY');
    });

    it('should render pagination controls if results and metadata not empty', () => {
      let pagination = de.queryAll(By.css('pagination-controls.pagination'));

      expect(pagination.length).toBeTruthy();
    });

    it('should render columns based on SearchResultView', () => {

      let headRow = de.query(By.css('div>table>thead>tr'));
      // added +1 for case activity column
      expect(headRow.children.length).toBe(RESULT_VIEW.columns.length + 1);
      RESULT_VIEW.columns.forEach(col => {
        expect(headRow.children.find(c => c.nativeElement.textContent.trim().startsWith(col.label)))
          .toBeTruthy(`Could not find header ${col.label}`);
      });
    });

    it('should render columns based on SearchResultView without activity column when disabled', () => {
      activityService = fixture.debugElement.injector.get(ActivityService);
      activityService.isEnabled = false;
      fixture.detectChanges();

      let headRow = de.query(By.css('div>table>thead>tr'));

      expect(headRow.children.length).toBe(RESULT_VIEW.columns.length);
    });

    it('should display case reference with hyphens', () => {
      let caseReference = de.query(By.css('div>table>tbody tr:nth-child(4) td:nth-child(1) a'));
      expect(caseReference.nativeElement.textContent.trim()).toBe('0000-0000-0000-0002');
    });

    it('should sort columns with higher order last', () => {
      let lastHeader = de.query(By.css('div>table>thead>tr th:nth-child(3)')).nativeElement.textContent.trim();

      expect(lastHeader.startsWith(RESULT_VIEW.columns[0].label)).toBe(true);

      let lastValue = de.query(By.css('div>table>tbody tr:nth-child(1) td:nth-child(3)')).nativeElement.textContent.trim();
      expect(lastValue.startsWith(RESULT_VIEW.results[0].case_fields['PersonFirstName'])).toBe(true);
    });

    it('should keep order of columns with same order', () => {
      let lastHeader = de.query(By.css('div>table>thead>tr th:nth-child(1)')).nativeElement.textContent.trim();
      expect(lastHeader.startsWith(RESULT_VIEW.columns[1].label)).toBe(true);

      let lastValue = de.query(By.css('div>table>tbody tr:nth-child(2) td:nth-child(1)')).nativeElement.textContent.trim();

      expect(lastValue.startsWith(RESULT_VIEW.results[1].case_fields['PersonLastName'])).toBe(true);
    });

    it('should render one row for each SearchResultViewItem', () => {
      let tbody = de.query(By.css('div>table>tbody'));

      expect(tbody.children.length).toEqual(RESULT_VIEW.results.length);
    });

    it('should render required columns for each SearchResultViewItem row', () => {
      let firstRow = de.query(By.css('div>table>tbody tr:nth-child(1)'));
      // added +1 for case activity column
      expect(firstRow.children.length).toBe(RESULT_VIEW.columns.length + 1);
      // draft
      let firstRowFirstCol = de.query(By.css('div>table>tbody tr:nth-child(1) td:nth-child(1) a'));

      expect(firstRowFirstCol.nativeElement.textContent.trim()).toBe(DRAFT_PREFIX);

      let firstRowComponent = firstRow.children.slice(1, 3);
      let firstRowResult = RESULT_VIEW.results[0];
      expect(firstRowComponent[1].children[0].children[0].componentInstance.caseField.value).toEqual(firstRowResult
        .case_fields['PersonFirstName']);
      expect(firstRowComponent[0].children[0].children[0].componentInstance.caseField.value).toEqual(firstRowResult
        .case_fields['PersonAddress']);
      let secondRow = de.query(By.css('div>table>tbody tr:nth-child(2)'));
      let secondResult = RESULT_VIEW.results[1];

      // case
      let secondRowFirstCol = de.query(By.css('div>table>tbody tr:nth-child(2) td:nth-child(1) a'));
      expect(secondRowFirstCol.nativeElement.textContent.trim()).toBe(secondResult.case_fields['PersonLastName']);

      let secondRowComponent = secondRow.children.slice(1, 3);
      let secondRowResult = RESULT_VIEW.results[1];

      expect(secondRowComponent[0].children[0].children[0].componentInstance.caseField.value).toEqual(secondRowResult
        .case_fields['PersonAddress']);
      expect(secondRowComponent[1].children[0].children[0].componentInstance.caseField.value).toEqual(secondRowResult
        .case_fields['PersonFirstName']);
    });

    it('should render an case activity column with header', () => {
      let headRow = de.query(By.css('div>table>thead>tr th:nth-child(4)'));

      expect(headRow.nativeElement.textContent).toBe('');
    });

    it('should not render an case activity column when activity is disabled', () => {
      activityService = fixture.debugElement.injector.get(ActivityService);
      activityService.isEnabled = false;
      fixture.detectChanges();

      let headRow = de.query(By.css('div>table>thead>tr th:nth-child(5)'));

      expect(headRow).toBeNull();
    });

    it('should not display error message when results present', () => {
      let error = de.query(By.css('div.notification'));

      expect(error).toBeFalsy();
    });

    it('should emit correct page if go to page triggered', () => {
      component.goToPage(2);

      let selected = {
        init: false,
        jurisdiction: JURISDICTION,
        caseType: CASE_TYPE,
        caseState: CASE_STATE,
        formGroup: jasmine.any(Object),
        metadataFields: METADATA_FIELDS,
        page: 2
      };

      expect(component.selected.page).toBe(2);
      expect(searchHandler.applyFilters).toHaveBeenCalledWith({
        selected: selected,
        queryParams: {jurisdiction: selected.jurisdiction.id, 'case-type': selected.caseType.id, 'case-state': selected.caseState.id}
      });
    });

    it('should replace the caseLink url placeholders with a valid data', () => {
      let id = 'ID001';
      let url = component.prepareCaseLinkUrl(id);
      expect(url).toBe('/case/' + JURISDICTION.id + '/' + CASE_TYPE.id + '/' + id);
    });

    it('should select correct page if new page triggered from outside', () => {
      component.ngOnChanges({ page: new SimpleChange(null, 5, true) });
      fixture.detectChanges();

      expect(component.selected.page).toBe(5);
    });

    it('should calculate correct values for first, last and total number of results', () => {
      component.draftsCount = 4;
      component.paginationMetadata = {
        total_results_count: 105,
        total_pages_count: 5
      };
      component.ngOnChanges({ page: new SimpleChange(null, 5, true) });
      fixture.detectChanges();

      let firstResult = component.getFirstResult();
      let lastResult = component.getLastResult();
      let totalResults = component.getTotalResults();

      expect(firstResult).toBe(105);
      expect(lastResult).toBe(108);
      expect(totalResults).toBe(109);
    });

    it('should render widget matching ordering (defaulting to sort descending if unordered) and sort rows when widget pressed', () => {
      let sortFirstNameLink = de.query(By.css('div>table>thead>tr th:nth-child(3) table tbody a'));
      let sortLastNameLink = de.query(By.css('div>table>thead>tr th:nth-child(1) table tbody a'));

      expect(sortFirstNameLink.nativeElement.textContent).toBe('▼');
      expect(sortLastNameLink.nativeElement.textContent).toBe('▲');

      // Check unordered
      assertOrder(new Array(0, 1, 2, 3));

      sortFirstNameLink.triggerEventHandler('click', null);
      fixture.detectChanges();
      assertOrder(new Array(2, 0, 1, 3));

      sortFirstNameLink.triggerEventHandler('click', null);
      fixture.detectChanges();
      assertOrder(new Array(3, 1, 0, 2));
    });

    function assertOrder(order: Array<number>) {
      let firstField = de.query(By.css('div>table>tbody tr:nth-child(1) td:nth-child(3) div ccd-field-read')).nativeElement.textContent;
      let secondField = de.query(By.css('div>table>tbody tr:nth-child(2) td:nth-child(3) div ccd-field-read')).nativeElement.textContent;
      let thirdField = de.query(By.css('div>table>tbody tr:nth-child(3) td:nth-child(3) div ccd-field-read')).nativeElement.textContent;
      let fourthField = de.query(By.css('div>table>tbody tr:nth-child(4) td:nth-child(3) div ccd-field-read')).nativeElement.textContent;

      expect(firstField).toBe(RESULT_VIEW.results[order[0]].case_fields['PersonFirstName']);
      expect(secondField).toBe(RESULT_VIEW.results[order[1]].case_fields['PersonFirstName']);
      expect(thirdField).toBe(RESULT_VIEW.results[order[2]].case_fields['PersonFirstName']);
      expect(fourthField).toBe(RESULT_VIEW.results[order[3]].case_fields['PersonFirstName']);
    }

    it('should not break while sorting with unknown sort comparators like Complex type Address', () => {
      let complexType = de.query(By.css('div>table>thead>tr th:nth-child(2) table tbody div'));
      complexType.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(complexType.nativeElement.textContent).toBe('Address');
    });

    it('should render case reference value in first column with hyperlink if not draft and first column field value is null', () => {
      let fourthRowFirstCol = de.query(By.css('div>table>tbody tr:nth-child(4) td:nth-child(1) a'));

      expect(fourthRowFirstCol.nativeElement.textContent.trim()).toBe(new CaseReferencePipe().transform(RESULT_VIEW.results[3].case_id));
    });

    it('should render DRAFT value in first column with hyperlink if case_id is DRAFT prefixed even if first column not null', () => {
      let firstRowFirstCol = de.query(By.css('div>table>tbody tr:nth-child(1) td:nth-child(1) a'));
      expect(firstRowFirstCol.nativeElement.textContent.trim()).toBe(DRAFT_PREFIX);
    });

    it('should de select the cases', () => {
      component.clearSelection();
      expect(component.selectedCases.length).toEqual(0);
    });

    it('can be shared', () => {
      const caseView:CaseView  = new CaseView();
      expect(component.canBeShared(caseView)).toEqual(true);
    });

    it('check if case is selected', () => {
      component.selectedCases = [{
        case_id: '1',
        case_fields: null
      }, {
        case_id: '2',
        case_fields: null
      }]

      const tempCaseItem:SearchResultViewItem={
        case_id: '1',
        case_fields: null
      }

      expect(component.isSelected(tempCaseItem)).toBeTruthy();

    });

    it('check if case is not selected', () => {
      component.selectedCases = [{
        case_id: '1',
        case_fields: null
      }, {
        case_id: '2',
        case_fields: null
      }]

      const tempCaseItem:SearchResultViewItem={
        case_id: '3',
        case_fields: null
      }

      expect(component.isSelected(tempCaseItem)).toBeFalsy();

    });



    it('select all cases is enabled', () => {
      component.selectedCases = [{
        case_id: '1',
        case_fields: null
      }]

      const tempCaseItem: SearchResultViewItem = {
        case_id: '1',
        case_fields: null
      }
      component.isSelected(tempCaseItem);
      component.allOnPageSelected();
      component.selectAll();
    });

  });

  describe('without results', () => {
    const PAGINATION_METADATA: PaginationMetadata = {
      total_results_count: 0,
      total_pages_count: 0
    };
    const RESULT_VIEW: SearchResultView = {
      columns: [
        {
          case_field_id: 'PersonFirstName',
          case_field_type: {
            id: 'Text',
            type: 'Text'
          },
          label: 'First name',
          order: 2
        },
        {
          case_field_id: 'PersonLastName',
          case_field_type: {
            id: 'Text',
            type: 'Text'
          },
          label: 'Last name',
          order: 1
        },
        {
          case_field_id: 'PersonAddress',
          case_field_type: {
            id: 'Text',
            type: 'Text'
          },
          label: 'Address',
          order: 1
        }
      ],
      results: [],
      hasDrafts: () => false
    };

    let fixture: ComponentFixture<SearchResultComponent>;
    let component: SearchResultComponent;
    let de: DebugElement;

    const switchMap = {
      switchMap: () => ({
        retryWhen: () => ({
          subscribe: () => ({})
        })
      })
    };

    let CaseActivityComponent: any = MockComponent({
      selector: 'ccd-activity',
      inputs: ['caseId', 'displayMode']
    });
    let activityService: any;
    let appConfig: any;
    let caseReferencePipe = new CaseReferencePipe();

    beforeEach(async(() => {
      activityService = createSpyObj<ActivityService>('activityService', ['postActivity']);
      activityService.postActivity.and.returnValue(switchMap);
      appConfig = createSpyObj('appConfig', ['getPaginationPageSize']);
      appConfig.getPaginationPageSize.and.returnValue(25);
      TestBed
        .configureTestingModule({
          imports: [
            RouterTestingModule
          ],
          declarations: [
            FieldReadComponent,
            SearchResultComponent,
            SortSearchResultPipe,
            CaseReferencePipe,
            // Mocks
            CaseActivityComponent,
            PaginatePipe
          ],
          schemas: [NO_ERRORS_SCHEMA],
          providers: [
            PlaceholderService,
            FieldsUtils,
            SearchResultViewItemComparatorFactory,
            { provide: ActivityService, useValue: activityService },
            PaginationService,
            { provide: AppConfig, useValue: appConfig },
            { provide: CaseReferencePipe, useValue: caseReferencePipe }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(SearchResultComponent);
      component = fixture.componentInstance;

      component.resultView = RESULT_VIEW;
      component.paginationMetadata = PAGINATION_METADATA;
      component.ngOnChanges({ resultView: new SimpleChange(null, RESULT_VIEW, true) });

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should display error message when no results', () => {
      let error = de.query(By.css('div.notification'));

      expect(error).toBeTruthy();
    });

    it('should not display table when no results', () => {
      const NON_EMPTY_PAGINATION_METADATA: PaginationMetadata = {
        total_results_count: 1,
        total_pages_count: 1
      };
      component.paginationMetadata = NON_EMPTY_PAGINATION_METADATA;

      fixture.detectChanges();

      let table = de.query(By.css('table'));

      expect(table).toBeFalsy();
    });

    it('should not display table when no pagination metadata', () => {
      component.resultView.results.push(new SearchResultViewItem());

      fixture.detectChanges();

      let table = de.query(By.css('table'));

      expect(table).toBeFalsy();
    });

    it('should not display pagination controls when no results', () => {
      const NON_EMPTY_PAGINATION_METADATA: PaginationMetadata = {
        total_results_count: 1,
        total_pages_count: 1
      };
      component.paginationMetadata = NON_EMPTY_PAGINATION_METADATA;

      fixture.detectChanges();

      let pagination = de.queryAll(By.css('pagination-controls.pagination'));

      expect(pagination.length).toBeFalsy();
    });

    it('should not display pagination controls when no metadata', () => {
      component.resultView.results.push(new SearchResultViewItem());

      fixture.detectChanges();

      let pagination = de.queryAll(By.css('pagination-controls.pagination'));

      expect(pagination.length).toBeFalsy();
    });

    it('should not display pagination header when no metadata', () => {
      component.resultView.results.push(new SearchResultViewItem());

      fixture.detectChanges();

      let pagination = de.query(By.css('div.pagination-top'));
      expect(pagination).toBeFalsy();
    });



  });
});
