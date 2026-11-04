import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
  public showSpinner = false;
  private sub: Subscription;

  constructor(private readonly caseworkerService: CaseworkerService,
              private readonly jurisdictionService: JurisdictionService) {
    super();
  }

  public ngOnInit(): void {
    const idamId = this.caseField?.value?.idamId;
    if (idamId) {
      this.showSpinner = true;
      this.sub = this.caseworkerService.getUserByIdamId(idamId).pipe(
        catchError(() => of(null)),
        switchMap(caseworker => {
          if (caseworker) {
            return of(`${caseworker.firstName} ${caseworker.lastName}`.trim());
          }
          return this.jurisdictionService.getJudicialUserByIdamId(idamId).pipe(
            map(judicialUser => judicialUser ? (judicialUser.fullName || judicialUser.knownAs || '') : '')
          );
        })
      ).subscribe(
        (displayName: string) => {
          this.displayName = displayName;
          this.showSpinner = false;
        },
        () => this.showSpinner = false
      );
    }
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
