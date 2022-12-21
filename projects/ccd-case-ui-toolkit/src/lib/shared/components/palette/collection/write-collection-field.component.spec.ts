import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { MockComponent } from 'ng2-mock-component';
import { BehaviorSubject, of } from 'rxjs';

import { CaseField, FieldType } from '../../../domain/definition';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { ProfileNotifier } from '../../../services';
import { FormValidatorsService } from '../../../services/form';
import { RemoveDialogComponent } from '../../dialogs/remove-dialog';
import { PaletteUtilsModule } from '../utils';
import { CollectionCreateCheckerService } from './collection-create-checker.service';
import { WriteCollectionFieldComponent } from './write-collection-field.component';

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
const $WRITE_FIELDS = By.css('ccd-field-write');
const $ADD_BUTTON_TOP = By.css('.write-collection-add-item__top');
const $ADD_BUTTON_BOTTOM = By.css('.write-collection-add-item__bottom');
const $REMOVE_BUTTONS = By.css('.collection-title .button.button-secondary');

const fieldWriteComponent = MockComponent({
  selector: 'ccd-field-write',
  inputs: ['caseField', 'caseFields', 'formGroup', 'idPrefix', 'isExpanded', 'parent', 'isInSearchBlock']
});
const fieldReadComponent = MockComponent({
  selector: 'ccd-field-read',
  inputs: ['caseField', 'caseFields', 'formGroup', 'context']
});

describe('WriteCollectionFieldComponent', () => {
  let fixture: ComponentFixture<WriteCollectionFieldComponent>;
  let component: WriteCollectionFieldComponent;
  let de: DebugElement;
  let formValidatorService: any;
  let dialog: any;
  let dialogRef: any;
  let scrollToService: any;
  let profileNotifier: any;
  let caseField: CaseField;
  let formGroup: FormGroup;
  let collectionCreateCheckerService: CollectionCreateCheckerService;

  beforeEach(waitForAsync(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    dialogRef = createSpyObj<MatDialogRef<RemoveDialogComponent>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of());
    dialog = createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);
    scrollToService = createSpyObj<ScrollToService>('scrollToService', ['scrollTo']);
    scrollToService.scrollTo.and.returnValue(of());
    caseField = (({
      id: FIELD_ID,
      label: 'X',
      field_type: SIMPLE_FIELD_TYPE,
      display_context: 'OPTIONAL',
      display_context_parameter: '#COLLECTION(allowInsert)',
      value: VALUES.slice(0),
      acls: [
        {
          role: 'caseworker-divorce',
          create: true,
          read: true,
          update: true,
          delete: true
        }
      ]
    }) as CaseField);
    formGroup = new FormGroup({
      field1: new FormControl()
    });

    profileNotifier = new ProfileNotifier();
    profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();

    collectionCreateCheckerService = new CollectionCreateCheckerService();

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteCollectionFieldComponent,
          fieldWriteComponent,
          fieldReadComponent
        ],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorService },
          { provide: MatDialog, useValue: dialog },
          { provide: ScrollToService, useValue: scrollToService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: CollectionCreateCheckerService, useValue: collectionCreateCheckerService },
          RemoveDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteCollectionFieldComponent);
    component = fixture.componentInstance;
    component.caseField = caseField;
    component.caseFields = [caseField];
    component.formGroup = formGroup;
    component.ngOnInit();
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should render a row with a write field for each items', () => {
    const writeFields = de.queryAll($WRITE_FIELDS);

    expect(writeFields.length).toEqual(2);
  });

  it('should pass ID, type and value to child field', () => {
    const field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;

    expect(field1.caseField.id).toEqual('value');
    expect(field1.caseField.value).toEqual(VALUES[0].value);
    expect(field1.caseField.field_type instanceof FieldType).toBeTruthy();
    expect(field1.caseField.field_type.id).toEqual(SIMPLE_FIELD_TYPE.collection_field_type.id);
    expect(field1.caseField.field_type.type).toEqual(SIMPLE_FIELD_TYPE.collection_field_type.type);
  });

  it('should pass ID prefix without index when simple type', () => {
    const field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;
    const field2 = de.queryAll($WRITE_FIELDS)[1].componentInstance;

    expect(field1.idPrefix).toEqual(`${caseField.id}_`);
    expect(field2.idPrefix).toEqual(`${caseField.id}_`);
  });

  it('should pass ID prefix with index when Complex type', () => {
    caseField.field_type = COMPLEX_FIELD_TYPE;
    component.ngOnInit();
    fixture.detectChanges();

    const field1 = de.queryAll($WRITE_FIELDS)[0].componentInstance;
    const field2 = de.queryAll($WRITE_FIELDS)[1].componentInstance;

    expect(field1.idPrefix).toEqual(`${caseField.id}_${0}_`);
    expect(field2.idPrefix).toEqual(`${caseField.id}_${1}_`);
  });

  it('should add empty item to collection when add button is clicked', () => {
    const addButton = de.query($ADD_BUTTON_TOP);

    addButton.nativeElement.click();
    fixture.detectChanges();

    const writeFields = de.queryAll($WRITE_FIELDS);

    expect(writeFields.length).toEqual(3);

    const addedField = writeFields[2].componentInstance;

    // Show empty case field
    expect(addedField.caseField.id).toEqual('value');
    expect(addedField.caseField.value).toBeNull();
    expect(addedField.caseField.field_type instanceof FieldType).toBeTruthy();
    expect(addedField.caseField.field_type.id).toEqual(SIMPLE_FIELD_TYPE.collection_field_type.id);
    expect(addedField.caseField.field_type.type).toEqual(SIMPLE_FIELD_TYPE.collection_field_type.type);
  });

  it('should scroll when item added with top button', waitForAsync(() => {
    const addButton = de.query($ADD_BUTTON_TOP);

    addButton.nativeElement.dispatchEvent(new Event('click'));

    const writeFields = de.queryAll($WRITE_FIELDS);
    const lastIndex = writeFields.length;

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(scrollToService.scrollTo).toHaveBeenCalledWith({
        target: `${FIELD_ID}_${lastIndex}`,
        duration: 1000,
        offset: -150,
      });
    });
  }));

  it('should NOT scroll when item added with bottom button', waitForAsync(() => {
    const addButton = de.query($ADD_BUTTON_BOTTOM);

    addButton.nativeElement.click();
    fixture.detectChanges();

    expect(scrollToService.scrollTo).not.toHaveBeenCalled();
  }));

  it('should have 1 Remove button per item', () => {
    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    expect(removeButtons.length).toBe(VALUES.length);
  });

  it('should display removal confirmation dialog when remove button is clicked', () => {
    const tempCaseField = ({
      ...caseField,
      display_context_parameter: '#COLLECTION(allowInsert,allowDelete)'
    }) as CaseField;
    component.caseFields = [tempCaseField];
    component.caseField = tempCaseField;
    component.ngOnInit();
    fixture.detectChanges();
    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    const removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(RemoveDialogComponent, any(Object));
  });

  it('should remove item from collection when remove button is clicked and confirmed', () => {
    const tempCaseField = ({
      ...caseField,
      display_context_parameter: '#COLLECTION(allowInsert,allowDelete)'
    }) as CaseField;
    component.caseField = tempCaseField;
    component.caseFields = [tempCaseField];
    fixture.detectChanges();
    // Confirm removal through mock dialog
    dialogRef.afterClosed.and.returnValue(of('Remove'));

    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    const removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    const writeFields = de.queryAll($WRITE_FIELDS);
    expect(writeFields.length).toBe(VALUES.length - 1);

    expect(component.formArray.controls.length).toBe(1);
    expect(component.formArray.controls[0].value).toEqual(VALUES[1]);
  });

  it('should NOT remove item from collection when remove button is clicked and declined', () => {
    // Declined removal through mock dialog
    dialogRef.afterClosed.and.returnValue(of('Cancel'));

    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    const removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    const writeFields = de.queryAll($WRITE_FIELDS);
    expect(writeFields.length).toBe(VALUES.length);
  });

  it('should handle null or undefined values as empty array', () => {
    caseField.value = null;
    component.ngOnInit();
    fixture.detectChanges();

    const fields = de.queryAll($WRITE_FIELDS);
    expect(fields.length).toBe(0);
  });
});

describe('WriteCollectionFieldComponent CRUD impact', () => {
  const collectionValues = [
    {
      id: '123',
      value: 'v1'
    },
    {
      value: 'v2'
    }
  ];

  let fixture: ComponentFixture<WriteCollectionFieldComponent>;
  let component: WriteCollectionFieldComponent;
  let de: DebugElement;
  let formValidatorService: any;
  let dialog: any;
  let dialogRef: any;
  let scrollToService: any;
  let profileNotifier: any;
  let caseField: CaseField;
  let formGroup: FormGroup;
  let collectionCreateCheckerService: CollectionCreateCheckerService;

  beforeEach(waitForAsync(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    dialogRef = createSpyObj<MatDialogRef<RemoveDialogComponent>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of());
    dialog = createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);
    scrollToService = createSpyObj<ScrollToService>('scrollToService', ['scrollTo']);
    scrollToService.scrollTo.and.returnValue(of());
    caseField = (({
      id: FIELD_ID,
      label: 'X',
      field_type: SIMPLE_FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: collectionValues.slice(),
      acls: [
        {
          role: 'caseworker-divorce',
          create: false,
          read: true,
          update: true,
          delete: false
        }
      ]
    }) as CaseField);
    formGroup = new FormGroup({
      field1: new FormControl()
    });

    profileNotifier = new ProfileNotifier();
    profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();

    collectionCreateCheckerService = new CollectionCreateCheckerService();

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteCollectionFieldComponent,
          fieldWriteComponent,
          fieldReadComponent
        ],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorService },
          { provide: MatDialog, useValue: dialog },
          { provide: ScrollToService, useValue: scrollToService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: CollectionCreateCheckerService, useValue: collectionCreateCheckerService },
          RemoveDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteCollectionFieldComponent);
    component = fixture.componentInstance;
    component.caseField = caseField;
    component.caseFields = [caseField];
    component.formGroup = formGroup;
    component.ngOnInit();
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should disable remove buttons when user does not have DELETE right', () => {
    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    expect(removeButtons[0].nativeElement.disabled).toBe(true);
  });

  it('should not disable remove buttons for newly added items even when user does not have DELETE right', () => {
    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    expect(removeButtons[1].nativeElement.disabled).toBe(false);
  });

  it('should disable add button when user does not have CREATE right', () => {
    const addButton = de.query($ADD_BUTTON_TOP);

    expect(addButton.nativeElement.disabled).toBe(true);
  });

  it('should render a row with a write field for each items', () => {
    const writeFields = de.queryAll($WRITE_FIELDS);

    expect(writeFields.length).toEqual(2);
  });
});

describe('WriteCollectionFieldComponent CRUD impact - Update False', () => {
  const USER_HAS_UPDATE_ROLE = false;
  const collectionValues = [
    {
      id: '123',
      value: 'v1'
    },
    {
      id: '456',
      value: 'v2'
    }
  ];

  let fixture: ComponentFixture<WriteCollectionFieldComponent>;
  let component: WriteCollectionFieldComponent;
  let de: DebugElement;
  let formValidatorService: any;
  let dialog: any;
  let dialogRef: any;
  let scrollToService: any;
  let profileNotifier: any;
  let caseField: CaseField;
  let formGroup: FormGroup;
  let collectionCreateCheckerService: CollectionCreateCheckerService;

  beforeEach(waitForAsync(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    dialogRef = createSpyObj<MatDialogRef<RemoveDialogComponent>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of());
    dialog = createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);
    scrollToService = createSpyObj<ScrollToService>('scrollToService', ['scrollTo']);
    scrollToService.scrollTo.and.returnValue(of());
    caseField = (({
      id: FIELD_ID,
      label: 'X',
      field_type: SIMPLE_FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: collectionValues,
      acls: [
        {
          role: 'caseworker-divorce',
          create: false,
          read: true,
          update: USER_HAS_UPDATE_ROLE,
          delete: false
        }
      ]
    }) as CaseField);
    formGroup = new FormGroup({
      field1: new FormControl()
    });

    profileNotifier = new ProfileNotifier();
    profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();

    collectionCreateCheckerService = new CollectionCreateCheckerService();

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteCollectionFieldComponent,
          fieldWriteComponent,
          fieldReadComponent
        ],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorService },
          { provide: MatDialog, useValue: dialog },
          { provide: ScrollToService, useValue: scrollToService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: CollectionCreateCheckerService, useValue: collectionCreateCheckerService },
          RemoveDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteCollectionFieldComponent);
    component = fixture.componentInstance;
    component.caseField = caseField;
    component.caseFields = [caseField];
    component.formGroup = formGroup;
    component.ngOnInit();
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should change the displayContext to READONLY when user does not have update right', () => {
    const collectionItem = collectionValues[0];

    const updatedCaseField = component.buildCaseField(collectionItem, 0);

    expect(updatedCaseField.display_context).toEqual('READONLY');
  });
});

describe('WriteCollectionFieldComponent remove component from collection', () => {
  let fixture: ComponentFixture<WriteCollectionFieldComponent>;
  let component: WriteCollectionFieldComponent;
  let de: DebugElement;
  let formValidatorService: any;
  let dialog: any;
  let dialogRef: any;
  let scrollToService: any;
  let profileNotifier: any;
  let caseField: CaseField;
  let formGroup: FormGroup;
  let collectionCreateCheckerService: CollectionCreateCheckerService;

  beforeEach(waitForAsync(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    dialogRef = createSpyObj<MatDialogRef<RemoveDialogComponent>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of());
    dialog = createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);
    scrollToService = createSpyObj<ScrollToService>('scrollToService', ['scrollTo']);
    scrollToService.scrollTo.and.returnValue(of());
    caseField = (({
      id: FIELD_ID,
      label: 'X',
      field_type: COMPLEX_FIELD_TYPE,
      display_context: 'OPTIONAL',
      display_context_parameter: '#COLLECTION(allowInsert)',
      value: VALUES.slice(0),
      acls: [
        {
          role: 'caseworker-divorce',
          create: true,
          read: true,
          update: true,
          delete: true
        }
      ]
    }) as CaseField);
    formGroup = new FormGroup({
      field1: new FormControl()
    });

    profileNotifier = new ProfileNotifier();
    profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();

    collectionCreateCheckerService = new CollectionCreateCheckerService();

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteCollectionFieldComponent,
          fieldWriteComponent,
          fieldReadComponent
        ],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorService },
          { provide: MatDialog, useValue: dialog },
          { provide: ScrollToService, useValue: scrollToService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: CollectionCreateCheckerService, useValue: collectionCreateCheckerService },
          RemoveDialogComponent
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteCollectionFieldComponent);
    component = fixture.componentInstance;
    component.caseField = caseField;
    component.caseFields = [caseField];
    component.formGroup = formGroup;
    component.ngOnInit();
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should remove item from collection when remove button is clicked and update the index', () => {
    const tempCaseField = ({
      ...caseField,
      display_context_parameter: '#COLLECTION(allowInsert,allowDelete)'
    }) as CaseField;
    component.caseField = tempCaseField;
    component.caseFields = [tempCaseField];
    fixture.detectChanges();
    // Confirm removal through mock dialog
    dialogRef.afterClosed.and.returnValue(of('Remove'));

    const removeButtons = de.queryAll($REMOVE_BUTTONS);

    const removeFirstButton = removeButtons[0];
    removeFirstButton.nativeElement.click();
    fixture.detectChanges();

    const writeFields = de.queryAll($WRITE_FIELDS);
    expect(writeFields.length).toBe(VALUES.length - 1);
    expect(component.formArray.controls.length).toBe(1);
    expect(component.formArray['component'].collItems[0].index).toEqual(0);
    expect(component.formArray['component'].collItems[0].caseField.id).toEqual('0');
    expect(component.formArray['component'].collItems[0].prefix).toEqual('Values_0_');
  });
});
