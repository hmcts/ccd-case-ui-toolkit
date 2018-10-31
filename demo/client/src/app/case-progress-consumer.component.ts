import { Component } from '@angular/core';

@Component({
  selector: 'case-progress-consumer',
  template: `<div class="screen-990">
                <ccd-case-progress [case]="caseId"
                              [event]="eventTriggerId"
                              (cancelled)="cancel($event)"
                              (submitted)="submit($event)"></ccd-case-progress>
             </div>`,
  styles: ['.screen-990 { width: 990px; margin: 0 auto; }']
})
export class CaseProgressConsumerComponent {
  caseId = '123456789012345';
  eventTriggerId = 'enterCaseIntoLegacy';

  submit(event: any): void {
    console.log('CONSUMER submit event=', event);
    // let caseId: string = event['caseId'];
    // let eventStatus: string = event['status'];
    // this.router
    //   .navigate(['case', this.jurisdictionId, this.caseTypeId, caseId])
    //   .then(() => {
    //     let caseReference = this.caseReferencePipe.transform(String(caseId));
    //     if (EventStatusService.isIncomplete(eventStatus)) {
    //       this.alertFailure(eventStatus, caseReference);
    //     } else {
    //       this.alertSuccess(eventStatus, caseReference);
    //     }
    // });
  }

  cancel(event: any): void {
    console.log('CONSUMER cancel event=', event);
    // switch (event.status) {
    //   case CaseEditPageComponent.NEW_FORM_DISCARD:
    //     return this.router.navigate(['list/case']);
    //   case CaseEditPageComponent.RESUMED_FORM_DISCARD:
    //     return this.router.navigate([`case/${this.jurisdictionId}/${this.caseTypeId}/${this.eventTrigger.case_id}`]);
    //   case CaseEditPageComponent.NEW_FORM_SAVE:
    //     this.saveDraft().call(null, event.data).subscribe(_ => {
    //       return this.router.navigate(['list/case'])
    //         .then(() => {
    //           this.alertService.setPreserveAlerts(true);
    //           this.alertService.success(`The draft has been successfully saved`);
    //         })
    //     }, error => {
    //       console.log('error=', error);
    //       this.alertService.setPreserveAlerts(true);
    //       this.alertService.warning(error.message);
    //       this.router.navigate(['list/case'])
    //     });
    //     break;
    //   case CaseEditPageComponent.RESUMED_FORM_SAVE:
    //     this.saveDraft().call(null, event.data).subscribe(_ => {
    //       return this.router.navigate([`case/${this.jurisdictionId}/${this.caseTypeId}/${this.eventTrigger.case_id}`])
    //         .then(() => {
    //           this.alertService.setPreserveAlerts(true);
    //           this.alertService.success(`The draft has been successfully saved`);
    //         })
    //       }, error => {
    //         console.log('error=', error);
    //         this.alertService.setPreserveAlerts(true);
    //         this.alertService.warning(error.message);
    //     });
    //     break;
    // }
  }
}
