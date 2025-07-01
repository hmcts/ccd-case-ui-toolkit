import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { SessionStorageService } from '../../../services';
import { isInternalUser, FeatureVariation } from '../../../utils';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseQueriesCollection, QueryCreateContext, QueryListItem } from './models';
import { QueryManagementUtils } from './utils/query-management.utils';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { AbstractAppConfig } from '../../../../app.config';

@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html'
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public caseQueriesCollections: CaseQueriesCollection[];
  public query: QueryListItem;
  public showQueryList: boolean = true;
  public caseId: string;
  public messageType : string;

  public followUpQuery: string = QueryCreateContext.FOLLOWUP;
  public respondToQuery: string = QueryCreateContext.RESPOND;

  public isQueryClosed: boolean = false;

  public value: boolean;
  public isMultipleFollowUpEnabled: boolean;

  public enableServiceSpecificMultiFollowups: string[];

  public defaultFeatureValue: FeatureVariation = {
    includeCaseTypes: ['CIVIL'],
    jurisdiction: 'CIVIL'
  };

  constructor(private readonly route: ActivatedRoute,
    private sessionStorageService: SessionStorageService,
    private readonly caseNotifier: CaseNotifier,
    private readonly abstractConfig: AbstractAppConfig,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.enableServiceSpecificMultiFollowups = this.abstractConfig.getEnableServiceSpecificMultiFollowups() || [];
    // console.log('enableServiceSpecificMultiFollowups', this.enableServiceSpecificMultiFollowups);
    this.isMultipleFollowUpEnabled = this.enableServiceSpecificMultiFollowups.some((jurisdiction) => jurisdiction === this.caseNotifier?.cachedCaseView?.case_type?.jurisdiction.id);

    console.log('enableServiceSpecificMultiFollowups', this.enableServiceSpecificMultiFollowups, this.isMultipleFollowUpEnabled);
    this.caseId = this.route.snapshot.params.cid;
    if (this.context === PaletteContext.DEFAULT) {
      // EUI-8303 Using mock data until CCD is ready with the API and data contract
      // this.caseQueriesCollections = caseMessagesMockData;

      // TODO: Actual implementation once the CCD API and data contract is available
      // Each parties will have a separate collection of party messages
      // Find whether queries tab is available in the case data
      this.caseNotifier.fetchAndRefresh(this.caseId)
        .subscribe({
          next: (caseDetails) => {
            if (this.route.snapshot.data.case?.tabs) {
              this.caseQueriesCollections = (caseDetails.tabs as CaseTab[])
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
          }
        });

      // Loop through the list of parties and their case queries collections
      // QueryManagementUtils.extractCaseQueriesFromCaseField();
    }
    //  hasMatchedJurisdictionAndCaseType('enable-service-specific-multi-followups', this.route.snapshot.data.case.case_type.jurisdiction.id, this.route.snapshot.data.case.case_type.id);
  }

  public setQuery(query): void {
    this.showQueryList = false;
    this.query = query;
    this.messageType = this.getMessageType(query);
    this.isQueryClosed = this.query?.children?.some((queryItem) => queryItem?.isClosed === 'Yes');
    this.enableServiceSpecificMultiFollowups = this.abstractConfig.getEnableServiceSpecificMultiFollowups() || [];
    console.log('enableServiceSpecificMultiFollowups', this.enableServiceSpecificMultiFollowups);
  }

  public backToQueryListPage(): void {
    this.showQueryList = true;
    this.query = null;
  }

  public isInternalUser(): boolean {
    return isInternalUser(this.sessionStorageService);
  }

  public getMessageType(query: any): string {
    return query?.children?.length
      ? query.children[query.children.length - 1]?.messageType
      : undefined;
  }
}

