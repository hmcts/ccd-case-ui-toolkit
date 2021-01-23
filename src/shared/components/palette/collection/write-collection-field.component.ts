import { Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { CaseField } from '../../../domain/definition/case-field.model';
import { Profile } from '../../../domain/profile';
import { FieldsUtils, ProfileNotifier } from '../../../services';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { RemoveDialogComponent } from '../../dialogs/remove-dialog/remove-dialog.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CollectionCreateCheckerService } from './collection-create-checker.service';

@Component({
  selector: 'ccd-write-collection-field',
  templateUrl: './write-collection-field.html',
  styleUrls: ['./collection-field.scss']
})
export class WriteCollectionFieldComponent extends AbstractFieldWriteComponent implements OnInit, OnDestroy {
  @Input()
  caseFields: CaseField[] = [];

  @Input()
  formGroup: FormGroup;

  formArray: FormArray;

  profile: Profile;
  profileSubscription: Subscription;

  @ViewChildren('collectionItem')
  private items: QueryList<ElementRef>;

  constructor(private dialog: MatDialog,
              private scrollToService: ScrollToService,
              private profileNotifier: ProfileNotifier,
              private createChecker: CollectionCreateCheckerService
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.isExpanded) { // meaning I am not rendered on the search/workbasket input filter
      this.profileSubscription = this.profileNotifier.profile.subscribe(_ => this.profile = _);
    }
    this.caseField.value = this.caseField.value || [];

    this.formArray = this.registerControl(new FormArray([]), true) as FormArray;
    this.formArray['caseField'] = this.caseField;
  }

  ngOnDestroy() {
    if (typeof this.profileSubscription !== 'undefined') {
      this.profileSubscription.unsubscribe();
    }
  }

  buildCaseField(item, index: number): CaseField {
    let cf: CaseField =  this.newCaseField(index, item);
    const c = new FormControl(item);
    FormValidatorsService.addValidators(cf, c);
    FieldsUtils.addCaseFieldAndComponentReferences(c, cf, this);
    if (index < this.formArray.length) {
      this.formArray.setControl(index, c);
    } else {
      this.formArray.push(c);
    }
    return cf;
  }

  private newCaseField(index: number, item) {
    return Object.assign(new CaseField(), {
      id: index.toString(),
      field_type: this.caseField.field_type.collection_field_type,
      display_context: this.isNotAuthorisedToUpdate(index) ? 'READONLY' : this.caseField.display_context,
      hidden: this.caseField.hidden,
      value: item.value,
      label: null,
      acls: this.caseField.acls
    });
  }

  buildIdPrefix(index: number): string {
    if ('Complex' === this.caseField.field_type.collection_field_type.type) {
      return this.idPrefix + this.caseField.id + '_' + index + '_';
    } else {
      return this.idPrefix + this.caseField.id + '_';
    }
  }

  addItem(doScroll: boolean): void {
    // Manually resetting errors is required to prevent `ExpressionChangedAfterItHasBeenCheckedError`
    this.formArray.setErrors(null);
    this.caseField.value.push({ value: null });
    // this.createChecker.setDisplayContextForChildren(this.caseField, this.profile);

    let lastIndex = this.caseField.value.length - 1;

    // Timeout is required for the collection item to be rendered before it can be scrolled to or focused.
    if (doScroll) {
      setTimeout(() => {
        this.scrollToService.scrollTo({
          target: this.buildIdPrefix(lastIndex) + lastIndex,
          duration: 1000,
          offset: -150,
        })
          .pipe(finalize(() => this.focusLastItem()))
          .subscribe(null, console.error);
      });
    } else {
      setTimeout(() => this.focusLastItem());
    }
  }

  private focusLastItem() {
    if (this.items.last.nativeElement.querySelector('.form-control')) {
      this.items.last.nativeElement.querySelector('.form-control').focus();
    }
  }

  removeItem(index: number): void {
    this.caseField.value.splice(index, 1);
    this.formArray.removeAt(index);
  }

  itemLabel(index: number) {
    let displayIndex = index + 1;
    return index ? `${this.caseField.label} ${displayIndex}` : this.caseField.label;
  }

  isNotAuthorisedToCreate() {
    if (this.isExpanded) {
      return false;
    }
    return !this.getCollectionPermission(this.caseField, 'allowInsert');
  }

  getCollectionPermission(field: CaseField, type: string) {
    return field.display_context_parameter &&
            field.display_context_parameter.split('#')
              .filter(item => item.startsWith('COLLECTION('))[0]
                .includes(type);
  }

  isNotAuthorisedToUpdate(index: number) {
    if (this.isExpanded) {
      return false;
    }
    const id = this.getControlIdAt(index);
    if (!!id) {
      if (!!this.profile.user && !!this.profile.user.idam) {
        return !this.profile.user.idam.roles.find(role => this.hasUpdateAccess(role));
      }
    }
    return true;
  }

  hasUpdateAccess(role: any): boolean {
    return !!this.caseField.acls.find( acl => acl.role === role && acl.update === true);
  }

  isNotAuthorisedToDelete(index: number) {
    if (this.isExpanded) {
      return false;
    }
    const id = this.getControlIdAt(index);
    return !!id && !this.getCollectionPermission(this.caseField, 'allowDelete');
  }

  openModal(i: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.ariaLabel = 'Label';
    dialogConfig.height = '220px';
    dialogConfig.width = '550px';
    dialogConfig.panelClass = 'dialog';

    dialogConfig.closeOnNavigation = false;
    dialogConfig.position = {
      top: window.innerHeight / 2 - 110 + 'px', left: window.innerWidth / 2 - 275 + 'px'
    };

    const dialogRef = this.dialog.open(RemoveDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Remove') {
        this.removeItem(i);
      }
    });
  }

  private getControlIdAt(index: number): string {
    // this.formArray contains [ FormControl, ... ].
    // Here, we need to get the id of the FormControl;
    const control = this.formArray.at(index);
    return control && control.value ? control.value.id : undefined;
  }

}
