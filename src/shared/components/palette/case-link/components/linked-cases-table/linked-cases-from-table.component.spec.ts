import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesFromTableComponent } from './linked-cases-from-table.component';
import { PipesModule } from '../../../../../pipes/pipes.module';

import createSpyObj = jasmine.createSpyObj;
import { ActivatedRoute, Router } from '@angular/router';

fdescribe('LinkCasesFromTableComponent', () => {
  let component: LinkedCasesFromTableComponent;
  let fixture: ComponentFixture<LinkedCasesFromTableComponent>;
  let casesService: any;
  let searchService: any;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: ''
  };

  beforeEach(async(() => {
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses', 'getLinkedCases']);
    searchService = createSpyObj('searchService', ['searchCases']);
    TestBed.configureTestingModule({
      imports: [
        PipesModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {data: {case: {case_id: '123'}}}}
        },
        { provide: Router, useValue: mockRouter },
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService }
      ],
      declarations: [LinkedCasesFromTableComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const linkedCasesMock = {
      'linkedCases': [
        {
          'caseNameHmctsInternal': 'Smith vs Peterson',
          'caseReference': '1234123412341234',
          'ccdCaseType': 'benefit',
          'ccdJurisdiction': 'SSCS',
          'state': 'withDwp',
          'linkDetails': [
            {
              'createdDateTime': '2022-02-04T15:00:00.000',
              'reasons': [
                {
                  'reasonCode': 'FAMILIAL',
                  'OtherDescription': ''
                },
                {
                  'reasonCode': 'LINKED_HEARING',
                  'OtherDescription': ''
                }
              ]
            }
          ]
        },
        {
          'caseNameHmctsInternal': 'Lysiak vs Barlass',
          'caseReference': '9231123412341234',
          'ccdCaseType': 'benefit',
          'ccdJurisdiction': 'SSCS',
          'state': 'withDwp',
          'linkDetails': [
            {
              'createdDateTime': '2021-12-04T15:00:00.000',
              'reasons': [
                {
                  'reasonCode': 'Bail',
                  'OtherDescription': 'Judge has an interest'
                }
              ]
            }
          ]
        }
      ],
      'hasMoreRecords': 'False'
    }
    fixture = TestBed.createComponent(LinkedCasesFromTableComponent);
    component = fixture.componentInstance;
    casesService.getLinkedCases.and.returnValue(of(linkedCasesMock));
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have called getLinkedCases', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(casesService.getLinkedCases).toHaveBeenCalled();
  });

  it('should render linkedCases from table', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(casesService.getLinkedCases).toHaveBeenCalled();
    expect(component.getLinkedCasesResponse.linkedCases).not.toBeNull();
    const tableRows = document.getElementsByName('tr');
    expect(tableRows.length).not.toBeNull();
  });

  it('should render the failure panel when api returns non 200', () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '?error'
    };
    mockRouter.url = '?error';
    const injector = getTestBed();
    const router = injector.get(Router);
    router.url = '=?error';
    TestBed.overrideProvider(Router, {useValue: mockRouter})
    TestBed.compileComponents();
    fixture = TestBed.createComponent(LinkedCasesFromTableComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    spyOn(component.notifyAPIFailure, 'emit');
    fixture.detectChanges();
    expect(component.notifyAPIFailure.emit).toHaveBeenCalledWith(true);
  });
});
