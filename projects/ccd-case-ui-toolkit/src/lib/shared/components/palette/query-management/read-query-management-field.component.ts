import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { PartyMessagesGroup } from './models';
import { QueryManagementUtils } from './utils/query-management.utils';
import { partyMessagesMockData } from './__mocks__';

@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html',
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public partyMessagesGroups: PartyMessagesGroup[];
  public query: QueryListItem;
  public showQueryList: boolean = true;
  constructor(private readonly route: ActivatedRoute) {
    super();
  }

  public ngOnInit(): void {
    if (this.context === PaletteContext.DEFAULT) {
      // EUI-8303 Using mock data until CCD is ready with the API and data contract
      this.partyMessagesGroups = partyMessagesMockData;

      // TODO: Actual implementation once the CCD API and data contract is available
      // Each parties will have a separate collection of party messages
      // Find whether queries tab is available in the case data
      const queriesTab = (this.route.snapshot.data.case.tabs as CaseTab[])
        .filter(tab => tab.fields && tab.fields
        .some(caseField => caseField.id === 'QueryManagement'));

      // Loop through the list of parties and their case queries collections
      QueryManagementUtils.extractCaseQueriesFromCaseField();
    }
  }

  public setQuery(query): void {
    this.showQueryList = false;
    this.query = query;
  }
}
