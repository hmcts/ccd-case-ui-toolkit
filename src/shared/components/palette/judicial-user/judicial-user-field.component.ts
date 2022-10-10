import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { JudicialUserModel } from '../../../domain/jurisdiction';
import { JurisdictionService } from '../../../services';
import { AbstractFieldReadComponent } from '../base-field';

@Component({
  selector: 'ccd-judicial-user-field',
  templateUrl: './judicial-user-field.component.html'
})
export class JudicialUserFieldComponent extends AbstractFieldReadComponent implements OnInit, OnDestroy {

  @Input() public selectedJudicialUser: string;
  @Input() public serviceId: string = 'DIVORCE';
  @Output() public emitJudicialUserSelected = new EventEmitter<JudicialUserModel>();

  public judicialUserFormControl: FormControl;
  public filteredJudicialUsers: JudicialUserModel[] = [];
  public readonly minSearchCharacters = 2;
  public showAutocomplete: boolean = false;
  public sub: Subscription;

  constructor(private readonly cd: ChangeDetectorRef,
              private readonly jurisdictionService: JurisdictionService) {
    super();
  }

  public ngOnInit(): void {
    this.judicialUserFormControl = new FormControl(this.selectedJudicialUser);
    this.formGroup.addControl('judicialUserFormControl', this.judicialUserFormControl);
    this.sub = this.judicialUserFormControl.valueChanges.pipe(
      tap(() => this.showAutocomplete = false),
      tap(() => this.filteredJudicialUsers = []),
      debounceTime(300),
      tap((searchTerm) => typeof searchTerm === 'string' ? this.emitJudicialUserSelected.emit(null) : void 0),
      filter((searchTerm: string) => searchTerm && searchTerm.length > this.minSearchCharacters),
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
    return this.jurisdictionService.searchJudicialUsers(searchTerm, this.serviceId);
  }

  public ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
