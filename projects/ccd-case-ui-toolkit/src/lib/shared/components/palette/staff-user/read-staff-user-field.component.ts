import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CaseworkerService } from '../../case-editor/services/case-worker.service';
import { JurisdictionService } from '../../../services';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-staff-user-field',
  templateUrl: './read-staff-user-field.component.html',
  standalone: false
})
export class ReadStaffUserFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {

  public displayName: string;
  private sub: Subscription;

  constructor(private readonly caseworkerService: CaseworkerService,
              private readonly jurisdictionService: JurisdictionService) {
    super();
  }

  public ngOnInit(): void {
    const idamId = this.caseField?.value?.idamId;
    if (idamId) {
      this.sub = this.caseworkerService.getUserByIdamId(idamId).pipe(
        catchError(() => of(null)),
        switchMap(caseworker => {
          if (caseworker) {
            this.displayName = `${caseworker.firstName} ${caseworker.lastName}`.trim();
            return of(null);
          }
          return this.jurisdictionService.getJudicialUserByIdamId(idamId);
        })
      ).subscribe(judicialUser => {
        if (judicialUser) {
          this.displayName = judicialUser.fullName || `${judicialUser.knownAs}`.trim();
        }
      });
    }
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
