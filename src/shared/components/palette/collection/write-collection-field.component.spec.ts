import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WriteCollectionFieldComponent } from './write-collection-field.component';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { of } from 'rxjs';
import { RemoveDialogComponent } from '../../dialogs/remove-dialog/remove-dialog.component';
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;

const FIELD_ID = 'Values';
const SIMPLE_FIELD_TYPE: FieldType = {
  id: 'Text',
  type: 'Collection',
  collection_field_type: {
    id: 'Text',
    type: 'Text'
  }
};

const COMPLEX_FIELD_TYPE: FieldType = {
  id: 'Address',
  type: 'Collection',
  collection_field_type: {
    id: 'Address',
    type: 'Complex'
  }
};
const VALUES = [
  {
    id: '123',
    value: 'v1'
  },
  {
    id: '456',
    value: 'v2'
  }
];

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteCollectionFieldComponent', () => {

  const $WRITE_FIELDS = By.css('ccd-field-write');
  const $ADD_BUTTON_TOP = By.css('.form-group>.panel>.button:nth-of-type(1)');
  const $ADD_BUTTON_BOTTOM = By.css('.form-group>.panel>.button:nth-of-type(2)');
  const $REMOVE_BUTTONS = By.css('.collection-title .button.button-secondary');

  let FieldWriteComponent = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'registerControl', 'idPrefix', 'isExpanded'],
    template: '<input type="text" />',
  });

  let fixture: ComponentFixture<WriteCollectionFieldComponent>;
  let component: WriteCollectionFieldComponent;

  let de: DebugElement;
  let formValidatorService: any;
  let dialog: any;
  let dialogRef: any;
  let scrollToService: any;

  let caseField: CaseField;

  beforeEach(async(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    dialogRef = createSpyObj<MatDialogRef<RemoveDialogComponent>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of());
    dialog = createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);
    scrollToService = createSpyObj<ScrollToService>('scrollToService', ['scrollTo']);
    scrollToService.scrollTo.and.returnValue(of());

    caseField = {
      id: FIELD_ID,
      label: 'X',
      field_type: SIMPLE_FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: VALUES.slice(0)
    };

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteCollectionFieldComponent,
          // Mock
          FieldWriteComponent,
        ],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorService },
          { provide: MatDialog, useValue: dialog },
          { provide: ScrollToService, useValue: scrollToService },
          RemoveDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteCollectionFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
    component.caseField = caseField;

    component.ngOnInit();

    de = fixture.debugElement;
    fixture.detectChanges();

    // Manually populate the form array as item field are mocked and can't register themselves
    VALUES.forEach((collectionItem, index) => {
      component.buildControlRegistrer(collectionItem.id, index)(new FormControl(collectionItem.value));
    });

    fixture.detectChanges();
  }));

  it('should render a row with a write field for each items', () => {
    let writeFields = de.queryAll($WRITE_FIELDS);

    expect(writeFields.length).toEqual(2);
  });

  it('should pass ID, type and value to child field', () => {
    let field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;

    expect(field1.caseField.id).toEqual('0');
    expect(field1.caseField.value).toEqual(VALUES[0].value);
    expect(field1.caseField.field_type).toEqual(SIMPLE_FIELD_TYPE.collection_field_type);
  });

  it('should pass ID prefix without index when simple type', () => {
    let field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;
    let field2 = de.queryAll($WRITE_FIELDS)[1].componentInstance;

    expect(field1.idPrefix).toEqual(caseField.id + '_');
    expect(field2.idPrefix).toEqual(caseField.id + '_');
  });

  it('should pass ID prefix with index when Complex type', () => {
    caseField.field_type = COMPLEX_FIELD_TYPE;
    component.ngOnInit();
    fixture.detectChanges();

    let field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;
    let field2 = de.queryAll($WRITE_FIELDS)[1].componentInstance;

    expect(field1.idPrefix).toEqual(caseField.id + '_' + 0 + '_');
    expect(field2.idPrefix).toEqual(caseField.id + '_' + 1 + '_');
  });

  it('should pass valid `registerControl` function registering control as value of item', () => {
    // Reset form array
    component.ngOnInit();
    fixture.detectChanges();

    let field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;

    expect(component.formArray.controls.length).toBe(0);

    const control = new FormControl('x');
    field1.registerControl(control);

    expect(component.formArray.controls.length).toBe(1);
    expect(component.formArray.get('0.value')).toBe(control);
  });

  it('should add empty item to collection when add button is clicked', () => {
    let addButton = de.query($ADD_BUTTON_TOP);

    addButton.nativeElement.click();
    fixture.detectChanges();

    let writeFields = de.queryAll($WRITE_FIELDS);

    expect(writeFields.length).toEqual(3);

    let addedField = writeFields[2].componentInstance;

    // Show empty case field
    expect(addedField.caseField.id).toEqual('2');
    expect(addedField.caseField.value).toBeNull();
    expect(addedField.caseField.field_type).toEqual(SIMPLE_FIELD_TYPE.collection_field_type);
  });

  it('should focus 1st input of newly added item', done => {
    let addButton = de.query($ADD_BUTTON_TOP);

    addButton.nativeElement.click();
    fixture.detectChanges();

    let writeFields = de.queryAll($WRITE_FIELDS);
    let lastWriteField = writeFields[writeFields.length - 1];

    let lastFieldInput = lastWriteField.query(By.css('input'));

    setTimeout(() => {
      // Timeout required for focus to be effective
      expect(lastFieldInput.nativeElement).toBe(document.activeElement);
      done();
    });
  });

  it('should scroll when item added with top button', done => {
    let addButton = de.query($ADD_BUTTON_TOP);

    addButton.nativeElement.click();
    fixture.detectChanges();

    let writeFields = de.queryAll($WRITE_FIELDS);
    let lastIndex = writeFields.length - 1;

    setTimeout(() => {
      expect(scrollToService.scrollTo).toHaveBeenCalledWith({
        target: `${FIELD_ID}_${lastIndex}`,
        duration: 1000,
        offset: -150,
      });
      done();
    });
  });

  it('should NOT scroll when item added with bottom button', done => {
    let addButton = de.query($ADD_BUTTON_BOTTOM);

    addButton.nativeElement.click();
    fixture.detectChanges();

    setTimeout(() => {
      expect(scrollToService.scrollTo).not.toHaveBeenCalled();
      done();
    });
  });

  it('should have 1 Remove button per item', () => {
    let removeButtons = de.queryAll($REMOVE_BUTTONS);

    expect(removeButtons.length).toBe(VALUES.length);
  });

  it('should display removal confirmation dialog when remove button is clicked', () => {
    let removeButtons = de.queryAll($REMOVE_BUTTONS);

    let removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(RemoveDialogComponent, any(Object));
  });

  it('should remove item from collection when remove button is clicked and confirmed', () => {
    // Confirm removal through mock dialog
    dialogRef.afterClosed.and.returnValue(of('Remove'));

    let removeButtons = de.queryAll($REMOVE_BUTTONS);

    let removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    let writeFields = de.queryAll($WRITE_FIELDS);
    expect(writeFields.length).toBe(VALUES.length - 1);

    let field2 = writeFields[0].componentInstance;
    expect(field2.caseField.id).toEqual('0');
    expect(field2.caseField.value).toEqual(VALUES[1].value);
    expect(component.formArray.controls.length).toBe(1);
    expect(component.formArray.controls[0].value).toEqual(VALUES[1]);
  });

  it('should NOT remove item from collection when remove button is clicked and declined', () => {
    // Declined removal through mock dialog
    dialogRef.afterClosed.and.returnValue(of('Cancel'));

    let removeButtons = de.queryAll($REMOVE_BUTTONS);

    let removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    let writeFields = de.queryAll($WRITE_FIELDS);
    expect(writeFields.length).toBe(VALUES.length);
  });

  it('should handle null or undefined values as empty array', () => {
    caseField.value = null;
    component.ngOnInit();
    fixture.detectChanges();

    let fields = de.queryAll($WRITE_FIELDS);
    expect(fields.length).toBe(0);
  });
});
