import { Component, OnInit } from '@angular/core';
import { Jurisdiction, CaseType } from '@hmcts/ccd-case-ui-toolkit';

 @Component({
  selector: 'search-filters-wrapper-consumer',
  templateUrl: './search-filters-wrapper-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class SearchFiltersWrapperConsumerComponent implements OnInit {

   jurisdictions: Jurisdiction[];

   code = `
   <ccd-search-filters-wrapper
                        [autoApply]="true"
                        (onApply)="applied($event)"
                        (onReset)="reset()"
                        (onJurisdiction)="jurisdictionSelected($event)">
   </ccd-search-filters-wrapper>`;
   selected = `
   {
   caseType: {...},
   formGroup: angular FormGroup,
   jurisdiction: {...},
   metadataFields: [
      "[CASE_REFERENCE]",
      "[CREATED_DATE]",
      "[LAST_MODIFIED_DATE]",
      "[STATE]",
      "[SECURITY_CLASSIFICATION]",
      "[JURISDICTION]"
      "[CASE_TYPE]"
   ],
   page: 1
   }`;

   ngOnInit() {
   }

   applied(selected) {
      console.log('selected:', selected);
   }

   reset() {
      console.log('reset');
   }

   jurisdictionSelected(jurisdiction) {
      console.log('selected jurisdiction:', jurisdiction);
   }
}
