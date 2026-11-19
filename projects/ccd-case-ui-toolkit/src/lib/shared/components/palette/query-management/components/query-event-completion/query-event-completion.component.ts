import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';

@Component({
  selector: 'ccd-query-event-completion',
  templateUrl: './query-event-completion.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class QueryEventCompletionComponent {
  @Input() public eventCompletionParams: EventCompletionParams;

  public onEventCanBeCompleted(value: boolean): void {
    // Submit the query response
  }
}
