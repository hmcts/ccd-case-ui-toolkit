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
  private static readonly SERVICES_RENDERED_IN_LOCAL_TIME = ['ABA1', 'ABA2', 'ABA6']; // [DIVORCE, FR, PROBATE]

  private caseSubscription: Subscription;
  private caseHmctsServiceId: string;

  constructor(@Optional() private readonly caseNotifier?: CaseNotifier) {
    super();
  }

  public ngOnInit(): void {
    super.ngOnInit();

    this.caseSubscription = this.caseNotifier?.caseView.subscribe((caseDetails: CaseView) => {
      this.caseHmctsServiceId = caseDetails?.hmctsServiceId;
    });
  }

  public ngOnDestroy(): void {
    if (this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  // Most services display DateTime values as received from CCD; only the services listed in SERVICES_RENDERED_IN_LOCAL_TIME need converting to local time.
  public get timeZone(): string {
    console.log('timeZone:', this.shouldRenderInLocalTime() ? 'local' : 'utc');
    return this.shouldRenderInLocalTime() ? 'local' : 'utc';
    // return 'utc';
  }

  private shouldRenderInLocalTime(): boolean {
    return ReadDateFieldComponent.SERVICES_RENDERED_IN_LOCAL_TIME.includes(this.getHmctsServiceId());
  }

  private getHmctsServiceId(): string {
    if (typeof this.caseField?.hmctsServiceId === 'string') {
      console.log('hmctsServiceId from caseField:', this.caseField.hmctsServiceId);
      return this.caseField.hmctsServiceId;
    }

    return this.caseHmctsServiceId;
  }
}
