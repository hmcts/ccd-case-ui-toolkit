import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { Subscription } from 'rxjs';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { CaseNotifier } from '../../case-editor/services/case.notifier';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-date-field',
  template: `<span class="text-16">{{caseField.value | ccdDate:timeZone:caseField.dateTimeDisplayFormat}}</span>`,
  standalone: false
})
export class ReadDateFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {
  private static readonly SERVICES_RENDERED_IN_LOCAL_TIME = ['ABA2', 'ABA6'];

  // Most services intend to display DateTime values verbatim as sent to the frontend; only the services listed above need converting to local time.
  public timeZone = 'utc';

  private caseSubscription: Subscription;

  constructor(@Optional() private readonly caseNotifier?: CaseNotifier) {
    super();
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.caseSubscription = this.caseNotifier?.caseView.subscribe((caseDetails: CaseView) => {
      this.timeZone = this.shouldRenderInLocalTime(caseDetails) ? 'local' : 'utc';
    });
  }

  public ngOnDestroy(): void {
    if (this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  private shouldRenderInLocalTime(caseDetails: CaseView): boolean {
    return ReadDateFieldComponent.SERVICES_RENDERED_IN_LOCAL_TIME.includes(caseDetails?.hmctsServiceId);
  }
}
