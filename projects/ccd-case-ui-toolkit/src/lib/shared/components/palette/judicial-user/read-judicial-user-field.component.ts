import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { JudicialUserModel } from '../../../domain/jurisdiction/judicial-user.model';
import { JurisdictionService } from '../../../services/jurisdiction/jurisdiction.service';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-judicial-user-field',
  templateUrl: './read-judicial-user-field.component.html'
})
export class ReadJudicialUserFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {

  public judicialUser: JudicialUserModel;
  public sub: Subscription;

  constructor(private readonly jurisdictionService: JurisdictionService) {
    super();
  }

  public ngOnInit(): void {
    if (this.caseField && this.caseField.value && this.caseField.value.personalCode) {
      const personalCode = this.caseField.value.personalCode;
      this.sub = this.jurisdictionService.searchJudicialUsersByPersonalCodes([personalCode]).subscribe(judicialUsers => {
        this.judicialUser = judicialUsers && judicialUsers.length > 0 && judicialUsers[0];
      });
    }
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
