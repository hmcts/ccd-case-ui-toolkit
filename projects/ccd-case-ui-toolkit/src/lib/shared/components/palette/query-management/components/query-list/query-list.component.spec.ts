import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SortOrder } from '../../../complex/sort-order';
import { PartyMessage, PartyMessagesGroup, QueryListData, QueryListItem, queryListColumn } from '../../domain';
import { QueryListComponent } from './query-list.component';

@Pipe({ name: 'rpxTranslate' })
class RpxTranslateMockPipe implements PipeTransform {
  public transform(value: string): string {
    return value;
  }
}

describe('QueryListComponent', () => {
  let component: QueryListComponent;
  let fixture: ComponentFixture<QueryListComponent>;
  let dummyPartyMessageGroup: PartyMessagesGroup;
  let partyMessages: PartyMessage[];

  beforeEach(waitForAsync(() => {
    // First one is parent, rest are children
    partyMessages = [
      {
        id: '111-111',
        subject: 'Subject 1',
        name: 'Name 1',
        body: 'Body 1',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-01-01'),
        createdBy: 'Person A',
      },
      {
        id: '222-222',
        subject: '',
        name: 'Name 2',
        body: 'Body 2',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-02-01'),
        createdBy: 'Person B',
        parentId: '111-111',
      },
      {
        id: '333-333',
        subject: '',
        name: 'Name 3',
        body: 'Body 2',
        attachments: [],
        isHearingRelated: false,
        hearingDate: '',
        createdOn: new Date('2021-03-01'),
        createdBy: 'Person B',
        parentId: '111-111',
      },
    ];

    dummyPartyMessageGroup = {
      partyName: 'Party Name',
      roleOnCase: 'Role on Case',
      partyMessages
    };

    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [QueryListComponent, RpxTranslateMockPipe]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set queryListData on ngChanges', () => {
      expect(component.queryListData).toBeUndefined();
      component.ngOnChanges({
        partyMessageGroup: new SimpleChange(undefined, dummyPartyMessageGroup, false)
      });
      expect(component.queryListData).toBeDefined();
      expect(component.queryListData).toEqual(jasmine.any(QueryListData));
    });

    it('should set queryListData to undefined on ngChanges when partyMessageGroup is undefined', () => {
      component.partyMessageGroup = undefined;
      fixture.detectChanges();
      expect(component.queryListData).toBeUndefined();
    });
  });

  describe('table rendering', () => {
    beforeEach(() => {
      // Required to set queryListData
      component.ngOnChanges({
        partyMessageGroup: new SimpleChange(undefined, dummyPartyMessageGroup, false)
      });
      fixture.detectChanges();
    });

    it('should render table with the correct number of rows (i.e. parent items)', () => {
      const tableRows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(tableRows.length).toEqual(1);
    });

    it('should render the right values in the table', () => {
      const tableRows = fixture.nativeElement.querySelectorAll('tbody tr');
      const tableCells = tableRows[0].querySelectorAll('td');
      const firstRowItem = component.queryListData.partyMessages[0];

      expect(tableCells[0].innerText).toEqual(firstRowItem.subject);
      expect(tableCells[1].innerText).toEqual(firstRowItem.lastSubmittedBy);
      expect(new Date(tableCells[2].innerText)).toEqual(firstRowItem.lastSubmittedDate);
      expect(new Date(tableCells[3].innerText)).toEqual(firstRowItem.lastResponseDate);
      expect(tableCells[4].innerText).toEqual(firstRowItem.lastResponseBy);
    });
  });

  describe('sortTable', () => {
    const partyMes: Partial<QueryListItem>[] = [
      {
        subject: 'value1',
        lastSubmittedBy: 'John',
        lastSubmittedDate: new Date('2023-01-14'),
        lastResponseDate: new Date('2023-01-17'),
        lastResponseBy: ''
      },
      {
        subject: 'value3',
        lastSubmittedBy: '',
        lastSubmittedDate: new Date('2023-01-15'),
        lastResponseDate: new Date('2023-01-15'),
        lastResponseBy: 'Smith'
      },
      {
        subject: 'value2',
        lastSubmittedBy: 'Smith',
        lastSubmittedDate: null,
        lastResponseDate: new Date('2023-01-16'),
        lastResponseBy: ''
      }
    ];

    beforeEach(() => {
      // Required to set queryListData
      component.ngOnChanges({
        partyMessageGroup: new SimpleChange(undefined, dummyPartyMessageGroup, false)
      });
      fixture.detectChanges();
    });

    it('should sort the query list by subject in Ascending order if sortorder is unsorted', () => {
      const col: queryListColumn = { name: 'subject', displayName: 'Queries', sortOrder: SortOrder.UNSORTED }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => (a[col.name] < b[col.name]) ? 1 : -1);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by subject in Descending order if sortorder is Ascending', () => {
      const col: queryListColumn = { name: 'subject', displayName: 'Queries', sortOrder: SortOrder.ASCENDING }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => (a[col.name] > b[col.name]) ? 1 : -1);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by subject in Ascending order if sortorder is Descending', () => {
      const col: queryListColumn = { name: 'subject', displayName: 'Queries', sortOrder: SortOrder.DESCENDING }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => (a[col.name] < b[col.name]) ? 1 : -1);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by response date in Ascending order if sortorder is unsorted', () => {
      const col: queryListColumn = { name: 'lastResponseDate', displayName: 'Last response date', sortOrder: SortOrder.UNSORTED }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => a[col.name] - b[col.name]);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by response date in Descending order if sortorder is Ascending', () => {
      const col: queryListColumn = { name: 'lastResponseDate', displayName: 'Last response date', sortOrder: SortOrder.ASCENDING }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => a[col.name] - b[col.name]);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by response date in Ascending order if sortorder is Descending', () => {
      const col: queryListColumn = { name: 'lastResponseDate', displayName: 'Last response date', sortOrder: SortOrder.DESCENDING }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => b[col.name] - a[col.name]);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by lastSubmittedBy in Ascending order if sortorder is unsorted', () => {
      const col: queryListColumn = { name: 'lastSubmittedBy', displayName: 'Last submitted by', sortOrder: SortOrder.UNSORTED }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => a[col.name] - b[col.name]);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by lastSubmittedDate in Descending order if sortorder is Ascending', () => {
      const col: queryListColumn = { name: 'lastSubmittedDate', displayName: 'Last submission date', sortOrder: SortOrder.ASCENDING }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => a[col.name] - b[col.name]);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('should sort the query list by lastResponseBy in Ascending order if sortorder is Descending', () => {
      const col: queryListColumn = { name: 'lastResponseBy', displayName: 'Response by', sortOrder: SortOrder.DESCENDING }
      component.queryListData.partyMessages = partyMes as QueryListItem[];
      component.sortTable(col);
      const sorted = partyMes.sort((a, b) => b[col.name] - a[col.name]);
      expect(component.queryListData.partyMessages).toEqual(sorted as QueryListItem[]);
    });

    it('sortWidget - should return correct code', () => {
      const col: queryListColumn = { name: 'lastResponseBy', displayName: 'Response by', sortOrder: SortOrder.DESCENDING }    
      expect(component.sortWidget(col)).toEqual('&#9660;');
      col.sortOrder = SortOrder.ASCENDING;   
      expect(component.sortWidget(col)).toEqual('&#9650;');
      col.sortOrder = SortOrder.UNSORTED;
      expect(component.sortWidget(col)).toEqual('&#11047;');
    });
  });
});
