import { Component, CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QueryListItem } from './models';
import { ReadQueryManagementFieldComponent } from './read-query-management-field.component';
import { CaseField } from '../../../domain';
import { PUI_CASE_MANAGER } from '../../../utils';
import { SessionStorageService } from '../../../services';
import { CaseNotifier } from '../..';
import { BehaviorSubject, of } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';

@Component({
  selector: 'dummy-component',
  template: ''
})
class DummyComponent { }

@Pipe({ name: 'rpxTranslate' })
class MockTranslatePipe implements PipeTransform {
  public transform(value: any, ...args: any[]): any {
    return value;
  }
}

describe('ReadQueryManagementFieldComponent', () => {
  let component: ReadQueryManagementFieldComponent;
  let fixture: ComponentFixture<ReadQueryManagementFieldComponent>;
  const caseId = '12345';
  let route: ActivatedRoute;
  const mockCaseView$ = new BehaviorSubject<any>({
    case_type: {
      jurisdiction: {
        id: 'CIVIL'
      }
    }
  });

  const mockSessionStorageService = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);
  const casesNotifier = {
    fetchAndRefresh: jasmine.createSpy('fetchAndRefresh').and.returnValue(of({})),
    caseView: mockCaseView$
  };

  const componentLauncherId = 'ComponentLauncher';
  const componentLauncher1CaseField: CaseField = {
    id: 'QueryManagement1',
    field_type: {
      id: componentLauncherId,
      type: componentLauncherId
    }
  } as CaseField;

  const mockRoute = {
    snapshot: {
      params: {
        cid: caseId
      },
      data: {
        case: {
          tabs: [
            {
              fields: [],
              id: 'QueryManagement2',
              label: 'Queries (writeable view)',
              order: 8,
              show_condition: null
            },
            {
              fields: [
                {
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'ComponentLauncher',
                    max: null,
                    min: null,
                    regular_expression: null,
                    type: 'ComponentLauncher'
                  },
                  id: 'QueryManagement1',
                  label: 'Query management component'
                },
                {
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'CaseQueriesCollection',
                    max: null,
                    min: null,
                    regular_expression: null,
                    type: 'Complex'
                  },
                  id: 'qmCaseQueriesCollection',
                  label: 'Query management case queries collection',
                  value: {
                    caseMessages: [{
                      id: '42ea7fd3-178c-4584-b48b-f1275bf1804f',
                      value: {
                        attachments: [],
                        body: 'testing by olu',
                        createdBy: '120b3665-0b8a-4e80-ace0-01d8d63c1005',
                        createdOn: '2024-08-27T15:44:50.700Z',
                        hearingDate: '2023-01-10',
                        id: null,
                        isHearingRelated: 'Yes',
                        name: 'Piran Sam',
                        parentId: 'ca',
                        subject: 'Review attached document'
                      }
                    }],
                    partyName: '',
                    roleOnCase: ''
                  }
                }

              ],
              id: 'QueryManagement1',
              label: 'Queries (read-only view)',
              order: 7,
              show_condition: null
            }
          ]
        }

      }
    }
  };
  let router: Router;

  const formGroup = {
    controls: {
      ['QueryManagement1']: {
        controls: {
          partyName: null,
          roleOnCase: null
        },
        caseField: {
          id: 'QueryManagement1',
          field_type: {
            id: 'ComponentLauncher',
            type: 'Complex'
          }
        }
      }
    },
    get: (controlName: string) => {
      return formGroup.controls[controlName];
    }
  } as unknown as FormGroup;

  const USER = {
    roles: [
      'caseworker'
    ]
  };

  beforeEach(waitForAsync(() => {
    mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
    casesNotifier.fetchAndRefresh.and.returnValue(of({}));

    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        ReadQueryManagementFieldComponent,
        MockTranslatePipe
      ],
      imports: [RouterTestingModule.withRoutes([
        {
          path: '',
          component: DummyComponent
        },
        {
          path: `query-management/query/${caseId}/4/:dataid`,
          component: DummyComponent
        }
      ])],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: SessionStorageService, useValue: mockSessionStorageService },
        { provide: CaseNotifier, useValue: casesNotifier },
        {
          provide: AbstractAppConfig,
          useValue: {
            getEnableServiceSpecificMultiFollowups: () => ['CIVIL', 'FAMILY']
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadQueryManagementFieldComponent);
    component = fixture.componentInstance;
    component.caseField = componentLauncher1CaseField;
    component.formGroup = formGroup;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should hide query list and show query details', () => {
    component.setQuery(new QueryListItem());
    expect(component.showQueryList).toBeFalsy();
    expect(component.query).toEqual(new QueryListItem());
  });

  it('should show query list page when back link is clicked', () => {
    component.backToQueryListPage();
    expect(component.showQueryList).toEqual(true);
    expect(component.query).toBeNull();
  });

  describe('query is set', () => {
    beforeEach(() => {
      component.setQuery(new QueryListItem());
      fixture.detectChanges();
    });

    describe('follow-up button', () => {
      it('should not display if query has no children', () => {
        USER.roles.push(PUI_CASE_MANAGER);
        mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
        component.query.children = [];
        fixture.detectChanges();
        const followUpButton = fixture.nativeElement.querySelector('#ask-follow-up-question');
        expect(followUpButton).toBeFalsy();
      });

      it('should display and navigate to query details page on click', fakeAsync(() => {
        component.query.children = [new QueryListItem()];
        component.query.id = 'id-007';
        fixture.detectChanges();
        spyOn(router, 'navigate');
        const followUpButton = fixture.nativeElement.querySelector('#ask-follow-up-question');
        followUpButton.click();
        tick();
        expect(router.url).toBe(`/query-management/query/${caseId}/4/id-007`);
      }));
    });
  });

  describe('isInternalUser', () => {
    it('should return true if the user doesnt have pui-case-manager', () => {
      USER.roles.push(PUI_CASE_MANAGER);
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isInternalUser()).toBeFalsy();
      USER.roles.pop();
    });

    it('should return true if the user doesnt have pui-case-manager', () => {
      USER.roles.push('Civil-Judge');
      mockSessionStorageService.getItem.and.returnValue(JSON.stringify(USER));
      fixture.detectChanges();
      expect(component.isInternalUser()).toBeFalsy();
    });
  });

  describe('getMessageType', () => {
    it('should return undefined if query has no children', () => {
      const query = { children: [] };
      const result = component.getMessageType(query);
      expect(result).toBeUndefined();
    });

    it('should return messageType of the last child if children exist', () => {
      const query = {
        children: [
          { messageType: 'RESPOND' },
          { messageType: 'FOLLOWUP' }
        ]
      };
      const result = component.getMessageType(query);
      expect(result).toBe('FOLLOWUP');
    });

    it('should return undefined if query is null or malformed', () => {
      expect(component.getMessageType(null)).toBeUndefined();
      expect(component.getMessageType(undefined)).toBeUndefined();
      expect(component.getMessageType({})).toBeUndefined();
    });

    it('should safely handle missing messageType in last child', () => {
      const query = {
        children: [
          { messageType: 'RESPOND' },
          {}
        ]
      };
      const result = component.getMessageType(query);
      expect(result).toBeUndefined();
    });

    it('should set currentJurisdictionId and isMultipleFollowUpEnabled correctly from notifier', () => {
      expect(component.currentJurisdictionId).toBe('CIVIL');
      expect(component.isMultipleFollowUpEnabled).toBeTruthy();
    });
  });
  describe('setQuery', () => {
    it('should set isQueryClosed to true if any child query is closed', () => {
      const closedChild = new QueryListItem();
      closedChild.isClosed = 'Yes';

      const openChild = new QueryListItem();
      openChild.isClosed = 'No';

      const parentQuery = new QueryListItem();
      parentQuery.children = [openChild, closedChild];

      component.setQuery(parentQuery);

      expect(component.isQueryClosed).toBeTruthy();
    });

    it('should set isQueryClosed to false if no children are closed', () => {
      const openChild1 = new QueryListItem();
      openChild1.isClosed = 'No';

      const openChild2 = new QueryListItem();
      openChild2.isClosed = 'No';

      const parentQuery = new QueryListItem();
      parentQuery.children = [openChild1, openChild2];

      component.setQuery(parentQuery);

      expect(component.isQueryClosed).toBeFalsy();
    });

    it('should set isQueryClosed to false if query has no children', () => {
      const parentQuery = new QueryListItem();
      parentQuery.children = [];

      component.setQuery(parentQuery);

      expect(component.isQueryClosed).toBeFalsy();
    });
  });
});
