import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RaiseQueryErrorMessage } from '../../../enums';
import {
  CaseEventData,
  CaseEventTrigger,
  CaseView
} from '../../../../../../../../lib/shared/domain';
import { Observable } from 'rxjs';
import { QmCaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../../models';
import { EventCompletionParams } from '../../../../../case-editor/domain/event-completion-params.model';
import { QueryManagementService } from '../../../services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ccd-query-write-raise-query',
  templateUrl: './query-write-raise-query.component.html'
})
export class QueryWriteRaiseQueryComponent implements OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public submitted: boolean;
  @Input() public caseDetails: CaseView;
  @Input() public showForm: boolean;
  @Input() public serviceMessage: string | null;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public eventData: CaseEventTrigger | null = null;
  @Input() public queryItem: QueryListItem;
  @Input() public validate: (caseEventData: CaseEventData, pageId: string) => Observable<object>;
  @Input() public triggerSubmission: boolean;

  @Output() public queryDataCreated = new EventEmitter <QmCaseQueriesCollection>();

  public raiseQueryErrorMessage = RaiseQueryErrorMessage;
  public eventCompletionParams: EventCompletionParams;
  public messgaeId: string;

  constructor(
    private queryManagementService: QueryManagementService,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnChanges(): void {
    this.messgaeId = this.route.snapshot.params.dataid;
    const isCollectionDataSet = this.setCaseQueriesCollectionData();
    if (isCollectionDataSet) {
      if (this.triggerSubmission) {
        const data = this.generateCaseQueriesCollectionData();
        this.queryDataCreated.emit(data);
      }
    }
  }

  onSubjectInput(): void {
    const control = this.formGroup.get('subject');
    const value = control?.value;
    if (value && value.length > 200) {
      control?.setValue(value.substring(0, 200));
    }
  }

  getSubjectErrorMessage(): string {
    const control = this.formGroup.get('subject');
    if (control.hasError('required')) {
      return this.raiseQueryErrorMessage.QUERY_SUBJECT;
    }
    if (control.hasError('maxlength')) {
      return this.raiseQueryErrorMessage.QUERY_SUBJECT_MAX_LENGTH;
    }
    return '';
  }

  public setCaseQueriesCollectionData(): boolean {
    if (!this.eventData) {
      console.warn('Event data not available; skipping collection setup.');
      return false;
    }

    this.queryManagementService.setCaseQueriesCollectionData(
      this.eventData,
      this.queryCreateContext,
      this.caseDetails,
      this.messgaeId
    );

    return true;
  }

  private generateCaseQueriesCollectionData(): QmCaseQueriesCollection {
    return this.queryManagementService.generateCaseQueriesCollectionData(
      this.formGroup,
      this.queryCreateContext,
      this.queryItem,
      this.messgaeId
    );
  }
}
