import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { QueryListItem } from '../../models';
import { QueryDetailsComponent } from './query-details.component';

describe('QueryDetailsComponent', () => {
  let component: QueryDetailsComponent;
  let fixture: ComponentFixture<QueryDetailsComponent>;

  const items = [
    {
      id: '222-222',
      subject: '',
      name: 'Name 2',
      body: 'Body 2',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2021-02-01'),
      createdBy: 'Person A',
      parentId: '111-111',
      children: []
    },
    {
      id: '333-333',
      subject: '',
      name: 'Name 3',
      body: 'Body 3',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2021-03-01'),
      createdBy: 'Person B',
      parentId: '111-111',
      children: []
    },
    {
      id: '444-444',
      subject: '',
      name: 'Name 4',
      body: 'Body 4',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2020-03-01'),
      createdBy: 'Person C',
      parentId: '222-222'
    },
    // lastSubmittedBy
    {
      id: '555-555',
      subject: '',
      name: 'Name 5',
      body: 'Body 5',
      attachments: [],
      isHearingRelated: false,
      hearingDate: '',
      createdOn: new Date('2023-06-01'),
      createdBy: 'Person D',
      parentId: '444-444',
    }
  ];

  const childrenItems = items.map(item => {
    const listItem = new QueryListItem();
    Object.assign(listItem, item);
    return listItem;
  });

  const queryListItem = new QueryListItem();
  Object.assign(queryListItem, {
    id: '111-111',
    subject: 'Subject 1',
    name: 'Name 1',
    body: 'Body 1',
    attachments: [
      {
        _links: {
          self: {
            href: 'https://hmcts.internal/documents/111-111'
          },
          binary: {
            href: 'https://hmcts.internal/documents/111-111/binary'
          }
        },
        originalDocumentName: 'Document 1'
      }
    ],
    isHearingRelated: true,
    hearingDate: new Date('2023-06-29'),
    createdOn: new Date('2023-06-25'),
    createdBy: 'Person A',
    children: [
      childrenItems[0],
      childrenItems[1],
      {
        ...childrenItems[2],
        children: [
          // lastSubmittedBy
          childrenItems[3]
        ]
      }
    ]
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        QueryDetailsComponent,
        MockRpxTranslatePipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryDetailsComponent);
    component = fixture.componentInstance;
    component.query = queryListItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event on clcking back to queries', () => {
    spyOn(component.backClicked, 'emit');
    component.onBack();
    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  it('should verify table column names for response', () => {
    const tables = fixture.debugElement.queryAll(By.css('.query-details-table'));
    const columnHeaders = tables[0].queryAll(By.css('.govuk-table__header'));
    expect(columnHeaders[0].nativeElement.textContent.trim()).toEqual('Last response date');
    expect(columnHeaders[1].nativeElement.textContent.trim()).toEqual('Response detail');
    expect(columnHeaders[2].nativeElement.textContent.trim()).toEqual('Attachments');
  });

  it('should verify table column names for follow-up', () => {
    const tables = fixture.debugElement.queryAll(By.css('.query-details-table'));
    const columnHeaders = tables[1].queryAll(By.css('.govuk-table__header'));
    expect(columnHeaders[0].nativeElement.textContent.trim()).toEqual('Last submission date');
    expect(columnHeaders[1].nativeElement.textContent.trim()).toEqual('Last submitted by');
    expect(columnHeaders[2].nativeElement.textContent.trim()).toEqual('Query detail');
    expect(columnHeaders[3].nativeElement.textContent.trim()).toEqual('Attachments');
  });
});
