import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { SessionStorageService } from '../../../services';
import { isInternalUser } from '../../../utils';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseQueriesCollection, QueryCreateContext, QueryListItem } from './models';
import { QueryManagementUtils } from './utils/query-management.utils';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { AbstractAppConfig } from '../../../../app.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html'
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {
  public caseQueriesCollections: CaseQueriesCollection[];
  public query: QueryListItem;
  public showQueryList: boolean = true;
  public caseId: string;
  public messageType: string;

  public followUpQuery: string = QueryCreateContext.FOLLOWUP;
  public respondToQuery: string = QueryCreateContext.RESPOND;

  public isQueryClosed: boolean = false;

  public value: boolean;
  public isMultipleFollowUpEnabled: boolean = false;
  public currentJurisdictionId: string;
  public enableServiceSpecificMultiFollowups: string[] = [];

  private caseSubscription: Subscription;


  constructor(private readonly route: ActivatedRoute,
    private sessionStorageService: SessionStorageService,
    private readonly caseNotifier: CaseNotifier,
    private readonly abstractConfig: AbstractAppConfig
  ) {
    super();
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;

    this.enableServiceSpecificMultiFollowups = this.abstractConfig.getEnableServiceSpecificMultiFollowups() || [];
    this.caseSubscription = this.caseNotifier.caseView.subscribe((caseDetails) => {
      if (caseDetails?.case_type?.jurisdiction?.id) {
        this.currentJurisdictionId = caseDetails.case_type.jurisdiction.id;
        this.isMultipleFollowUpEnabled = this.enableServiceSpecificMultiFollowups.includes(this.currentJurisdictionId);
      }
    });

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
  }

  ngOnDestroy(): void {
    this.caseSubscription?.unsubscribe();
  }

  public setQuery(query): void {
    this.showQueryList = false;
    this.query = query;
    this.messageType = this.getMessageType(query);
    this.isQueryClosed = this.query?.children?.some((queryItem) => queryItem?.isClosed === 'Yes');
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

