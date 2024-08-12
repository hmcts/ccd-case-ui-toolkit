import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseQueriesCollection, QueryListItem } from './models';
import { QueryManagementUtils } from './utils/query-management.utils';
import { caseMessagesMockData } from './__mocks__';

@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html',
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public caseQueriesCollections: CaseQueriesCollection[];
  public query: QueryListItem;
  public showQueryList: boolean = true;
  public caseId: string;

  constructor(private readonly route: ActivatedRoute) {
    super();
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    if (this.context === PaletteContext.DEFAULT) {
      // EUI-8303 Using mock data until CCD is ready with the API and data contract
      this.caseQueriesCollections = caseMessagesMockData;

      // TODO: Actual implementation once the CCD API and data contract is available
      // Each parties will have a separate collection of party messages
      // Find whether queries tab is available in the case data
      const queriesTab = (this.route.snapshot.data.case.tabs as CaseTab[])
        .filter((tab) => tab.fields && tab.fields
          .some((caseField) => caseField.id === 'QueryManagement'));

      // Loop through the list of parties and their case queries collections
      QueryManagementUtils.extractCaseQueriesFromCaseField();
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
}
