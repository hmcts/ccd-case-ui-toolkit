import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CaseworkerService } from '../../case-editor/services/case-worker.service';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-staff-user-field',
  templateUrl: './read-staff-user-field.component.html',
  standalone: false
})
export class ReadStaffUserFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {

  public displayName: string;
  private sub: Subscription;

  constructor(private readonly caseworkerService: CaseworkerService) {
    super();
  }

  public ngOnInit(): void {
    const idamId = this.caseField?.value?.idamId;
    console.log('idamId: ', idamId);
    if (idamId) {
      this.sub = this.caseworkerService.getUserByIdamId(idamId).subscribe(caseworker => {
        if (caseworker) {
          this.displayName = `${caseworker.firstName} ${caseworker.lastName}`.trim();
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
