import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';
import { LinkedCasesFromTableComponent } from './linked-cases-from-table.component';

import createSpyObj = jasmine.createSpyObj;

describe('LinkCasesFromTableComponent', () => {
  let component: LinkedCasesFromTableComponent;
  let fixture: ComponentFixture<LinkedCasesFromTableComponent>;
  let casesService: any;
  let searchService: any;
  let nativeElement: any;
  let appConfig: any;
	let linkedCasesService: any;

  const linkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
    },
  ];

  beforeEach(waitForAsync(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', [
      'getRDCommonDataApiUrl',
    ]);
    casesService = createSpyObj('casesService', [
      'getCaseViewV2',
      'getCaseLinkResponses',
      'getLinkedCases',
    ]);
    linkedCasesService = createSpyObj('linkedCasesService', [
      'mapLookupIDToValueFromJurisdictions',
    ]);
    searchService = createSpyObj('searchService', ['searchCases']);
    TestBed.configureTestingModule({
      imports: [PipesModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { case: { case_id: '123' } } } },
        },
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService },
        { provide: AbstractAppConfig, useValue: appConfig },
        { provide: LinkedCasesService, useValue: linkedCasesService },
      ],
      declarations: [LinkedCasesFromTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    const linkedCasesMock = {
      linkedCases: [
        {
          caseNameHmctsInternal: 'Smith vs Peterson',
          caseReference: '1234123412341234',
          ccdCaseType: 'benefit',
          ccdJurisdiction: 'SSCS',
          state: 'withDwp',
          linkDetails: [
            {
              createdDateTime: '2022-02-04T15:00:00.000',
              reasons: [
                {
                  reasonCode: 'FAMILIAL',
                  OtherDescription: '',
                },
                {
                  reasonCode: 'LINKED_HEARING',
                  OtherDescription: '',
                },
              ],
            },
          ],
        },
        {
          caseNameHmctsInternal: 'Lysiak vs Barlass',
          caseReference: '9231123412341234',
          ccdCaseType: 'benefit',
          ccdJurisdiction: 'SSCS',
          state: 'withDwp',
          linkDetails: [
            {
              createdDateTime: '2021-12-04T15:00:00.000',
              reasons: [
                {
                  reasonCode: 'Bail',
                  OtherDescription: 'Judge has an interest',
                },
              ],
            },
          ],
        },
      ],
      hasMoreRecords: 'False',
    };
    fixture = TestBed.createComponent(LinkedCasesFromTableComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.debugElement.nativeElement;
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
    expect(component.getLinkedCasesResponse).not.toBeNull();
    const tableRows = document.getElementsByName('tr');
    expect(tableRows.length).not.toBeNull();
  });

  it('should render the failure panel when api returns non 200', () => {
    component.getLinkedCases = jasmine
      .createSpy()
      .and.returnValue(throwError({}));
    component.ngOnInit();
    spyOn(component.notifyAPIFailure, 'emit');
    fixture.detectChanges();
    expect(component.notifyAPIFailure.emit).toHaveBeenCalledWith(true);
  });

  it('should verify show and hide working correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const showHideLink = nativeElement.querySelector('#show-hide-link');
    component.onClick();
    fixture.detectChanges();
    expect(showHideLink.textContent).toEqual('Hide');
    component.onClick();
    fixture.detectChanges();
    expect(showHideLink.textContent).toEqual('Show');
  });

  it('should render the none as table row when no linked cases to be displayed', () => {
    casesService.getLinkedCases.and.returnValue(of({linkedCases: []}));
    component.ngOnInit();
    fixture.detectChanges();
    expect(
      document.getElementsByClassName('govuk-table__cell')[0].textContent.trim()
    ).toEqual('None');
  });

  it('should return the last 4 digits of the case reference', () => {
    component.caseId = '1234567890123456';
    const caseRef = '1234567890123456';
    const result = component.getCaseReferenceLink(caseRef);
    expect(result).toEqual('3456');
  });

  it('should return true for CASE_PROGRESS_REASON_CODE', () => {
    const reasonCode = 'CLRC016';
    const result = component.hasLeadCaseOrConsolidated(reasonCode);
    expect(result).toBeTruthy();
  });

  it('should return true for CASE_CONSOLIDATED_REASON_CODE', () => {
    const reasonCode = 'CLRC015';
    const result = component.hasLeadCaseOrConsolidated(reasonCode);
    expect(result).toBeTruthy();
  });

  it('should return false for any other reason code', () => {
    const reasonCode = 'OTHER_CODE';
    const result = component.hasLeadCaseOrConsolidated(reasonCode);
    expect(result).toBeFalsy();
  });
});
