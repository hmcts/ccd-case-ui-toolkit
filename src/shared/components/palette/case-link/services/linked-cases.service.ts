import { Injectable } from '@angular/core';
import { CaseView } from '../../../../domain/case-view';
import { Jurisdiction } from '../../../../domain/definition/jurisdiction.model';
import { LovRefDataModel } from '../../../../services/common-data-service/common-data-service';
import { CaseLink } from '../domain';
import { JurisdictionService } from './jurisdiction.service';

@Injectable()
export class LinkedCasesService {
  public caseFieldValue = [];
  public isLinkedCasesEventTrigger = false;
  public caseDetails: CaseView;
  public caseId: string;
  public linkCaseReasons: LovRefDataModel[] = [];
  public linkedCases: CaseLink[] = [];
  public initialCaseLinks: CaseLink[] = [];
  public editMode = false;
  public jurisdictionsResponse: Jurisdiction[] = [];

  constructor(private readonly jurisdictionService: JurisdictionService) {
    this.jurisdictionService.getJurisdictions().subscribe((jurisdictions) => {
        this.jurisdictionsResponse = jurisdictions;
    });
  }

  public mapLookupIDToValueFromJurisdictions(fieldName, fieldValue): string {
    const selectedCaseJurisdictionId = this.caseDetails && this.caseDetails.case_type.jurisdiction.id || null;
    const selectedJurisdiction = this.jurisdictionsResponse &&
                                this.jurisdictionsResponse.find(item => item.id === selectedCaseJurisdictionId);
    const selectedCaseType = selectedJurisdiction.caseTypes.find(item => item.id === this.caseDetails.case_type.id);
    switch (fieldName) {
      case 'JURISDICTION':
        return selectedJurisdiction && selectedJurisdiction.description;
      case 'CASE_TYPE':
        return selectedCaseType && selectedCaseType.description;
      case 'STATE':
        const state = selectedCaseType && selectedCaseType.states.find(item => item.id === fieldValue);
        return state && state.description || fieldValue;
      default:
        break;
    }
  }
}
