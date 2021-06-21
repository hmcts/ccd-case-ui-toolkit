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

type CollectionItem = {
  caseField: CaseField;
  item: any;
  prefix: string;
  index: number;
  container: FormGroup;
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

  constructor(private readonly dialog: MatDialog,
              private readonly scrollToService: ScrollToService,
              private readonly profileNotifier: ProfileNotifier
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
    this.caseField.value.forEach((item: any, index: number) => {
      const prefix: string = this.buildIdPrefix(index);
      const caseField = this.buildCaseField(item, index);
      const container = this.getContainer(index);
      if (this.collItems.length <= index) {
        this.collItems.length = index + 1;
      }
      this.collItems[index] = { caseField, item, prefix, index, container };
    });
  }

  ngOnDestroy() {
    if (typeof this.profileSubscription !== 'undefined') {
      this.profileSubscription.unsubscribe();
    }
  }

  buildCaseField(item, index: number, isNew = false): CaseField {
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

    let value;
    if (this.isCollectionOfSimpleType(this.caseField)) {
      value = group.get('value') as FormControl
      if (!value) {
        value = new FormControl(item.value);
        // Now add the value FormControl to the outer group.
        group.addControl('value', value);
      }
    } else {
      value = group.get('value') as FormGroup;
      if (!value) {
        value = new FormGroup({});
        for (const key of Object.keys(group.controls)) {
          value.addControl(key, group.get(key));
          // DON'T remove the control for this key from the outer group or it
          // goes awry. So DON'T uncomment the below line!
          // group.removeControl(key);
        }
        // Now add the value FormGroup to the outer group.
        group.addControl('value', value);
      }
    }
    let id = group.get('id') as FormControl;
    // If we're not in scenario 3, above, we need to do some jiggery pokery
    // and set up the id and value controls.
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
    let cfid: string;
    if (value instanceof FormControl) {
      cfid = 'value';
    } else {
      cfid = index.toString();
    }

    // isNew:
    let cf: CaseField = this.newCaseField(cfid, item, index, isNew);
    FormValidatorsService.addValidators(cf, value);
    FieldsUtils.addCaseFieldAndComponentReferences(value, cf, this);
    return cf;
  }

  private newCaseField(id: string, item, index, isNew = false) {
    const isNotAuthorisedToUpdate = !isNew && this.isNotAuthorisedToUpdate(index);
    // Remove the bit setting the hidden flag here as it's an item in the array and
    // its hidden state isn't independently re-evaluated when the form is changed.
    return plainToClassFromExist(new CaseField(), {
      id,
      field_type: this.caseField.field_type.collection_field_type,
      display_context: isNotAuthorisedToUpdate ? 'READONLY' : this.caseField.display_context,
      value: item.value,
      label: null,
      acls: this.caseField.acls
    });
  }

  buildIdPrefix(index: number): string {
    const prefix = `${this.idPrefix}${this.caseField.id}_`;
    if (this.caseField.field_type.collection_field_type.type === 'Complex') {
      return `${prefix}${index}_`;
    }
    return prefix;
  }

  private getContainer(index: number): FormGroup {
    const value = this.formArray.at(index).get('value');
    if (value instanceof FormGroup) {
      return value;
    } else {
      return this.formArray.at(index) as FormGroup;
    }
  }

  public isSearchFilter(): boolean {
    return this.isInSearchBlock && this.collItems.length > 0;
  }

  public addItem(doScroll: boolean): void {
    // Manually resetting errors is required to prevent `ExpressionChangedAfterItHasBeenCheckedError`
    this.formArray.setErrors(null);
    const item = { value: null }
    this.caseField.value.push(item);
    const index = this.caseField.value.length - 1;
    const caseField: CaseField = this.buildCaseField(item, index, true);
    const prefix = this.buildIdPrefix(index);
    const container = this.getContainer(index);
    this.collItems.push({ caseField, item, index, prefix, container });

    // Timeout is required for the collection item to be rendered before it can be scrolled to or focused.
    if (doScroll) {
      setTimeout(() => {
        this.scrollToService.scrollTo({
          target: `${this.buildIdPrefix(index)}${index}`,
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
    const item: any = this.items.last.nativeElement.querySelector('.form-control');
    if (item) {
      item.focus();
    }
  }

  removeItem(index: number): void {
    this.caseField.value.splice(index, 1);
    this.collItems.splice(index, 1);
    this.formArray.removeAt(index);
  }

  itemLabel(index: number) {
    if (index) {
      return `${this.caseField.label} ${index + 1}`;
    }
    return this.caseField.label;
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

  isNotAuthorisedToUpdate(index) {
    if (this.isExpanded) {
      return false;
    }
    // Was reassesed as part of EUI-3505. There is still a caveat around CRD, but that was deemed an unlikely scenario
    const id = this.getControlIdAt(index);
    if (id) {
      if (!!this.profile.user && !!this.profile.user.idam) {
        const updateRole = this.profile.user.idam.roles.find(role => this.hasUpdateAccess(role));
        return !updateRole;
      }
    }
    return false;
  }

  hasUpdateAccess(role: any): boolean {
    return !!this.caseField.acls.find( acl => acl.role === role && acl.update === true);
  }

  isNotAuthorisedToDelete(index: number) {
    if (this.isExpanded) {
      return false;
    }
    // Should be able to delete if creating a case even if "D" is absent, hence:
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
   * Applied full solution as part of EUI-3505
   */
  private getControlIdAt(index: number): string {

    // this.formArray contains [ FormGroup( id: FormControl, value: FormGroup ), ... ].
    // Here, we need to get the value of the id FormControl.
    const group: FormGroup = this.formArray.at(index) as FormGroup;
    const control: FormControl = group.get('id') as FormControl;
    return control ? control.value : undefined;
  }

  private isCollectionOfSimpleType(caseField: CaseField) {
    const notSimple = ['Collection', 'Complex'];
    return notSimple.indexOf( caseField.field_type.collection_field_type.type ) < 0;
  }
}
