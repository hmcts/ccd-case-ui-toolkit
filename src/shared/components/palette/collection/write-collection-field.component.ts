import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { RemoveDialogComponent } from '../../dialogs/remove-dialog/remove-dialog.component';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'ccd-write-collection-field',
  templateUrl: './write-collection-field.html',
  styleUrls: ['./collection-field.scss']
})
export class WriteCollectionFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  formArray: FormArray;

  @ViewChildren('collectionItem')
  private items: QueryList<ElementRef>;

  constructor(private formValidatorsService: FormValidatorsService,
              private dialog: MatDialog,
              private scrollToService: ScrollToService,
              ) {
    super();
  }

  ngOnInit(): void {
    this.caseField.value = this.caseField.value || [];

    this.formArray = this.registerControl(new FormArray([]));
  }

  buildCaseField(item, index: number): CaseField {
    return {
      id: index.toString(),
      field_type: this.caseField.field_type.collection_field_type,
      display_context: this.caseField.display_context,
      hidden: this.caseField.hidden,
      value: item.value,
      label: null
    };
  }

  buildControlRegistrer(id: string, index: number): (control: FormControl) => AbstractControl {
    return control => {
      if (this.formArray.at(index)) {
        return this.formArray.at(index).get('value');
      }
      this.formValidatorsService.addValidators(this.caseField, control);
      this.formArray.push(
        new FormGroup({
          id: new FormControl(id),
          value: control
        })
      );
      return control;
    };
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
    this.caseField.value.push({value: null});

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

}
