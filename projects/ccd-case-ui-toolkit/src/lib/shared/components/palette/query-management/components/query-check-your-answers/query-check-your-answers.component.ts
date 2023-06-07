import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../../../domain';
import { caseFieldMockData } from '../../__mocks__';
import { QueryListItem, QueryListResponseStatus } from '../../models';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QueryCheckYourAnswersComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  // Set default value as false for testing follow up EUI-8387
  @Input() public context: string = QueryListResponseStatus.FOLLOWUP;
  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  public caseField: CaseField;

  public ngOnInit(): void {
    // Mock object
    caseFieldMockData.value = [
      {
        id: '725bf4a7-9e4c-4132-b5c1-f8028cb83459',
        value: {
          document_url: 'https://dm-store-aat.service.core-compute-aat.internal/documents/e5366837-b3f6-492d-acbf-548730625e8f',
          document_filename: 'Screenshot 2023-06-01 at 16.07.06.png',
          document_binary_url: 'https://dm-store-aat.service.core-compute-aat.internal/documents/e5366837-b3f6-492d-acbf-548730625e8f/binary'
        }
      },
      {
        id: '725bf4a7-9e4c-4132-b5c1-f8028cb83459',
        value: {
          document_url: 'https://dm-store-aat.service.core-compute-aat.internal/documents/f50ccd7a-7f28-40f3-b5f9-7ad2f6425506',
          document_filename: 'dummy.pdf',
          document_binary_url: 'https://dm-store-aat.service.core-compute-aat.internal/documents/f50ccd7a-7f28-40f3-b5f9-7ad2f6425506/binary'
        }
      }
    ];
    this.caseField = caseFieldMockData;
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }
}
