import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SessionStorageService } from '../../../../../services';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { QueryListItem } from '../../models';
import { QueryDetailsComponent } from './query-details.component';
import { Constants } from '../../../../../commons/constants';

describe('QueryDetailsComponent', () => {
  let component: QueryDetailsComponent;
  let fixture: ComponentFixture<QueryDetailsComponent>;
  const mockSessionStorageService = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);

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
      parentId: '444-444'
    }
  ];

  const childrenItems = items.map((item) => {
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
      {
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
        body: 'wqqwwq',
        children: [],
        createdBy: 'b05ee329-2d86-4e8a-b3fb-732739ed0a86',
        createdOn: '2024-11-06T00:14:39.074Z',
        hearingDate: null,
        id: 'de95f8b1-961a-4d99-a487-77afb1ce4634',
        isHearingRelated: 'No',
        name: 'Name 1',
        parentId: '111-111',
        subject: 'tets'
      },
      {
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
        body: 'wqqwwq',
        children: [],
        createdBy: 'b05ee329-',
        createdOn: '2024-11-06T00:14:39.074Z',
        hearingDate: null,
        id: 'de95f8b1',
        isHearingRelated: 'No',
        name: 'Name 1',
        parentId: '111-111',
        subject: 'tets'
      }
    ]
  });

  const USER = {
    roles: [
      'caseworker'
    ]
  };

  const snapshotActivatedRoute = {
    snapshot: {
      params: {
        qid: '123'
      }
    }
  };

  beforeEach(async () => {
    mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
    await TestBed.configureTestingModule({
      declarations: [
        QueryDetailsComponent,
        MockRpxTranslatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: SessionStorageService, useValue: mockSessionStorageService },
        { provide: ActivatedRoute, useValue: snapshotActivatedRoute }
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

  it('should emit event on clcking back to query list', () => {
    spyOn(component.backClicked, 'emit');
    component.onBack();
    expect(component.backClicked.emit).toHaveBeenCalled();
  });

  it('should verify table column names for response', () => {
    const tables = fixture.debugElement.queryAll(By.css('.query-details-table'));
    const columnHeaders = tables[1].queryAll(By.css('.govuk-table__header'));
    expect(columnHeaders[0].nativeElement.textContent.trim()).toEqual('Last response date');
    expect(columnHeaders[1].nativeElement.textContent.trim()).toEqual('Caseworker name');
    expect(columnHeaders[2].nativeElement.textContent.trim()).toEqual('Response detail');
    expect(columnHeaders[3].nativeElement.textContent.trim()).toEqual('Attachments');
  });

  it('should verify table column names for follow-up', () => {
    const tables = fixture.debugElement.queryAll(By.css('.query-details-table'));
    const columnHeaders = tables[2].queryAll(By.css('.govuk-table__header'));
    expect(columnHeaders[0].nativeElement.textContent.trim()).toEqual('Last submission date');
    expect(columnHeaders[1].nativeElement.textContent.trim()).toEqual('Last submitted by');
    expect(columnHeaders[2].nativeElement.textContent.trim()).toEqual('Query detail');
    expect(columnHeaders[3].nativeElement.textContent.trim()).toEqual('Attachments');
  });

  it('should call toggleLinkVisibility when ngOnChanges is called', () => {
    spyOn(component, 'toggleLinkVisibility');
    component.ngOnChanges();
    expect(component.toggleLinkVisibility).toHaveBeenCalled();
  });

  it('should set showLink to true when user is navigated to follow up to a query', () => {
    component.toggleLinkVisibility();
    expect(component['queryItemId']).toBe('123');
    expect(component.showLink).toBe(true);
  });

  it('should set showLink to false when user is navigated to response to a query', () => {
    component['route'].snapshot.params.qid = '3';
    component.ngOnChanges();
    component.toggleLinkVisibility();
    expect(component.showLink).toBe(false);
  });

  describe('isCaseworker', () => {
    it('should return true if the user doesnt have pui-case-manager', () => {
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isCaseworker()).toBeTruthy();
    });

    it('should return true if the user doesnt have pui-case-manager', () => {
      USER.roles.push('pui-case-manager');
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isCaseworker()).toBeFalsy();
      USER.roles.pop();
    });

    it('should return true if the user doesnt have pui-case-manager', () => {
      USER.roles.push('Civil-Judge');
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isCaseworker()).toBeFalsy();
    });
  });
  describe('hasRespondedToQuery', () => {
    it('should emit true and return true if conditions are met', () => {
      spyOn(component, 'isCaseworker').and.returnValue(true); // Mock the isCaseworker method to return true
      spyOn(component.hasResponded, 'emit');

      component.totalNumberOfQueryChildren = 1;

      const result = component.hasRespondedToQuery();

      expect(component.message).toEqual(Constants.TASK_COMPLETION_ERROR);
      expect(component.hasResponded.emit).toHaveBeenCalledWith(true);
      expect(result).toBeTruthy();
    });

    it('should emit false and return false if children length is even', () => {
      spyOn(component, 'isCaseworker').and.returnValue(true); // Mock the isCaseworker method to return true
      spyOn(component.hasResponded, 'emit'); // Spy on the emit method of hasResponded

      const result = component.hasRespondedToQuery();

      expect(component.message).toBeUndefined(); // Ensure message is not set
      expect(component.hasResponded.emit).toHaveBeenCalledWith(false);
      expect(result).toBeFalsy();
    });

    it('should emit false and return false if query is not defined', () => {
      spyOn(component, 'isCaseworker').and.returnValue(true); // Mock the isCaseworker method to return true
      spyOn(component.hasResponded, 'emit'); // Spy on the emit method of hasResponded
      component.query = null; // Set the query to null

      const result = component.hasRespondedToQuery();

      expect(component.message).toBeUndefined(); // Ensure message is not set
      expect(component.hasResponded.emit).toHaveBeenCalledWith(false);
      expect(result).toBeFalsy();
    });
  });
});
