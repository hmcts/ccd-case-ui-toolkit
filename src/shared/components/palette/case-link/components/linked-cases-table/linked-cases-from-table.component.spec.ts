import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesFromTableComponent } from './linked-cases-from-table.component';
import createSpyObj = jasmine.createSpyObj;

describe('LinkCasesFromTableComponent', () => {
  let component: LinkedCasesFromTableComponent;
  let fixture: ComponentFixture<LinkedCasesFromTableComponent>;
  let casesService: any;
  let searchService: any;

  beforeEach(async(() => {
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses']);
    searchService = createSpyObj('searchService', ['searchCases']);
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService }
      ],
      declarations: [LinkedCasesFromTableComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const linkedCasesMock = {
      "linkedCases": [
        {
          "caseNameHmctsInternal": "Smith vs Peterson",
          "caseReference": "1234123412341234",
          "ccdCaseType": "benefit",
          "ccdJurisdiction": "SSCS",
          "state": "withDwp",
          "linkDetails": [
            {
              "createdDateTime": "2022-02-04T15:00:00.000",
              "reasons": [
                {
                  "reasonCode": "FAMILIAL",
                  "OtherDescription": ""
                },
                {
                  "reasonCode": "LINKED_HEARING",
                  "OtherDescription": ""
                }
              ]
            }
          ]
        },
        {
          "caseNameHmctsInternal": "Lysiak vs Barlass",
          "caseReference": "9231123412341234",
          "ccdCaseType": "benefit",
          "ccdJurisdiction": "SSCS",
          "state": "withDwp",
          "linkDetails": [
            {
              "createdDateTime": "2021-12-04T15:00:00.000",
              "reasons": [
                {
                  "reasonCode": "Bail",
                  "OtherDescription": "Judge has an interest"
                }
              ]
            }
          ]
        }
      ],
      "hasMoreRecords": "False"
    }    
    fixture = TestBed.createComponent(LinkedCasesFromTableComponent);
    component = fixture.componentInstance;
    casesService.getLinkedCases.and.returnValue(of(linkedCasesMock));
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should render linkedCases from table', () => {
    casesService.getCaseLinkResponses.and.returnValue(throwError({}));
    component.ngOnInit();
    fixture.detectChanges();
  });
});
