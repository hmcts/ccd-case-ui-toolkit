import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationOrigin, AlertService, HttpError } from '@hmcts/ccd-case-ui-toolkit';

@Component({
  selector: 'case-create-consumer',
  templateUrl: './case-view-consumer.component.html',
  styleUrls: ['./elements-documentation.scss']
})
export class CaseViewConsumerComponent implements OnInit {
    public static readonly CASE_CREATED_MSG = 'The case has been created successfully';
    public static readonly DRAFT_DELETED_MSG = `The draft has been successfully deleted`;

    error: HttpError;
    caseId: string;
    code = `
    <ccd-case-view [case]="caseId" [hasPrint]="false" [hasEventSelector]="true" [error]="error"
        (navigationTriggered)="navigationTriggered($event)"></ccd-case-view>`;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.caseId = this.route.snapshot.params['cid'];
    }

    navigationTriggered(navigation: any) {
        if (navigation) {
            switch (navigation.action) {
                case NavigationOrigin.DRAFT_DELETED:
                    // navigation after a sucessful deletion of a draft
                case NavigationOrigin.ERROR_DELETING_DRAFT:
                    // navigation after an error occurs on trying to delete draft
                case NavigationOrigin.DRAFT_RESUMED:
                    // navigation after a draft is resumed
                case NavigationOrigin.EVENT_TRIGGERED:
                    // navigation after event is triggered
                    return this.router.navigate(['trigger', navigation.etid], {
                        queryParams: navigation.queryParams,
                        relativeTo: navigation.relativeTo
                    }).catch(error => {
                        this.handleError(error, navigation.etid);
                    });
                case NavigationOrigin.NO_READ_ACCESS_REDIRECTION:
                    // navigation after user has no READ access when redirected to case view after a case created
            }
        }
    }

    private handleError(error: HttpError, triggerId: string) {
        if (error.status !== 401 && error.status !== 403) {
          console.log('error during triggering event:', triggerId);
          console.log(error);
          this.error = error;
        }
      }
}
