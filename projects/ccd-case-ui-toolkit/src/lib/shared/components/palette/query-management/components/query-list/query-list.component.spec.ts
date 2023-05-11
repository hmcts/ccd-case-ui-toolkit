import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PartyMessage, PartyMessagesGroup, QueryListData, QueryListItem } from '../../domain';
import { QueryListComponent } from './query-list.component';

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
      declarations: [QueryListComponent]
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
});
