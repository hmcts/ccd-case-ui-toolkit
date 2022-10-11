import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { JurisdictionService } from '../../../services';
import { AbstractFieldReadComponent } from '../base-field';

@Component({
  selector: 'ccd-judicial-user-field',
  styleUrls: ['./judicial-user-field.component.scss'],
  templateUrl: './judicial-user-field.component.html'
})
export class JudicialUserFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {

  private readonly JURISDICTION_ID = 'jid';
  private readonly MINIMUM_SEARCH_CHARACTERS = 2;

  public judicialUserFormControl: FormControl;
  public jurisdictionId: string;
  public filteredJudicialUsers: JudicialUserModel[] = [];
  public showAutocomplete: boolean = false;
  public sub: Subscription;

  constructor(private readonly route: ActivatedRoute,
              private readonly cd: ChangeDetectorRef,
              private readonly jurisdictionService: JurisdictionService) {
    super();
  }

  public ngOnInit(): void {
    this.jurisdictionId = this.route.snapshot.params[this.JURISDICTION_ID];
    this.judicialUserFormControl = new FormControl('');
    this.formGroup.addControl('judicialUserFormControl', this.judicialUserFormControl);
    this.sub = this.judicialUserFormControl.valueChanges.pipe(
      tap(() => this.showAutocomplete = false),
      tap(() => this.filteredJudicialUsers = []),
      debounceTime(300),
      filter((searchTerm: string) => searchTerm && searchTerm.length > this.MINIMUM_SEARCH_CHARACTERS),
      switchMap((searchTerm: string) => this.filter(searchTerm).pipe(
        tap(() => this.showAutocomplete = true),
        catchError(() => this.filteredJudicialUsers = [])
      ))
    ).subscribe((judicialUsers: JudicialUserModel[]) => {
      this.filteredJudicialUsers = judicialUsers;
      this.cd.detectChanges();
    });
  }

  public filter(searchTerm: string): Observable<JudicialUserModel[]> {
    this.jurisdictionId = 'BBA3';
    return this.jurisdictionService.searchJudicialUsers(searchTerm, this.jurisdictionId);
  }

  public onSelectionChange(judicialUser: JudicialUserModel): void {
    console.log('SELECTED JUDICIAL USER', judicialUser);
    this.judicialUserFormControl.setValue(`${judicialUser.fullName} (${judicialUser.emailId})`);
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
