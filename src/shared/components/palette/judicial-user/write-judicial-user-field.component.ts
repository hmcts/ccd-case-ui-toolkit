import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { JurisdictionService } from '../../../services';
import { AbstractFieldWriteComponent } from '../base-field';

@Component({
  selector: 'ccd-write-judicial-user-field',
  styleUrls: ['./write-judicial-user-field.component.scss'],
  templateUrl: './write-judicial-user-field.component.html'
})
export class WriteJudicialUserFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnDestroy {

  private readonly JURISDICTION_ID = 'jid';
  private readonly MINIMUM_SEARCH_CHARACTERS = 2;

  public judicialUserFieldFormControl: FormControl;
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
    this.judicialUserFieldFormControl = new FormControl('');
    this.formGroup.addControl('JudicialUserField', this.judicialUserFieldFormControl);
    this.sub = this.judicialUserFieldFormControl.valueChanges.pipe(
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
    // this.judicialUserFormControl.setValue(`${judicialUser.fullName} (${judicialUser.emailId})`);
		this.judicialUserFieldFormControl.setValue(judicialUser.idamId);
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
