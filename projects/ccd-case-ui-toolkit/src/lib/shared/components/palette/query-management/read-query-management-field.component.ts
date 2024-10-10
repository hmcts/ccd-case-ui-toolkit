import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseQueriesCollection, QueryListItem } from './models';
import { QueryManagementUtils } from './utils/query-management.utils';
import { SessionStorageService } from '../../../services';
import { CaseNotifier } from '../../case-editor';
@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html'
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public caseQueriesCollections: CaseQueriesCollection[];
  public query: QueryListItem;
  public showQueryList: boolean = true;
  public caseId: string;

  constructor(private readonly route: ActivatedRoute,
    private sessionStorageService: SessionStorageService,
    private caseNotifier: CaseNotifier
  ) {
    super();
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    if (this.context === PaletteContext.DEFAULT) {
      // EUI-8303 Using mock data until CCD is ready with the API and data contract
      // this.caseQueriesCollections = caseMessagesMockData;

      // TODO: Actual implementation once the CCD API and data contract is available
      // Each parties will have a separate collection of party messages
      // Find whether queries tab is available in the case data

      if (this.route.snapshot.data.case?.tabs) {
        this.caseQueriesCollections = (this.route.snapshot.data.case.tabs as CaseTab[])
          .filter((tab) => tab.fields?.some(
            (caseField) => caseField.field_type.type === 'ComponentLauncher' && caseField.id === this.caseField.id))
          [0].fields?.reduce((acc, caseField) => {
            const extractedCaseQueriesFromCaseField = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);

            if (extractedCaseQueriesFromCaseField && typeof extractedCaseQueriesFromCaseField === 'object') {
              acc.push(extractedCaseQueriesFromCaseField);
            }
            return acc;
          }, []);
      }

      // Loop through the list of parties and their case queries collections
      // QueryManagementUtils.extractCaseQueriesFromCaseField();
    }
  }

  public setQuery(query): void {
    this.showQueryList = false;
    this.query = query;
  }

  public backToQueryListPage(): void {
    this.showQueryList = true;
    this.query = null;
  }

  public isCaseworker(): boolean {
    const userDetails = JSON.parse(this.sessionStorageService?.getItem('userDetails'));
    return userDetails && userDetails.roles
      && !(userDetails.roles.includes('pui-case-manager')
        || userDetails.roles.some((role) => role.toLowerCase().includes('judge')));
  }
}
