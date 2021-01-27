import { Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { plainToClassFromExist } from 'class-transformer';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { CaseField } from '../../../domain/definition/case-field.model';
import { Profile } from '../../../domain/profile';
import { FieldsUtils, ProfileNotifier } from '../../../services';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { RemoveDialogComponent } from '../../dialogs/remove-dialog/remove-dialog.component';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CollectionCreateCheckerService } from './collection-create-checker.service';

type CollectionItem = {
  caseField: CaseField;
  item: any;
  prefix: string;
  index: number;
}

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
  private collItems: CollectionItem[] = [];

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
    this.caseField.value.forEach((val, ix ) => {
      const pre: string = (this.buildIdPrefix(ix));
      const cf = this.buildCaseField(val, ix);
      if (this.collItems.length <= ix) {
        this.collItems.length = ix + 1;
      }
      this.collItems[ix] = {caseField: cf, item: val, prefix: pre, index: ix};
    });
  }

  ngOnDestroy() {
    if (typeof this.profileSubscription !== 'undefined') {
      this.profileSubscription.unsubscribe();
    }
  }

  buildCaseField(item, index: number): CaseField {
    /**
     * What follow is code that makes me want to go jump in the shower!
     * Basically, we land in here repeatedly because of the binding, and
     * this is what appears to be happening:
     *   1. this.formArray contains no controls at all.
     *      this.formArray.value = [];
     *   2. this.formArray contains a FormGroup, which contains a single
     *      FormControl with the id 'code'.
     *      this.formArray.value = [{ code: null }]
     *   3. this.formArray contains what is being set up below.
     *      this.formArray.value = [{ code: null, id: null, value: { code: null } }]
     *   4, 5, 6, etc - the same as 3.
     */
    let group: FormGroup;
    if (this.formArray && (index < this.formArray.length)) {
      group = this.formArray.at(index) as FormGroup;
    } else {
      group = new FormGroup({});
    }

    let value = group.get('value') as FormGroup;
    let id = group.get('id') as FormControl;
    // If we're not in scenario 3, above, we need to do some jiggery pokery
    // and set up the id and value controls.
    if (!value) {
      value = new FormGroup({});
      // Copy any controls currently in the outer group into the newly-created
      // value FormGroup.
      for (const key of Object.keys(group.controls)) {
        value.addControl(key, group.get(key));
        // DON'T remove the control for this key from the outer group or it
        // goes awry. So DON'T uncomment the below line!
        // group.removeControl(key);
      }
      // Now add the value FormGroup to the outer group.
      group.addControl('value', value);
    }
    // Also set up an id control if it doesn't yet exist.
    if (!id) {
      id = new FormControl(item.id);
      group.addControl('id', id);
    }

    /**
     * Again, very sorry. I've not found a better way to produce the
     * output needed for what needs to be sent to the server yet.
     */

    // Now, add the outer group to the array (or replace it).
    if (index < this.formArray.length) {
      this.formArray.setControl(index, group);
    } else {
      this.formArray.push(group);
    }

    // Now set up the CaseField and validation.
    let cf: CaseField = this.newCaseField(index, item);
    FormValidatorsService.addValidators(cf, value);
    FieldsUtils.addCaseFieldAndComponentReferences(value, cf, this);
    return cf;
  }

  private newCaseField(index: number, item) {
    const isNotAuthorisedToUpdate = this.isNotAuthorisedToUpdate(index);
    return plainToClassFromExist(new CaseField(), {
      id: index.toString(),
      field_type: this.caseField.field_type.collection_field_type,
      display_context: isNotAuthorisedToUpdate ? 'READONLY' : this.caseField.display_context,
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
    const item = { value: null }
    this.caseField.value.push(item);
    // this.createChecker.setDisplayContextForChildren(this.caseField, this.profile);

    let lastIndex = this.caseField.value.length - 1;
    const cf: CaseField = this.buildCaseField(item, lastIndex);
    const pre = this.buildIdPrefix(lastIndex);
    this.collItems.push({caseField: cf, item: item, index: lastIndex, prefix: pre});

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
    this.collItems.splice(index, 1);
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
    // TODO: Reassess the logic around the id when we know what the behaviour should actually
    // be as what was in place prevents creation of new items as it shows a readonly field
    // rather than an writable component.
    // const id = this.getControlIdAt(index);
    // if (!!id) {
      if (!!this.profile.user && !!this.profile.user.idam) {
        const updateRole = this.profile.user.idam.roles.find(role => this.hasUpdateAccess(role));
        return !updateRole;
      }
    // }
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

  /**
   * TODO: Sort out the logic necessary for this once and for all.
   */
  private getControlIdAt(index: number): string {
    // For the moment, simply return undefined.
    return undefined;

    // What is commented out below the return statement works, except
    // the id is always null for a newly-created entry, which means it
    // displays as a readonly field since it appears to require an id
    // in order to be updatable or deletable, which doesn't seem right.

    // this.formArray contains [ FormGroup( id: FormControl, value: FormGroup ), ... ].
    // Here, we need to get the value of the id FormControl.
    // const group: FormGroup = this.formArray.at(index) as FormGroup;
    // const control: FormControl = group.get('id') as FormControl;
    // return control ? control.value : undefined;
  }

}
